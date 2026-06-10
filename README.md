# Smart Department Management System

Smart Department Management System is a full-stack web application for managing a university department. It includes a Next.js frontend and an Express/MySQL backend with role-based dashboards for admins, teachers, and students.

## Repository Structure

```text
Smart-Department-Management-System/
+-- backend/      Express API, MySQL schema, authentication, uploads, dashboards
+-- frontend/     Next.js app, role-based UI, server actions, protected pages
+-- README.md     Full project overview
```

## System Overview

The system has three primary roles:

- `Admin` manages users, courses, teacher assignments, student enrollments, routines, notices, and department summaries.
- `Teacher` manages assigned courses, takes attendance, creates assignments, reviews submissions, publishes notices, and views routines.
- `Student` views enrolled courses, attendance, assignments, notices, routines, and academic dashboard data.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/Radix UI components
- Server actions and cookie-based auth flow

### Backend

- Node.js 18+
- Express 5
- MySQL 8
- JWT authentication
- Zod validation
- Cloudinary uploads
- Winston/Morgan logging
- Helmet, CORS, and rate limiting

## Main Features

- Secure login, refresh token, logout, and current-user endpoints
- Protected role-based routing
- Admin, teacher, and student dashboards
- User management and profile image upload
- Course management, enrollment, and teacher assignment
- Attendance recording and student attendance summaries
- Assignment creation, file upload, submission, grading, and review
- Notices with priorities and optional attachments
- Class routine management and routine views
- Result publishing and CGPA support
- Centralized API responses and validation errors

## Local Setup

### 1. Clone and install dependencies

```bash
git clone <repository-url>
cd Smart-Department-Management-System

cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure backend environment

Create `backend/.env` from `backend/.env.example`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dept_management

ACCESS_TOKEN_SECRET=change_me_access_secret_64chars_min
REFRESH_TOKEN_SECRET=change_me_refresh_secret_64chars_min
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GOOGLE_CLIENT_ID=your_google_client_id
```

### 3. Configure frontend environment

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_NODE_ENV=development
```

### 4. Create the database

```bash
cd backend
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dept_management"
mysql -u root -p dept_management < schema.sql
```

### 5. Run the project

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
API:      http://localhost:5000/api
Health:   http://localhost:5000/health
```

## Scripts

### Backend

```bash
npm run dev          # Start backend with nodemon
npm start            # Start backend with node
npm run db:migrate   # Run backend migration helper
```

### Frontend

```bash
npm run dev      # Start Next.js development server
npm run build    # Build production frontend
npm run start    # Start production frontend
npm run lint     # Run ESLint
```

## API Summary

The backend mounts all application routes under `/api`:

- `/api/auth`
- `/api/users`
- `/api/courses`
- `/api/attendance`
- `/api/assignments`
- `/api/results`
- `/api/notices`
- `/api/routines`
- `/api/dashboard`

See [backend/README.md](backend/README.md) for endpoint details.

## Frontend Pages

The frontend includes role-specific private pages:

- Admin: dashboard, users, courses, routines, notices
- Teacher: dashboard, courses, attendance, assignments, submissions, notices, routine
- Student: dashboard, courses, attendance, assignments, notices, routine
- Shared: profile and settings

See [frontend/README.md](frontend/README.md) for frontend details.

## Development Notes

- Run the backend before testing authenticated frontend pages.
- The frontend sends credentials with API requests, so `CLIENT_URL` and `NEXT_PUBLIC_API_URL` must match your local ports.
- File upload features require valid Cloudinary credentials.
- The backend schema must be loaded before login and dashboard features can work.
