# Smart Department Management System - Backend

This is the Express and MySQL backend API for the Smart Department Management System. It handles authentication, role authorization, users, courses, attendance, assignments, results, notices, routines, dashboards, and file uploads.

## Tech Stack

- Node.js 18+
- Express 5
- MySQL 8 with `mysql2`
- JWT access and refresh tokens
- Cookie parser for session-aware API flows
- bcrypt for password hashing
- Zod for request validation
- Cloudinary for profile, notice, and assignment file uploads
- Helmet, CORS, and rate limiting for API hardening
- Winston and Morgan for logging
- Nodemon for development

## Main Features

- Role-based authentication for `admin`, `teacher`, and `student`
- Access token and refresh token flow with token rotation support
- Admin user creation, status toggle, and deletion
- Student and teacher profile support
- Course creation, update, deletion, student enrollment, and teacher assignment
- Teacher attendance marking and attendance summaries
- Assignment creation, file upload, submission, submission review, grading, and deletion
- Result publishing and student CGPA calculation support
- Notice publishing with optional attachments and priority levels
- Routine creation and role-visible routine listing
- Admin, teacher, and student dashboard summary endpoints
- Central response helpers and global error handling

## Project Structure

```text
backend/
+-- logs/                   Runtime log files
+-- schema.sql              MySQL database schema
+-- src/
|   +-- app.js              Express app, middleware, route mounting
|   +-- server.js           Database check and HTTP server bootstrap
|   +-- config/             Database and Cloudinary config
|   +-- controllers/        Route handlers by resource
|   +-- middlewares/        Auth, validation, uploads, rate limit, error handling
|   +-- routes/             API route definitions
|   +-- services/           Token service
|   +-- utils/              Logger, API helpers, grade calculator, upload helpers
|   +-- validators/         Zod validation schemas
+-- package.json
+-- README.md
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

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

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Create the database and run the schema:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dept_management"
mysql -u root -p dept_management < schema.sql
```

Start the API:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default.

## Scripts

```bash
npm run dev          # Start with nodemon
npm start            # Start with node
npm run db:migrate   # Run migration helper from src/config/migrate.js
```

## API Base URL

```text
http://localhost:5000/api
```

Health check:

```text
GET /health
```

## API Endpoints

### Auth - `/api/auth`

| Method | Path | Access |
| --- | --- | --- |
| POST | `/register` | Public |
| POST | `/login` | Public |
| POST | `/refresh` | Public |
| POST | `/logout` | Authenticated |
| GET | `/me` | Authenticated |
| PATCH | `/change-password` | Authenticated |

### Users - `/api/users`

| Method | Path | Access |
| --- | --- | --- |
| POST | `/` | Admin |
| GET | `/` | Admin |
| PATCH | `/profile` | Authenticated |
| PATCH | `/profile/image` | Authenticated, multipart `profile_image` |
| PATCH | `/:id/toggle-status` | Admin |
| DELETE | `/:id` | Admin |

### Courses - `/api/courses`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Authenticated |
| GET | `/my` | Student |
| GET | `/teacher/my` | Teacher |
| GET | `/enrollment` | Teacher, Admin |
| GET | `/:id` | Authenticated |
| POST | `/` | Admin |
| PUT | `/:id` | Admin |
| DELETE | `/:id` | Admin |
| POST | `/enroll` | Admin |
| POST | `/assign-teacher` | Admin |

### Attendance - `/api/attendance`

| Method | Path | Access |
| --- | --- | --- |
| POST | `/` | Teacher |
| GET | `/` | Teacher, Admin |
| GET | `/my` | Student |

### Assignments - `/api/assignments`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Authenticated |
| GET | `/my` | Student |
| GET | `/student/my` | Student |
| GET | `/teacher/created` | Teacher |
| POST | `/` | Teacher, multipart `file` |
| POST | `/:assignment_id/submit` | Student, multipart `file` |
| GET | `/:assignment_id/submissions` | Teacher, Admin |
| PATCH | `/submissions/:submission_id/grade` | Teacher, Admin |
| DELETE | `/:assignment_id` | Teacher, Admin |

### Results - `/api/results`

| Method | Path | Access |
| --- | --- | --- |
| POST | `/` | Teacher, Admin |
| GET | `/my` | Student |
| GET | `/course/:course_id` | Teacher, Admin |

### Notices - `/api/notices`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Authenticated |
| POST | `/` | Admin, Teacher, multipart `attachment` |
| DELETE | `/:id` | Admin, Teacher |

### Routines - `/api/routines`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/` | Authenticated |
| POST | `/` | Admin |
| DELETE | `/:id` | Admin |

### Dashboard - `/api/dashboard`

| Method | Path | Access |
| --- | --- | --- |
| GET | `/admin` | Admin |
| GET | `/teacher` | Teacher |
| GET | `/student` | Student |

## Response Shape

Successful responses use this shape:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Request completed.",
  "data": {}
}
```

Errors use this shape:

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email"
    }
  ]
}
```

## Database Tables

The schema includes:

- `users`
- `refresh_tokens`
- `students`
- `teachers`
- `courses`
- `enrollments`
- `course_teachers`
- `attendance`
- `assignments`
- `assignment_submissions`
- `class_routines`
- `notices`
- `results`

## Grading Scale

| Marks | Grade | GPA |
| --- | --- | --- |
| 80+ | A+ | 4.00 |
| 75+ | A | 3.75 |
| 70+ | A- | 3.50 |
| 65+ | B+ | 3.25 |
| 60+ | B | 3.00 |
| 55+ | B- | 2.75 |
| 50+ | C+ | 2.50 |
| 45+ | C | 2.25 |
| 40+ | D | 2.00 |
| Below 40 | F | 0.00 |
