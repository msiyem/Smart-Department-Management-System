# Smart Department Management System - Frontend

This is the Next.js frontend for the Smart Department Management System. It provides role-based workspaces for administrators, teachers, and students, and connects to the Express backend API through cookie-based authentication.

## Tech Stack

- Next.js 16 with App Router
- React 19 and TypeScript
- Tailwind CSS 4
- shadcn/Radix UI components
- Server actions for authenticated API calls
- Zustand for lightweight client state
- React Hook Form and Zod for form handling
- Lucide React icons
- Sonner notifications

## Main Features

- Public landing page for the Software Engineering Department portal
- Login flow with access token, refresh token, and session cookies
- Protected private layout with role-based sidebars
- Admin dashboard with department totals and recent notices
- Admin user, course, routine, and notice management
- Teacher dashboard with course, assignment, attendance, notice, and routine tools
- Student dashboard with enrolled courses, attendance, assignments, notices, and routine views
- Searchable student notices with priority labels and attachment links
- Profile and settings pages for authenticated users
- Light/dark theme support

## Project Structure

```text
frontend/
+-- public/                 Static assets
+-- src/
|   +-- action/             Server actions for auth, users, students, attendance, assignments
|   +-- app/                Next.js App Router pages and layouts
|   |   +-- (private)/      Authenticated admin, teacher, student, profile, settings routes
|   |   +-- landing-page.tsx
|   +-- components/         Shared, layout, auth, assignment, and UI components
|   +-- context/            User context helpers
|   +-- hooks/              Reusable React hooks
|   +-- lib/                API client, cookies, utilities, validation, formatters
|   +-- store/              Zustand stores
|   +-- types/              Shared TypeScript types
+-- package.json
+-- README.md
```

## Routes

### Public

- `/` - Landing page

### Private

- `/admin` - Admin dashboard
- `/admin/users` - Manage users
- `/admin/courses` - Manage courses
- `/admin/routines` - Manage class routines
- `/admin/notices` - Manage notices
- `/admin/analytics` - Analytics page
- `/admin/results` - Results page
- `/teacher` - Teacher dashboard
- `/teacher/courses` - Assigned courses
- `/teacher/attendance` - Mark and review attendance
- `/teacher/assignments` - Create and manage assignments
- `/teacher/assignments/[assignmentId]/submissions` - Review submissions
- `/teacher/notices` - Publish and view notices
- `/teacher/routine` - Teacher routine
- `/teacher/grading` - Grading workspace
- `/student` - Student dashboard
- `/student/courses` - Enrolled courses
- `/student/attendance` - Attendance summary
- `/student/assignments` - Assignment list and submission flow
- `/student/notices` - Searchable notices and attachments
- `/student/routine` - Student routine
- `/profile` - User profile
- `/settings` - User settings

## Environment Variables

Create `frontend/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_NODE_ENV=development
```

`NEXT_PUBLIC_API_URL` must point to the backend API root. The current backend mounts routes under `/api`, so the local default is `http://localhost:5000/api`.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Run the production build
npm run lint     # Run ESLint
```

## Backend Dependency

The frontend expects the backend to be running on port `5000` by default and to accept credentials from `http://localhost:3000`. Start the backend first when testing authenticated pages.
