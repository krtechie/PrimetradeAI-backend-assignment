# Backend Intern Assignment

A scalable REST API with JWT authentication and role-based access control.

## Tech Stack
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL + Sequelize ORM
- **Auth:** JWT + bcryptjs
- **Docs:** Swagger UI
- **Frontend:** React.js (Vite)

## Getting Started

### Prerequisites
- Node.js >= 18
- PostgreSQL running locally

### Installation

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

### Environment Variables
See `.env.example` for all required variables.

## API Documentation
Visit `http://localhost:5000/api-docs` after starting the server.

## Folder Structure
\```
src/
  routes/      → API route definitions (versioned)
  controllers/ → Business logic
  middleware/  → Auth, role check, error handling
  models/      → Sequelize DB models
  config/      → DB and Swagger config
  utils/       → Shared helpers
\```

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/auth/register | Public |
| POST | /api/v1/auth/login | Public |
| GET | /api/v1/auth/me | Protected |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/tasks | User/Admin |
| POST | /api/v1/tasks | User/Admin |
| PUT | /api/v1/tasks/:id | Owner/Admin |
| DELETE | /api/v1/tasks/:id | Owner/Admin |