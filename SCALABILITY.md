# Scalability Notes

This document outlines how this project can be scaled from a single-server setup to a production-grade, highly available system.

---

## Current Architecture

```
Client (React) → Express API → PostgreSQL
```

Simple single-server setup suitable for development and small-scale usage.

---

## Phase 1 — Vertical Scaling

The first step is to optimize the existing single server before adding complexity.

**Database connection pooling**
Sequelize already uses connection pooling (configured in `config/db.js`):
```js
pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
```
This allows multiple concurrent DB queries without opening a new connection each time.

**Database indexing**
The `tasks` table has indexes on `userId` and `status` to speed up frequent queries:
```js
indexes: [
  { fields: ['userId'] },
  { fields: ['status'] },
]
```

**Request size limiting**
Body size is capped at 10kb to prevent large payload attacks and reduce memory pressure.

---

## Phase 2 — Horizontal Scaling

When a single server can no longer handle the load, we scale horizontally.

**Load balancer (Nginx)**

```
Client → Nginx Load Balancer → [Server 1, Server 2, Server 3] → PostgreSQL
```

Nginx distributes incoming requests across multiple Express instances using round-robin or least-connections strategy.

Nginx config example:
```nginx
upstream api_servers {
  least_conn;
  server api1:5000;
  server api2:5000;
  server api3:5000;
}
```

**Stateless JWT**
Since we use JWT (stateless tokens) instead of server-side sessions, any server instance can verify any request without shared session storage. This makes horizontal scaling seamless.

---

## Phase 3 — Caching with Redis

Repeated database reads for the same data waste resources. Redis caches frequently accessed data in memory.

**What to cache:**
- GET /api/v1/tasks — cache user's task list for 60 seconds
- GET /api/v1/auth/me — cache user profile for 5 minutes
- Rate limiting counters — use Redis instead of in-memory for distributed rate limiting

**Implementation example:**
```js
const redis = require('redis');
const client = redis.createClient();

const getCachedTasks = async (userId) => {
  const cached = await client.get(`tasks:${userId}`);
  if (cached) return JSON.parse(cached);

  const tasks = await Task.findAll({ where: { userId } });
  await client.setEx(`tasks:${userId}`, 60, JSON.stringify(tasks));
  return tasks;
};
```

**Cache invalidation:**
Clear the cache whenever a task is created, updated or deleted:
```js
await client.del(`tasks:${userId}`);
```

---

## Phase 4 — Microservices Architecture

As the application grows, split into independent services:

```
Client
↓
API Gateway (Nginx / Kong)
↓
┌─────────────┬──────────────┬───────────────┐
│ Auth Service│ Task Service │ Notification  │
│ :5001       │ :5002        │ Service :5003 │
└─────────────┴──────────────┴───────────────┘
↓              ↓
Users DB       Tasks DB
(Postgres)     (Postgres)
```

**Benefits:**
- Each service deploys and scales independently
- Auth service failure doesn't bring down Task service
- Teams can work on services independently

**Communication:**
- Synchronous: REST or gRPC between services
- Asynchronous: Message queue (RabbitMQ / Kafka) for non-critical events like email notifications

---

## Phase 5 — Container Orchestration

**Docker** (already configured in this project)
Packages each service into a container with all its dependencies.

**Kubernetes**
Manages containers at scale:
- Auto-restarts failed containers
- Auto-scales based on CPU/memory usage
- Rolling deployments with zero downtime

```yaml
# Example Kubernetes HPA (Horizontal Pod Autoscaler)
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          averageUtilization: 70
```

---

## Phase 6 — Database Scaling

**Read replicas**
Write to primary DB, read from replicas to distribute load:

```
Primary DB (writes) → Replica 1 (reads)
→ Replica 2 (reads)
```

**Database sharding**
Split data across multiple databases by userId range or hash for very large datasets.

**Connection pooling with PgBouncer**
Manages thousands of client connections efficiently without overwhelming PostgreSQL.

---

## Monitoring & Logging

**Logging** (Winston)
```js
const winston = require('winston');
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

**Monitoring tools:**
- **PM2** — process manager, auto-restart on crash
- **Prometheus + Grafana** — metrics and dashboards
- **Sentry** — error tracking in production

---

## Summary

| Phase | What | When |
|-------|------|------|
| 1 | Connection pooling, indexing, caching headers | From day 1 |
| 2 | Load balancer + multiple instances | > 1000 req/min |
| 3 | Redis caching | Repeated reads slow down |
| 4 | Microservices | Team grows, services diverge |
| 5 | Kubernetes | > 10 service instances |
| 6 | DB replicas + sharding | Millions of records |