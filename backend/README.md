# Department Smart Management System — Backend API

## Stack
- **Runtime**: Node.js 18+, Express 5
- **DB**: MySQL 8 via `mysql2` (connection pool)
- **Auth**: JWT (access 15m + refresh 7d), httpOnly cookies, token rotation
- **Uploads**: Cloudinary via `multer-storage-cloudinary`
- **Validation**: Zod schemas on every mutation endpoint
- **Logging**: Winston (console + file rotation)
- **Security**: Helmet, CORS, rate limiting, bcrypt (12 rounds)

---

## Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# Fill in DB credentials, JWT secrets, Cloudinary keys

# 3. Create tables (run schema.sql in MySQL)
mysql -u root -p your_db < schema.sql

# 4. Run
npm run dev       # development with nodemon
npm start         # production
```

---

## Project Structure

```
src/
├── config/          # db.js, cloudinary.js
├── controllers/     # auth, user, course, attendance, assignment, result, notice, routine, dashboard
├── middlewares/     # auth.js, validate.js, upload.js, errorHandler.js, rateLimiter.js
├── routes/          # one file per resource
├── services/        # token.service.js
├── utils/           # logger, asyncHandler, apiHelpers, gradeCalc
└── validators/      # auth.validator.js, resource.validator.js
```

---

## API Endpoints

Base URL: `/api/v1`

### Auth  `/auth`
| Method | Path | Body | Auth |
|--------|------|------|------|
| POST | `/register` | full_name, email, password, role, [registration_no, session, semester, designation] | — |
| POST | `/login` | email, password | — |
| POST | `/refresh` | — (cookie or body.refreshToken) | — |
| POST | `/logout` | — | ✅ |
| GET | `/me` | — | ✅ |
| PATCH | `/change-password` | current_password, new_password | ✅ |

### Users  `/users`
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/` | ✅ | admin |
| PATCH | `/profile` | ✅ | any |
| PATCH | `/profile/image` | ✅ (multipart) | any |
| PATCH | `/:id/toggle-status` | ✅ | admin |
| DELETE | `/:id` | ✅ | admin |

### Courses  `/courses`
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/` | ✅ | any |
| GET | `/my` | ✅ | student |
| GET | `/:id` | ✅ | any |
| POST | `/` | ✅ | admin |
| PUT | `/:id` | ✅ | admin |
| DELETE | `/:id` | ✅ | admin |
| POST | `/enroll` | ✅ | admin |
| POST | `/assign-teacher` | ✅ | admin |

### Attendance  `/attendance`
| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/` | ✅ | teacher |
| GET | `/?course_id=&date=` | ✅ | teacher, admin |
| GET | `/my` | ✅ | student |

### Assignments  `/assignments`
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/?course_id=` | ✅ | any |
| GET | `/my` | ✅ | student |
| POST | `/` (multipart) | ✅ | teacher |
| POST | `/:assignment_id/submit` (multipart) | ✅ | student |
| GET | `/:assignment_id/submissions` | ✅ | teacher, admin |
| PATCH | `/submissions/:submission_id/grade` | ✅ | teacher, admin |

### Results  `/results`
| Method | Path | Auth | Role |
|--------|------|------|------|
| POST | `/` | ✅ | teacher, admin |
| GET | `/my` | ✅ | student |
| GET | `/course/:course_id` | ✅ | teacher, admin |

### Notices  `/notices`
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/` | ✅ | any |
| POST | `/` (multipart) | ✅ | admin, teacher |
| DELETE | `/:id` | ✅ | admin |

### Routines  `/routines`
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/` | ✅ | any |
| POST | `/` | ✅ | admin |
| DELETE | `/:id` | ✅ | admin |

### Dashboard  `/dashboard`
| Method | Path | Auth | Role |
|--------|------|------|------|
| GET | `/admin` | ✅ | admin |
| GET | `/student` | ✅ | student |
| GET | `/teacher` | ✅ | teacher |

---

## Response Format

```json
// Success
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched.",
  "data": { ... }
}

// Error
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

## Grading Scale
| Marks | Grade | GPA |
|-------|-------|-----|
| ≥ 80 | A+ | 4.00 |
| ≥ 75 | A | 3.75 |
| ≥ 70 | A- | 3.50 |
| ≥ 65 | B+ | 3.25 |
| ≥ 60 | B | 3.00 |
| ≥ 55 | B- | 2.75 |
| ≥ 50 | C+ | 2.50 |
| ≥ 45 | C | 2.25 |
| ≥ 40 | D | 2.00 |
| < 40 | F | 0.00 |
