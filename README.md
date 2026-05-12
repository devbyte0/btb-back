# BTB Backend API

Production-style backend for Barista Training Bangladesh using Node.js, Express, MongoDB (Mongoose), JWT auth, and Cloudinary uploads.

## Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication + role-based authorization
- Cloudinary for media uploads
- Validation via `express-validator`

## Roles

- `student`
- `trainer`
- `admin`
- `super_admin`

## Key Business Logic

- Course creation: allowed for `trainer`, `admin`, `super_admin`
- Trainer and admin can create student accounts
- Course-level admin discount supported (`flat` or `percent`)
- Promo code support with expiry, usage limit, and course constraints
- Enrollment stores pricing snapshot (`base`, discounts, final price)
- Payment methods: `bkash`, `nagad`, `cash_adjustment`
- Cash adjustment entries can be recorded by trainer/admin/super-admin
- Enrollment payment summary auto-settles based on total paid vs final price
- Attendance recorded per enrollment per session date

## Setup

1. Install dependencies:
   - `npm install`
2. Create `.env` from `.env.example` and fill values.
3. Run server:
   - Dev: `npm run dev`
   - Prod: `npm start`

## Seed Super Admin

Requested default seed values are implemented in `src/scripts/seedSuperAdmin.js`:

- Username default: `aliazom`
- Password default: `barista_king@azom`

Run:

- `npm run seed:super-admin`

Optional env overrides:

- `SEED_SUPER_ADMIN_USERNAME`
- `SEED_SUPER_ADMIN_PASSWORD`
- `SEED_SUPER_ADMIN_NAME`
- `SEED_FORCE_PASSWORD_RESET=true` to reset password on existing user

## Optional Sample Seed

- `npm run seed:sample`

Adds sample trainer/admin/course/promo data.

## API Base URL

- `http://localhost:5000/api/v1`

## Endpoint Summary

### Auth
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/register` (trainer/admin/super-admin)

### Users
- `GET /users` (admin/super-admin)
- `POST /users/students` (trainer/admin/super-admin)
- `PATCH /users/:userId/role` (admin/super-admin; only super-admin can assign `super_admin`)

### Courses
- `GET /courses`
- `POST /courses` (trainer/admin/super-admin)
- `PATCH /courses/:courseId/discount` (admin/super-admin)

### Promos
- `GET /promos` (admin/super-admin)
- `POST /promos` (admin/super-admin)

### Enrollments
- `GET /enrollments`
- `POST /enrollments` (student/trainer/admin/super-admin)

### Payments
- `GET /payments`
- `POST /payments`
  - `method`: `bkash` | `nagad` | `cash_adjustment`

### Attendance
- `GET /attendance`
- `POST /attendance` (trainer/admin/super-admin)

### Uploads
- `POST /uploads` (trainer/admin/super-admin, `multipart/form-data` with field `file`)

## Health Check

- `GET /health`
