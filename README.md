# ⚡ Iskra

**Iskra** is a modern, production-ready learning platform built for programming education. It helps educators manage courses, assignments, and students while providing instant automated code evaluation, real-time progress tracking, and AI-powered assistance.

---

## ✨ Features

- 🚀 **Automated Code Grading**
  - Instant code execution and evaluation
  - Hidden and public test cases
  - Detailed feedback for students

- 📚 **Course & Assignment Management**
  - Organize courses into modules and lessons
  - Create programming challenges and quizzes
  - Manage student enrollments

- 📊 **Student Analytics**
  - Real-time progress tracking
  - Performance statistics
  - Assignment completion monitoring

- 🤖 **Iskra AI**
  - AI-powered programming assistant
  - Intelligent hints and explanations
  - Integrated with Cloudflare AI Workers

- ⚡ **Real-Time Experience**
  - Live updates using Socket.IO
  - Instant grading notifications
  - Synchronized classroom activity

- 🎨 **Modern UI**
  - Clean and responsive interface
  - Built with Tailwind CSS
  - Optimized for desktop and mobile

---

# 🏗️ Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- Socket.IO Client

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication

## AI

- Cloudflare AI Workers

---

# 📦 Getting Started

## Prerequisites

Before running the project, make sure you have installed:

- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- npm (or yarn/pnpm)

---

## Clone the Repository

```bash
git clone https://github.com/lukajekic/iskra.git
cd iskra
```

---

## Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_FIREBASE=
VITE_BACKEND=
VITE_METRICA=   # Optional
```

### Backend (`backend/.env`)

```env
VITE_FRONTEND=
JWT_SECRET=
PORT=
AI_ENDPOINT=
AI_API_KEY=
```

### AI Configuration

| Variable | Description |
|----------|-------------|
| `AI_ENDPOINT` | Cloudflare AI Workers endpoint for the language model used by Iskra AI. |
| `AI_API_KEY` | API key used to access the configured Cloudflare AI Worker. |

---

# 🚀 Running the Project

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm run dev
```

---

# 📁 Project Structure

```
iskra/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   └── ...
│
└── README.md
```

---

# 🌟 Highlights

- Automated programming assignment grading
- AI-powered learning assistant
- Real-time student progress
- Course and classroom management
- Modern responsive interface
- Production-ready architecture
- REST API + WebSockets
- Secure JWT authentication

---

# 🤝 Contributing

Contributions are welcome!

If you'd like to improve Iskra, feel free to open an issue.


---

# 🚩 Report a problem

If you have experienced any issue while using Iskra, feel free to contact us and submit a ticket at: **podrska@iskraedu.zohodesk.eu**

---

# 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ to make programming education smarter.**

</div>