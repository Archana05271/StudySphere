# StudySphere — Student Course Management System

> **Live demo:** _add your Vercel URL here after deployment_  ·  **API:** _add your Render URL here_  ·  **Repo:** _add your GitHub URL_

StudySphere is a full-stack learning-management web app. Students register, browse and enroll in courses, track progress, get live notifications and chat in real time. Administrators manage courses and students and send announcements.

## Problem statement
Colleges often manage courses, enrollments and student communication across spreadsheets and chat groups. This causes duplicated data, missed announcements and no single view of a student's progress. StudySphere centralises this in one secure, responsive web application with real-time communication.

## Target users and requirements
| User | Needs |
|---|---|
| **Student** | Register/login securely · browse & enroll in courses · see progress · receive instant announcements · message classmates/admin · download a completion certificate |
| **Administrator** | Create/edit/delete courses · view, edit and remove students · see enrollment activity · broadcast announcements |

## Features
- Registration & login with validation (email, password length, phone) and **bcrypt**-hashed passwords
- **JWT** authentication, role-based protected routes (student / admin) on both API and UI
- Course CRUD (admin) · Student CRUD (admin) · enrollment, lesson progress and certificate (student)
- **Real-time** notifications and 1-to-1 chat with online/offline status (**Socket.IO**)
- React Context state (auth, courses/enrollments, socket) · loading & error states everywhere
- Security: helmet, CORS allow-list, rate limiting, input validation + NoSQL-injection sanitising, centralised error handling, request logging (morgan)
- Responsive UI (mobile / tablet / desktop) · automated API tests · Postman collection

## Tech stack
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router 6, Axios, Context API, Socket.IO client |
| Backend | Node.js (ES modules), Express 4, Socket.IO, JWT, bcryptjs, helmet, express-rate-limit, morgan |
| Database | MongoDB + Mongoose (local or MongoDB Atlas) |
| Testing | node:test + supertest + mongodb-memory-server, Postman/newman |
| Deployment | Vercel (frontend) · Render (backend) · MongoDB Atlas |

## Project structure
```text
.
├── backend/
│   ├── config/            # env validation, DB connection
│   ├── controllers/       # request handlers (auth, course, student, enrollment, notification, message)
│   ├── middleware/        # JWT auth + roles, validation, errors, 404
│   ├── models/            # Mongoose schemas (User, Course, Enrollment, LearningProgress, Notification, Message)
│   ├── routes/            # REST route definitions
│   ├── services/          # business logic (auth, notifications, messages)
│   ├── sockets/           # authenticated Socket.IO server (chat, presence)
│   ├── scripts/           # createAdmin.js
│   ├── tests/             # automated API + socket tests
│   ├── utils/             # sanitize, asyncHandler, httpError
│   ├── app.js             # Express app (middleware + routes)
│   └── server.js          # entry point (DB connect + HTTP + sockets)
├── src/                   # React app
│   ├── api/               # axios client + service modules + socket client
│   ├── components/        # Navbar, Footer, layouts, ProtectedRoute, CourseCard, forms, Toast
│   ├── context/           # AuthContext, CourseContext, SocketContext
│   ├── pages/             # auth, student, admin, Home, Chat
│   ├── utils/             # validation.js, ui.js
│   └── css/               # external stylesheets (responsive)
├── static-prototype/      # Tasks 2–5: plain HTML/CSS/ES-module JS version
├── mock-api/              # Task 7: JSON Server mock data
├── docs/                  # ER diagram, deployment guide, testing guide, Postman collection
├── render.yaml · vercel.json · .github/workflows/ci.yml
└── README.md
```

## Run locally

**Prerequisites:** Node.js 18+ (22 recommended) and MongoDB (local install **or** a free MongoDB Atlas connection string). Git.

### 1 — Backend
```bash
cd backend
cp .env.example .env          # Windows: copy .env.example .env
npm install
```
Edit `backend/.env`:
- `MONGO_URI` – `mongodb://127.0.0.1:27017/studysphere` (local) or your Atlas string
- `JWT_SECRET` – at least 32 random characters. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` (12+ characters) – used once to create the admin

```bash
npm run create-admin          # creates the administrator account
npm run dev                   # API on http://localhost:5000
```
Check: open http://localhost:5000/api/health → `{"status":"healthy","database":"connected"}`

### 2 — Frontend (new terminal, from the project root)
```bash
npm install
npm run dev                   # http://localhost:3000
```
No `.env` is needed locally (defaults point to `localhost:5000`). To change them copy `.env.example` → `.env.local`.

### 3 — Use it
- Student: http://localhost:3000/auth/register → create account → login
- Admin: http://localhost:3000/auth/admin-login (the credentials from `.env`)
- Real-time test: open a second (private) window, register another student, open **Chat** in both.

### Tests
```bash
cd backend && npm test                      # 15 API + WebSocket tests (downloads an in-memory MongoDB on first run)
# or against your own MongoDB:  TEST_MONGO_URI=mongodb://127.0.0.1:27017/studysphere_test npm test
```
Postman: import `docs/StudySphere.postman_collection.json` (see `docs/TESTING.md`).

### Optional
- **Mock API (Task 7)**: `cd mock-api && npm install && cd .. && npm run mock-api` → http://localhost:4000
- **Static prototype (Tasks 2–5)**: see `static-prototype/README.md`

## API overview
Base URL `http://localhost:5000/api/v1` (also available under `/api`). Protected routes need `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/` , `/api/health` | Public | Server / DB status |
| POST | `/auth/register` | Public | Register a student |
| POST | `/auth/login` | Public | Login → JWT |
| GET / PUT | `/auth/me` | User | Get / update own profile |
| PATCH | `/auth/me/password` | User | Change password |
| GET | `/courses`, `/courses/:id` | Public | List / get courses |
| POST / PUT / PATCH / DELETE | `/courses`, `/courses/:id` | Admin | Course CRUD |
| GET / POST | `/students` | Admin | List / create students |
| GET / PUT / PATCH / DELETE | `/students/:id` | Admin | Student CRUD |
| POST | `/enrollments` | Student | Enroll `{courseId}` |
| GET | `/enrollments/me` | Student | My enrollments + progress |
| PATCH | `/enrollments/:courseId/progress` | Student | `{completedLessons}` |
| DELETE | `/enrollments/:courseId` | Student | Unenroll |
| GET | `/enrollments` | Admin | All enrollments |
| GET | `/notifications` | User | My notifications |
| POST | `/notifications` | Admin | Announcement to all students (live) |
| PATCH | `/notifications/:id/read`, `/notifications/read-all` | User | Mark read |
| GET | `/messages/contacts`, `/messages/:userId` | User | Chat contacts / history |
| POST | `/messages` | User | Send message (REST fallback) |

Socket.IO events (JWT in `auth.token`): `send_message`, `receive_message`, `notification`, `presence`, `typing`, `connection_status`.

Error format: `{ "success": false, "message": "…" }` with 400 (invalid input) · 401 (no/invalid token) · 403 (wrong role) · 404 · 409 (duplicate) · 500.

## Database
See [`docs/ER-DIAGRAM.md`](docs/ER-DIAGRAM.md).

## Deployment
See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) (Atlas → Render → Vercel).

## Push to GitHub
```bash
git init
git add .
git commit -m "StudySphere full-stack project"
git branch -M main
git remote add origin https://github.com/<your-username>/studysphere.git
git push -u origin main
```
`.gitignore` already excludes `.env` and `node_modules` – **never commit `.env`**.

## Security notes
- Public registration always creates **students**; admins are created only with `npm run create-admin`.
- Password reset is intentionally not implemented (the UI explains this) – an email-only reset would be insecure.
- If any real credentials were ever committed or shared, rotate them (MongoDB password, `JWT_SECRET`).
