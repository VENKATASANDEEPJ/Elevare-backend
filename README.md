# 🚀 Elevare — Goal & Streak Tracking SaaS

Elevare is a startup-grade productivity platform designed to track goals, streaks, and progress with secure multi-user architecture and scalable frontend-backend separation.

---

## 🏗 Architecture

Monorepo Structure:

Elevare/
 ├── backend/   → Node.js + Express + MongoDB API
 └── Frontend/  → React (Vite) Client Application

---

## 🔐 Backend Features (Production-Ready Core)

### ✅ Authentication System
- User registration
- Secure password hashing (bcrypt)
- JWT-based authentication
- Protected routes middleware

### ✅ Multi-User Data Isolation
- Goals linked to specific users
- Authorization checks on update/delete
- Secure ownership validation

### ✅ Goal Management
- Create goals
- Update goals
- Delete goals
- Mark goals as completed
- Completion timestamp tracking

### ✅ Streak Engine (Completion-Based)
- Streak increments only when a goal is completed
- Daily activity tracking
- Automatic streak reset on missed day
- Longest streak tracking

### ✅ Progress Analytics API
- Total goals count
- Completed goals count
- Completion percentage endpoint

### ✅ Profile Endpoint
GET /api/users/me  
Returns:
- Current streak
- Longest streak
- Last active date
- User information (without password)

---

## 🛠 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Local, Atlas-ready)
- Mongoose
- JWT
- Bcrypt
- Nodemon

### Frontend (In Progress)
- React (Vite)
- Planned: React Router
- Planned: Protected routes
- Planned: Dashboard analytics UI

---

## 📊 Current Project Status

Backend Core: ✅ Complete  
Security & Authorization: ✅ Complete  
Streak System: ✅ Implemented  
Progress Analytics: ✅ Implemented  
Frontend UI: 🚧 Starting Next Phase  

Overall Completion: ~55%

---

## 🎯 Next Phase

- React frontend architecture
- Authentication UI
- Dashboard interface
- Protected client routes
- Analytics visualization
- Deployment (Render + Vercel)
- MongoDB Atlas migration

---

Built by Venkata Sandeep J  
Startup-focused full-stack system design project.
