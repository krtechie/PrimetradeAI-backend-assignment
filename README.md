# PrimeTradeAI Backend Assignment

A scalable REST API built with Node.js and Express featuring JWT authentication, role-based access control, and a React frontend.

---

## Tech Stack

**Backend**
- Node.js + Express.js
- PostgreSQL + Sequelize ORM
- JWT + bcryptjs (Authentication)
- Zod (Validation)
- Swagger UI (API Docs)
- Helmet + HPP + Rate Limiting (Security)

**Frontend**
- React.js + Vite
- React Router DOM
- Axios + JWT Interceptor
- React Hot Toast

---

## Project Structure

```
PrimetradeAI-backend-assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           → PostgreSQL connection
│   │   │   └── swagger.js      → Swagger config
│   │   ├── controllers/
│   │   │   ├── authController.js   → Register, login, getMe
│   │   │   └── taskController.js   → CRUD operations
│   │   ├── middleware/
│   │   │   ├── auth.js         → JWT verification
│   │   │   ├── roleCheck.js    → Role-based access
│   │   │   └── errorHandler.js → Global error handler
│   │   ├── models/
│   │   │   ├── User.js         → User schema
│   │   │   ├── Task.js         → Task schema
│   │   │   └── index.js        → Model associations
│   │   ├── routes/
│   │   │   └── v1/
│   │   │       ├── auth.js     → Auth routes
│   │   │       ├── tasks.js    → Task routes
│   │   │       └── index.js    → Route aggregator
│   │   ├── utils/
│   │   │   └── response.js     → Consistent API responses
│   │   ├── app.js              → Express app setup
│   │   └── server.js           → Server entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── axios.js        → Axios instance + interceptors
│   │   │   ├── auth.js         → Auth API calls
│   │   │   └── tasks.js        → Task API calls
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx → Global auth state
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Dashboard.jsx
│   │   └── App.jsx
│   └── package.json
├── SCALABILITY.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL running locally
- npm >= 9

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/PrimetradeAI-backend-assignment.git
cd PrimetradeAI-backend-assignment
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in your `.env` file:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=primetradeai_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

Create the PostgreSQL database:

```bash
psql -U postgres -c "CREATE DATABASE primetradeai_db;"
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

---

## Running with Docker

```bash
docker-compose up --build
```

This starts both backend and PostgreSQL automatically.

---

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/v1/auth/register | Public | Register new user |
| POST | /api/v1/auth/login | Public | Login and get JWT |
| GET | /api/v1/auth/me | Protected | Get current user |

### Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/v1/tasks | User/Admin | Get all tasks |
| GET | /api/v1/tasks/:id | User/Admin | Get task by ID |
| POST | /api/v1/tasks | User/Admin | Create new task |
| PUT | /api/v1/tasks/:id | Owner/Admin | Update task |
| DELETE | /api/v1/tasks/:id | Owner/Admin | Delete task |

> Admin sees all tasks. Users only see their own tasks.

---

## API Documentation

Swagger UI available at:

```
http://localhost:5000/api-docs
```

---

## Security Features

- JWT token authentication
- Password hashing with bcryptjs (12 salt rounds)
- Role-based access control (user / admin)
- HTTP parameter pollution protection (hpp)
- Security headers (helmet)
- Rate limiting — 100 req/15min globally, 10 req/15min on auth routes
- CORS restricted to frontend origin
- Request body size limited to 10kb
- Input sanitization (HTML tag stripping)

---

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Full name |
| email | VARCHAR | Unique email |
| password | VARCHAR | Hashed password |
| role | ENUM | user / admin |
| createdAt | TIMESTAMP | Auto-generated |
| updatedAt | TIMESTAMP | Auto-generated |

### Tasks Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | VARCHAR(200) | Task title |
| description | TEXT | Optional description |
| status | ENUM | pending / in_progress / completed |
| userId | UUID | Foreign key → users.id |
| createdAt | TIMESTAMP | Auto-generated |
| updatedAt | TIMESTAMP | Auto-generated |

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | development |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_NAME | Database name | primetradeai_db |
| DB_USER | Database user | postgres |
| DB_PASSWORD | Database password | yourpassword |
| JWT_SECRET | JWT signing secret | randomlongstring |
| JWT_EXPIRES_IN | Token expiry | 7d |

---

## Health Check

```
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "v1"
}
```