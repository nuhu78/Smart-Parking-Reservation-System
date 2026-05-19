# Smart Parking Reservation System

A full-stack application for managing parking reservations with real-time slot availability, user authentication, and admin controls. Built with NestJS backend and Next.js frontend.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Backend API Documentation](#backend-api-documentation)
- [Features](#features)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Contributing](#contributing)

## 🎯 Project Overview

Smart Parking Reservation System is a comprehensive solution for managing parking spaces and reservations. It provides:

- **User Management**: Registration, login, and password reset functionality
- **Parking Areas**: Create and manage different parking locations
- **Parking Slots**: Dynamic slot creation and status management
- **Reservations**: Book, view, and cancel parking slots
- **Admin Dashboard**: Manage users, locations, and reservations
- **Email Notifications**: Automated email confirmations and cancellations

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport.js
- **Email Service**: Nodemailer with Handlebars templates

### Frontend
- **Framework**: Next.js (React)
- **Styling**: CSS Modules
- **State Management**: Zustand
- **HTTP Client**: Axios

## 📁 Project Structure

```
smart-parking-backend/        # NestJS Backend
├── src/
│   ├── auth/                 # Authentication module (JWT, roles)
│   ├── parking/              # Parking areas management
│   ├── slots/                # Parking slots management
│   ├── reservations/         # Reservation management
│   ├── users/                # User management
│   ├── mail/                 # Email notifications
│   └── main.ts              # Application entry point
└── test/                     # E2E and unit tests

smart-parking-frontend/       # Next.js Frontend
├── src/
│   ├── app/                  # Page components
│   ├── components/           # Reusable components
│   ├── services/             # API client services
│   └── store/                # State management
└── public/                   # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 📡 Backend API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication

Most endpoints require JWT authentication. Include the token in the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

---

## **Auth Module** (`/auth`)

#### 1. **Register User**
```http
POST /auth/register
```
**Description**: Register a new user account
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```
- **Response**: User object with JWT token

#### 2. **Login**
```http
POST /auth/login
```
**Description**: Authenticate user and receive JWT token
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
- **Response**: User object with JWT token

#### 3. **Register Admin**
```http
POST /auth/register-admin
```
**Description**: Register a new admin account (restricted endpoint)
- **Authentication**: No
- **Body**:
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin User"
}
```
- **Response**: Admin user object with JWT token

#### 4. **Get Current User Profile**
```http
GET /auth/me
```
**Description**: Get authenticated user's profile information
- **Authentication**: ✅ Required (JWT)
- **Response**: User object

#### 5. **Forgot Password**
```http
POST /auth/forgot-password
```
**Description**: Send password reset code to user's email
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com"
}
```
- **Response**: Success message with reset code sent

#### 6. **Reset Password**
```http
POST /auth/reset-password
```
**Description**: Reset password using code sent to email
- **Authentication**: No
- **Body**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newpassword123"
}
```
- **Response**: Success message

---

## **Parking Module** (`/parking`)

#### 1. **Create Parking Area**
```http
POST /parking
```
**Description**: Create a new parking location (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Body**:
```json
{
  "name": "Downtown Parking",
  "address": "123 Main Street",
  
}
```
- **Response**: Created parking area object

#### 2. **Get All Parking Areas**
```http
GET /parking
```
**Description**: Retrieve all parking locations with optional search
- **Authentication**: ✅ Required (JWT)
- **Query Parameters**:
  - `search` (optional): Search parking areas by name or address
- **Response**: Array of parking area objects

#### 3. **Update Parking Area**
```http
PATCH /parking/:id
```
**Description**: Update parking area details (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Parking area ID
- **Body**:
```json
{
  "name": "Downtown Parking Updated",
  "address": "124 Main Street",
  
}
```
- **Response**: Updated parking area object

#### 4. **Delete Parking Area**
```http
DELETE /parking/:id
```
**Description**: Delete a parking location (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Parking area ID
- **Response**: Success message

---

## **Slots Module** (`/slots`)

#### 1. **Create Parking Slot**
```http
POST /slots
```
**Description**: Add a new parking slot to a location (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Body**:
```json
{
  "slotNumber": "A-01",
  "parkingAreaId": 1,
  
}
```
- **Response**: Created slot object

#### 2. **Get All Slots**
```http
GET /slots
```
**Description**: Retrieve all parking slots
- **Authentication**: ✅ Required (JWT)
- **Response**: Array of slot objects

#### 3. **Update Slot**
```http
PATCH /slots/:id
```
**Description**: Update slot details or status (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Slot ID
- **Body**:
```json
{
  "status": "reserved",
  "type": "handicap"
}
```
- **Response**: Updated slot object

#### 4. **Delete Slot**
```http
DELETE /slots/:id
```
**Description**: Remove a parking slot (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `id` - Slot ID
- **Response**: Success message

---

## **Reservations Module** (`/reservations`)

#### 1. **Create Reservation**
```http
POST /reservations
```
**Description**: Reserve a parking slot
- **Authentication**: ✅ Required (JWT)
- **Body**:
```json
{
  "slotId": 1
}
```
- **Response**: Created reservation object with confirmation details

#### 2. **Get My Reservations**
```http
GET /reservations/my
```
**Description**: Retrieve all reservations for the logged-in user
- **Authentication**: ✅ Required (JWT)
- **Response**: Array of user's reservation objects

#### 3. **Cancel Reservation**
```http
DELETE /reservations/:id
```
**Description**: Cancel an existing reservation
- **Authentication**: ✅ Required (JWT)
- **Parameters**: `id` - Reservation ID
- **Response**: Success message with cancellation details

#### 4. **Cancel Reservation by Slot ID** (Admin only)
```http
DELETE /reservations/slot/:slotId
```
**Description**: Cancel a reservation by slot ID (Admin only)
- **Authentication**: ✅ Required (JWT)
- **Authorization**: 🔒 Admin role required
- **Parameters**: `slotId` - Slot ID
- **Response**: Success message

---

## **Root Endpoint**

#### 1. **Health Check**
```http
GET /
```
**Description**: API health check endpoint
- **Authentication**: No
- **Response**: "Hello World!" message

---

## 🎨 Features

### User Features
- ✅ User registration and login
- ✅ Password reset functionality
- ✅ View available parking slots
- ✅ Reserve parking slots
- ✅ View personal reservations
- ✅ Cancel reservations
- ✅ Email notifications for confirmations and cancellations

### Admin Features
- ✅ Create and manage parking areas
- ✅ Create and manage parking slots
- ✅ Update slot status
- ✅ View all reservations
- ✅ Cancel reservations manually
- ✅ Search parking areas

### Security
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Protected routes with guards
- ✅ Email verification for password reset

---

## 📥 Installation

### Backend Setup

1. **Navigate to backend directory**
```bash
cd smart-parking-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env` file**
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
DATABASE_NAME=smart_parking
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

4. **Create PostgreSQL database**
```bash
createdb smart_parking
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd smart-parking-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create `.env.local` file**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## ▶️ Running the Application

### Backend

**Development Mode**
```bash
cd smart-parking-backend
npm run start:dev
```

**Production Mode**
```bash
npm run build
npm run start:prod
```

**Run Tests**
```bash
npm run test
npm run test:e2e
```

### Frontend

**Development Mode**
```bash
cd smart-parking-frontend
npm run dev
```

The frontend will be available at `http://localhost:300`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the UNLICENSED license.

---

## 📧 Support

For support or questions, please open an issue on GitHub.

---

**Last Updated**: May 2026
