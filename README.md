# EduSphere — AI-Powered Learning Management System (LMS)

EduSphere is a state-of-the-art, secure, production-ready Learning Management System built with Node.js, Express, React, WebRTC, Socket.IO, and MongoDB.

---

## 🌟 Key Features

1. **Passwordless Email OTP Authentication**:
   - 6-digit cryptographic OTP generation with bcrypt hashing.
   - 10-minute automatic TTL expiration & single-use cleanup.
   - Rate limiting (max 10/10min in prod) & 120-second resend cooldown.
   - Auto user creation with default `student` role.

2. **Google OAuth 2.0 Integration**:
   - Google Sign-In with backend ID Token verification via `google-auth-library`.
   - Prevent duplicate account creation and automatically issue EduSphere JWT.

3. **Role-Based Access Control (RBAC)**:
   - Three distinct user roles: `Student`, `Faculty`, `Admin`.
   - Backend middleware enforcement (`requireRole(['faculty','admin'])`, `requireAdmin`).

4. **In-App Google Meet-Style WebRTC Live Classrooms**:
   - Integrated video calling directly inside EduSphere (`/live-class/:meetingId`).
   - WebRTC peer-to-peer mesh with STUN servers (`stun:stun.l.google.com:19302`).
   - Real-time Socket.IO signaling namespace (`/live`).
   - Audio/Video toggles, Screen Sharing, Raise Hand, Live Attendance recording, and In-Class Chat.

5. **Course, Assignment & Exam Management**:
   - Rich course modules, lesson progression tracking, and video/PDF content.
   - Assignment creation, file submission, grading, and feedback.
   - Proctoring-ready Exam Center with AI eye-tracking and face-mesh detection.

6. **Notification & Audit System**:
   - User notification center with unread count badges.
   - Security audit logs for login events, role changes, and administrative actions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router v7, Lucide Icons, Axios, Socket.IO Client.
- **Backend**: Node.js, Express 5, Socket.IO, Mongoose, JWT, Nodemailer, bcryptjs, express-validator, express-rate-limit, google-auth-library.
- **Database**: MongoDB (Local or MongoDB Atlas).
- **Real-Time Communication**: WebRTC + Socket.IO.

---

## ⚙️ Environment Configuration

### Backend (`edusphere-backend/.env`)
```ini
PORT=5050
NODE_ENV=development
JWT_SECRET=edusphere_secure_key_2026
MONGODB_URI=mongodb://127.0.0.1:27017/edusphere

# OTP Settings
OTP_EXPIRATION_MINUTES=10
OTP_MAX_ATTEMPTS=5
OTP_RESEND_COOLDOWN_SECONDS=120

# SMTP Setup (for real email delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=EduSphere <no-reply@edusphere.com>

# Google OAuth Setup
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5050/api/auth/google/callback
```

### Frontend (`edusphere-frontend/.env`)
```ini
REACT_APP_API_URL=http://localhost:5050
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 🚀 Quick Start Guide

### 1. Start the Backend Server
```bash
cd edusphere-backend
npm install
npm start
```
*Backend runs on `http://localhost:5050`.*

### 2. Start the Frontend Server
```bash
cd edusphere-frontend
npm install
PORT=3001 npm start
```
*Frontend runs on `http://localhost:3001`.*

---

## 🧪 Testing

Run the automated E2E test suite:
```bash
bash test_phase3.sh
```

---

## 📜 License
ISC License © 2026 EduSphere Engineering Team.
