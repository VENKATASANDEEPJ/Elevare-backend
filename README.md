# 🚀 Elevare — Smart Goal & Productivity Platform

Elevare is a full-stack productivity platform designed to help users set goals, stay consistent, and track progress with intelligent reminders and a clean user experience.

It focuses on transforming scattered intentions into structured, trackable outcomes.

---

# 🧠 Vision

Modern productivity tools are either too complex or too minimal.
Elevare aims to strike the balance by providing:

* Clear goal tracking
* Actionable progress visibility
* Smart notifications
* A distraction‑free experience

The long-term vision is to evolve Elevare into an **AI-assisted growth platform** that guides users toward consistent improvement.

---

# ✨ Features

## 🔐 Authentication

* Secure user signup & login
* JWT based authentication
* Protected routes

## 🎯 Goal Management

* Create and manage goals
* Track streaks and progress
* Structured goal data model

## 🔔 Notifications

* Reminder system foundation
* Extensible notification architecture

## 🖥️ Frontend Foundation

* React + TypeScript setup
* Dashboard layout
* Auth context integration

---

# 🏗️ Tech Stack

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* JWT Authentication

## Frontend

* React
* TypeScript
* Vite

## Dev Tools

* Git & GitHub
* MongoDB Compass
* REST APIs

---

# 📂 Project Structure

```
Elevare
 ├── backend
 │   └── server
 │       ├── controllers
 │       ├── models
 │       ├── routes
 │       ├── middleware
 │       └── utils
 │
 └── frontend
     ├── components
     ├── pages
     ├── services
     ├── context
     ├── utils
     └── config
```

---

# ⚙️ Configuration

## Frontend Environment

Create a `.env` file inside **frontend/**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Backend Environment

Create `.env` inside **backend/server/**

```env
MONGO_URI=<your mongodb connection string>
JWT_SECRET=<your secret key>
PORT=5000
```

---

# ⚙️ Getting Started

## 1️⃣ Clone the repository

```bash
git clone https://github.com/VENKATASANDEEPJ/Elevare-backend.git
cd Elevare-backend
```

---

## 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```
http://localhost:5000
```

---

## 3️⃣ Install Frontend Dependencies

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 🛣️ Roadmap

Upcoming development phases:

* Goal completion tracking system
* Daily reminder notifications
* Analytics dashboard
* Smart productivity insights
* Deployment & live demo

---

# 📌 Current Status

🟢 Authentication system completed

🟢 Goal creation & dashboard working

🟢 MongoDB Atlas cloud database integrated

🟢 Full‑stack architecture functional

🟡 UI improvements and feature expansion ongoing

---

# 🤝 Contributing

This project is currently under active development.

Contributions, suggestions, and feedback are welcome.

---

# 📜 License

This project is open-source and available under the MIT License.

---

# 👨‍💻 Author

**J Venkata Sandeep**
Aspiring Software Engineer | Full‑Stack Developer | Builder

---

⭐ If you like this project, consider giving it a star!
