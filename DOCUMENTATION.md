# Medical Schedule Management System - Complete Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Running the Application](#running-the-application)
8. [Project Structure](#project-structure)
9. [Core Features](#core-features)
10. [API Endpoints](#api-endpoints)
11. [User Roles & Permissions](#user-roles--permissions)
12. [Data Models](#data-models)
13. [Authentication Flow](#authentication-flow)
14. [Troubleshooting](#troubleshooting)

---

## Project Overview

**Medical Schedule Management System** is a full-stack web application designed for managing medical professional schedules and patient appointments. The system provides role-based access control, allowing administrators to manage users and schedules, doctors (médicos) to create and manage their schedules, and patients (clientes) to view available schedules.

### Key Features:
- User authentication with JWT tokens
- Role-based access control (Admin, Doctor, Patient)
- Schedule management for medical professionals
- User management system
- Comprehensive audit logging for all system actions
- Responsive web interface with Tailwind CSS
- Secure password hashing with bcryptjs

---

## Technology Stack

### Backend & Frontend Framework
- **Next.js 16.2.4** - React-based full-stack framework
- **React 19.2.4** - UI library
- **TypeScript 5** - Type-safe JavaScript

### Database
- **PostgreSQL** - Relational database
- **Prisma 7.8.0** - ORM (Object-Relational Mapping)
- **@prisma/adapter-pg** - PostgreSQL adapter for Prisma

### Authentication & Security
- **jsonwebtoken 9.0.3** - JWT token generation and verification
- **bcryptjs 3.0.3** - Password hashing
- **cookie 1.1.1** - Cookie handling

### Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **@tailwindcss/postcss 4** - PostCSS plugin for Tailwind

### Development Tools
- **ESLint 9** - Code linting
- **Node.js** - JavaScript runtime

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js 18+** and **npm 9+** (or yarn, pnpm)
- **PostgreSQL 12+** (local or cloud-hosted)
- **Git** (for version control)
- A code editor (VS Code recommended)

### Check Your Versions:
```bash
node --version
npm --version
psql --version
```

---

## Installation & Setup

### Step 1: Clone the Project
```bash
git clone <repository-url>
cd my-app
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install all dependencies listed in `package.json`, including:
- Next.js and React
- Prisma ORM
- Authentication libraries (JWT, bcryptjs)
- Development dependencies (TypeScript, ESLint, Tailwind)

### Step 3: Verify Installation
```bash
npm run lint
```

This checks for any linting errors in your code.

---

## Environment Variables

Create a `.env.local` file in the project root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/medical_db"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRE="1h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production"
JWT_REFRESH_EXPIRE="7d"

# Application Environment
NODE_ENV="development"
NEXT_PUBLIC_API_URL="http://localhost:3000"

# Cookie Configuration (optional)
COOKIE_SECURE="false"
COOKIE_SAME_SITE="Lax"
```

### Environment Variable Explanation:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for access token signing | Generate with: `openssl rand -base64 32` |
| `JWT_EXPIRE` | Access token expiration time | `1h`, `24h` |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | Generate with: `openssl rand -base64 32` |
| `JWT_REFRESH_EXPIRE` | Refresh token expiration time | `7d`, `30d` |
| `NODE_ENV` | Environment mode | `development`, `production` |
| `NEXT_PUBLIC_API_URL` | Public API URL (accessible from browser) | `http://localhost:3000` |

### Security Note:
- **NEVER commit `.env.local` to version control**
- Use strong, randomly generated secrets for JWT keys
- In production, use a secure secret management system (AWS Secrets Manager, HashiCorp Vault, etc.)

---

## Database Setup

### Step 1: Create PostgreSQL Database

If using local PostgreSQL:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE medical_db;

# Exit psql
\q
```

Or use a cloud provider like:
- **Heroku Postgres**
- **AWS RDS**
- **Supabase** (PostgreSQL as a Service)
- **Railway.app**

### Step 2: Update DATABASE_URL in `.env.local`

Update the `DATABASE_URL` variable to match your database connection string.

### Step 3: Run Prisma Migrations

```bash
# Generate and apply migrations to your database
npx prisma migrate dev --name initial
```

This command will:
1. Create the database schema based on `prisma/schema.prisma`
2. Generate Prisma Client
3. Create migration files in `prisma/migrations/`
4. Apply migrations to your database

### Step 4: Verify Database Setup (Optional)

Open Prisma Studio to view your database:
```bash
npx prisma studio
```

This opens an interactive UI at `http://localhost:5555` where you can:
- View all tables and records
- Create, read, update, and delete records
- Test your database structure

---

## Running the Application

### Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

Expected output:
```
> next dev

▲ Next.js 16.2.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

Open your browser and visit: **http://localhost:3000**

The application will redirect you to the login page.

### Production Build

Create an optimized production build:

```bash
npm run build
```

This generates a `.next` folder with optimized code for production.

### Start Production Server

After building, start the production server:

```bash
npm start
```

---

## Project Structure

```
my-app/
├── public/                          # Static assets
│   └── images/
│       └── avatars/                 # User profile pictures
├── prisma/
│   ├── schema.prisma               # Database schema definition
│   └── migrations/                 # Database migration files
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── globals.css            # Global styles
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage (redirects to dashboard)
│   │   ├── manifest.ts            # PWA manifest
│   │   ├── (auth)/                # Authentication pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # Login page
│   │   │   └── register/
│   │   │       └── page.tsx       # Registration page
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Main dashboard
│   │   └── api/                   # API routes
│   │       ├── auth/              # Authentication endpoints
│   │       │   ├── login/
│   │       │   ├── logout/
│   │       │   ├── me/
│   │       │   ├── register/
│   │       │   └── refresh/
│   │       ├── schedules/         # Schedule management endpoints
│   │       ├── users/             # User management endpoints
│   │       └── audit-logs/        # Audit log endpoints
│   ├── components/                # Reusable React components
│   │   ├── ProfilePictureSelector.tsx
│   │   └── ui/                    # UI component library
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Modal.tsx
│   ├── context/                   # React Context for state management
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── ScheduleContext.tsx    # Schedule state
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts            # Authentication hook
│   │   └── useSchedules.ts       # Schedule management hook
│   ├── lib/                       # Utility functions and libraries
│   │   ├── api-response.ts       # API response utilities
│   │   ├── audit.ts              # Audit logging
│   │   ├── auth.ts               # Authentication utilities
│   │   ├── cookies.ts            # Cookie management
│   │   ├── db.ts                 # Database connection
│   │   ├── jwt.ts                # JWT utilities
│   │   ├── rbac.ts               # Role-Based Access Control
│   │   └── prisma.ts             # Prisma client instance
│   ├── services/                 # API service functions
│   │   └── http.ts               # HTTP client
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/                    # Helper functions
│   │   └── date.ts              # Date utilities
│   └── generated/               # Auto-generated files (Prisma)
│       └── prisma/
├── .env.local                   # Environment variables (DO NOT COMMIT)
├── .gitignore                   # Git ignore file
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies
├── postcss.config.mjs         # PostCSS configuration
├── prisma.config.ts           # Prisma configuration (if needed)
├── tsconfig.json              # TypeScript configuration
└── DOCUMENTATION.md           # This file
```

---

## Core Features

### 1. **User Authentication**
- Secure login/registration system
- JWT-based session management
- Access and refresh token mechanism
- Password hashing with bcryptjs

### 2. **Role-Based Access Control (RBAC)**
Three user roles with different permissions:
- **ADMIN**: Full system access, user management
- **MEDICO** (Doctor): Create/manage personal schedules
- **CLIENTE** (Patient): View available schedules

### 3. **Schedule Management**
- Create schedules with title, description, start/end times
- Update and delete schedules
- Filter schedules by status (ACTIVE, CANCELLED)
- Associate schedules with medical professionals

### 4. **User Management**
- Create new users with specific roles
- Update user profiles (name, email, profile picture)
- View all users in the system
- Manage user status (ACTIVE, INACTIVE, SUSPENDED)

### 5. **Audit Logging**
Complete audit trail tracking:
- User login/logout events
- User creation, update, and deletion
- Schedule changes
- Role modifications
- View audit history with user information

### 6. **Profile Management**
- Update personal information
- Upload profile pictures
- Manage account settings

---

## API Endpoints

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Response (200 OK):
{
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "role": "CLIENTE"
  },
  "message": "Login successful"
}
```

#### Register
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "role": "CLIENTE"
}

Response (201 Created):
{
  "data": { /* user object */ },
  "message": "User registered successfully"
}
```

#### Get Current User
```
GET /api/auth/me

Response (200 OK):
{
  "data": { /* current user object */ }
}
```

#### Refresh Token
```
POST /api/auth/refresh

Response (200 OK):
{
  "data": { /* user object with new token */ }
}
```

#### Logout
```
POST /api/auth/logout

Response (200 OK):
{
  "message": "Logout successful"
}
```

### Schedule Endpoints

#### Get All Schedules
```
GET /api/schedules

Response (200 OK):
{
  "data": [
    {
      "id": "schedule_id",
      "title": "Doctor Appointment",
      "description": "Check-up",
      "startTime": "2026-04-27T10:00:00Z",
      "endTime": "2026-04-27T11:00:00Z",
      "status": "ACTIVE"
    }
  ]
}
```

#### Create Schedule
```
POST /api/schedules
Content-Type: application/json

Request Body:
{
  "title": "Doctor Appointment",
  "description": "Regular check-up",
  "startTime": "2026-04-27T10:00:00Z",
  "endTime": "2026-04-27T11:00:00Z",
  "userId": "user_id"
}

Response (201 Created):
{
  "data": { /* schedule object */ }
}
```

#### Update Schedule
```
PUT /api/schedules/[id]
Content-Type: application/json

Request Body:
{
  "title": "Updated Title",
  "status": "CANCELLED"
}

Response (200 OK):
{
  "data": { /* updated schedule object */ }
}
```

#### Delete Schedule
```
DELETE /api/schedules/[id]

Response (200 OK):
{
  "message": "Schedule deleted"
}
```

### User Endpoints

#### Get All Users
```
GET /api/users
Authorization: Required (Admin only)

Response (200 OK):
{
  "data": [ /* array of user objects */ ]
}
```

#### Create User
```
POST /api/users
Content-Type: application/json
Authorization: Required (Admin only)

Request Body:
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "MEDICO"
}

Response (201 Created):
{
  "data": { /* user object */ }
}
```

#### Get User by ID
```
GET /api/users/[id]

Response (200 OK):
{
  "data": { /* user object */ }
}
```

#### Update User
```
PUT /api/users/[id]
Content-Type: application/json

Request Body:
{
  "name": "Updated Name",
  "profileUrl": "https://example.com/avatar.jpg"
}

Response (200 OK):
{
  "data": { /* updated user object */ }
}
```

#### Delete User
```
DELETE /api/users/[id]
Authorization: Required (Admin only)

Response (200 OK):
{
  "message": "User deleted"
}
```

### Audit Log Endpoints

#### Get Audit Logs
```
GET /api/audit-logs
Authorization: Required (Admin only)

Response (200 OK):
{
  "data": [
    {
      "id": "log_id",
      "action": "LOGIN",
      "entity": "User",
      "entityId": "user_id",
      "changes": "{}",
      "createdAt": "2026-04-27T10:00:00Z",
      "user": {
        "name": "User Name",
        "email": "user@example.com"
      }
    }
  ]
}
```

---

## User Roles & Permissions

### ADMIN
- ✅ Access all endpoints
- ✅ Create/read/update/delete users
- ✅ Create/read/update/delete schedules
- ✅ View audit logs
- ✅ Change user roles
- ✅ Suspend/activate users

### MEDICO (Doctor)
- ✅ View own profile
- ✅ Create/update/delete own schedules
- ✅ View other doctors' schedules
- ❌ Cannot manage users
- ❌ Cannot view audit logs
- ❌ Cannot change roles

### CLIENTE (Patient)
- ✅ View own profile
- ✅ View all available schedules
- ❌ Cannot create schedules
- ❌ Cannot manage users
- ❌ Cannot view audit logs

---

## Data Models

### User Model
```
id              String      @id @default(cuid())
name            String
email           String      @unique
password        String
role            Role        @default(CLIENTE)
status          UserStatus  @default(ACTIVE)
profileUrl      String?
createdAt       DateTime    @default(now())
updatedAt       DateTime    @updatedAt

Relations:
- schedules: Schedule[]         (One-to-Many: Doctor → Schedules)
- refreshTokens: RefreshToken[] (One-to-Many: User → Tokens)
- auditLogs: AuditLog[]        (One-to-Many: User → Logs)
```

### Schedule Model
```
id              String          @id @default(cuid())
title           String
description     String?
startTime       DateTime
endTime         DateTime
status          ScheduleStatus  @default(ACTIVE)
createdAt       DateTime        @default(now())
updatedAt       DateTime        @updatedAt

userId          String
user            User            @relation(fields: [userId])
auditLogs       AuditLog[]

Relations:
- user: User (Many-to-One: Schedule → Doctor)
```

### RefreshToken Model
```
id              String      @id @default(cuid())
token           String      @unique
expiresAt       DateTime
createdAt       DateTime    @default(now())

userId          String
user            User        @relation(fields: [userId], onDelete: Cascade)
```

### AuditLog Model
```
id              String      @id @default(cuid())
action          AuditAction
entity          String
entityId        String?
changes         String?
createdAt       DateTime    @default(now())

userId          String
user            User        @relation("UserAuditLogs")
targetUserId    String?
targetUser      User?       @relation("TargetAuditLogs")
scheduleId      String?
schedule        Schedule?   @relation(fields: [scheduleId])
```

### Enums

#### Role
- `ADMIN` - Administrator
- `MEDICO` - Medical professional/Doctor
- `CLIENTE` - Patient/Client

#### UserStatus
- `ACTIVE` - User is active
- `INACTIVE` - User is inactive
- `SUSPENDED` - User is suspended

#### ScheduleStatus
- `ACTIVE` - Schedule is active
- `CANCELLED` - Schedule is cancelled

#### AuditAction
- `CREATE` - Record created
- `UPDATE` - Record updated
- `DELETE` - Record deleted
- `LOGIN` - User login
- `LOGOUT` - User logout
- `ROLE_CHANGE` - User role changed

---

## Authentication Flow

### Login Process
1. User submits email and password on login page
2. Frontend sends POST request to `/api/auth/login`
3. Backend validates credentials
4. If valid:
   - Access token (JWT) is generated (1 hour expiry)
   - Refresh token is generated (7 days expiry)
   - Tokens stored in HTTP-only cookies
   - User is redirected to dashboard
5. If invalid:
   - Error message is displayed

### Token Refresh
1. When access token expires, refresh endpoint is called
2. Refresh token is validated
3. New access token is issued
4. User session continues

### Logout Process
1. User clicks logout button
2. Frontend sends POST request to `/api/auth/logout`
3. Refresh token is deleted from database
4. Cookies are cleared
5. User is redirected to login page

### Protected Routes
- Routes requiring authentication check for valid access token
- If token is missing or invalid, user is redirected to login
- RBAC checks ensure user has required role for the action

---

## Troubleshooting

### Common Issues & Solutions

#### 1. **"Cannot find module 'next'"**
```bash
# Solution: Install dependencies
npm install
```

#### 2. **"DATABASE_URL is not defined"**
```bash
# Solution: Create .env.local file with DATABASE_URL
echo 'DATABASE_URL="postgresql://user:pass@localhost:5432/medical_db"' > .env.local
```

#### 3. **"Connection refused" (PostgreSQL error)**
```bash
# Check if PostgreSQL is running
# On Linux/Mac:
brew services list

# On Windows:
# Check Services app or use psql to test connection
psql -U postgres -h localhost
```

#### 4. **"Prisma Client not generated"**
```bash
# Solution: Generate Prisma Client
npx prisma generate
```

#### 5. **Port 3000 already in use**
```bash
# Solution: Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
# On Linux/Mac:
lsof -ti:3000 | xargs kill -9

# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 6. **"Invalid JWT token" after login**
```bash
# Solution: Check JWT_SECRET in .env.local
# Make sure JWT_SECRET is set and consistent
# Clear browser cookies and try login again
```

#### 7. **"TypeScript compilation errors"**
```bash
# Solution: Check TypeScript errors
npx tsc --noEmit

# Or rebuild
npm run build
```

#### 8. **"Unexpected end of JSON input" (Prisma error)**
```bash
# Solution: Reset Prisma schema
rm -rf node_modules/.prisma
npx prisma generate
```

### Useful Commands for Development

```bash
# Development server with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Lint code
npm run lint

# Format code with Prettier (if configured)
npm run format

# Open database UI
npx prisma studio

# Reset database (development only!)
npx prisma migrate reset --force

# Check migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name <migration_name>

# Generate Prisma Client
npx prisma generate
```

---

## Additional Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Related Topics
- [JWT Authentication Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Guidelines](https://owasp.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## Support & Contact

For issues, questions, or feature requests:
1. Check the Troubleshooting section
2. Review the official documentation
3. Check existing issues in the repository
4. Create a new issue with detailed description

---

**Last Updated:** April 27, 2026
**Version:** 1.0.0
**Status:** Complete Documentation
