# 🎓 EduKids - Multilingual Learning Platform
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
A full-stack, production-ready kids learning platform for Classes 1–6 with multilingual support (English, Hindi, Punjabi), AI-powered assistant, quiz system, gamification, and role-based dashboards.

---

## 🏗️ Tech Stack

| Layer      | Technology                                      |
|------------|--------------------------------------------------|
| Frontend   | React.js, Tailwind CSS, Framer Motion, Recharts |
| Backend    | Node.js, Express.js                             |
| Database   | PostgreSQL + Prisma ORM                         |
| Auth       | JWT + OTP Email Verification                    |
| AI         | Google Gemini API (`gemini-pro`)                |
| Email      | Nodemailer (Gmail SMTP)                         |
| Security   | bcrypt, Helmet, express-rate-limit              |

---

## 📁 Project Structure

```
edukids/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Full DB schema
│   │   └── seed.js                # Seed data (demo users + content)
│   ├── src/
│   │   ├── index.js               # Express app entry
│   │   ├── config/
│   │   │   └── prisma.js          # Prisma client
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT + role middleware
│   │   │   └── validation.js      # Input validation rules
│   │   ├── routes/
│   │   │   ├── auth.js            # Signup, OTP, Login
│   │   │   ├── student.js         # Student APIs
│   │   │   ├── teacher.js         # Teacher APIs
│   │   │   ├── admin.js           # Admin APIs
│   │   │   └── ai.js              # Gemini AI chat/hint
│   │   └── services/
│   │       ├── emailService.js    # OTP email via Nodemailer
│   │       └── geminiService.js   # Google Gemini integration
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js                 # Router + Protected routes
    │   ├── index.js
    │   ├── index.css              # Tailwind + custom styles
    │   ├── context/
    │   │   └── AuthContext.js     # Global auth state
    │   ├── utils/
    │   │   ├── api.js             # Axios instance
    │   │   └── i18n.js            # Translations (en/hi/pa)
    │   ├── components/shared/
    │   │   ├── StudentLayout.js   # Student sidebar + AI chat
    │   │   ├── TeacherLayout.js   # Teacher sidebar
    │   │   └── AdminLayout.js     # Admin dark sidebar
    │   └── pages/
    │       ├── LandingPage.js
    │       ├── LoginPage.js
    │       ├── SignupPage.js      # With full validation
    │       ├── OtpPage.js
    │       ├── student/
    │       │   ├── StudentDashboard.js
    │       │   ├── SubjectsPage.js
    │       │   ├── ChaptersPage.js
    │       │   ├── ContentPage.js
    │       │   ├── QuizPage.js    # With AI hints
    │       │   ├── RemarksPage.js
    │       │   └── LeaderboardPage.js
    │       ├── teacher/
    │       │   ├── TeacherDashboard.js
    │       │   ├── StudentsPage.js
    │       │   ├── CreateQuizPage.js
    │       │   └── AnalyticsPage.js
    │       └── admin/
    │           ├── AdminDashboard.js
    │           ├── ManageUsersPage.js
    │           └── ManageContentPage.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Google Gemini API key
- Gmail account with App Password (for OTP)

---

### 1. Clone & Install

```bash
# Backend
cd edukids/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2. Configure Backend Environment

```bash
cd edukids/backend
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/edukids"
JWT_SECRET="your-super-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=5000

# Gmail SMTP (use App Password, not regular password)
# Steps: Google Account > Security > 2-Step Verification > App Passwords
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="youremail@gmail.com"
SMTP_PASS="your-16-char-app-password"
FROM_EMAIL="EduKids <youremail@gmail.com>"

# Google Gemini (get from https://makersuite.google.com/app/apikey)
GEMINI_API_KEY="AIza..."

FRONTEND_URL="http://localhost:3000"
```

---

### 3. Setup PostgreSQL Database

```bash
# Create DB
createdb edukids

# OR using psql:
psql -U postgres -c "CREATE DATABASE edukids;"

# Run Prisma migrations
cd edukids/backend
npx prisma generate
npx prisma migrate dev --name init

# Seed demo data
node prisma/seed.js
```

---

### 4. Start Backend

```bash
cd edukids/backend
npm run dev   # Development (with nodemon)
# OR
npm start     # Production
```

Backend runs at: `http://localhost:5000`

---

### 5. Start Frontend

```bash
cd edukids/frontend
npm start
```

Frontend runs at: `http://localhost:3000`

The React app proxies API calls to `http://localhost:5000` (configured in `package.json`).

---

## 🔑 Demo Credentials

After running seed:

| Role    | Email                    | Password       |
|---------|--------------------------|----------------|
| Admin   | admin@edukids.com        | Admin@123      |
| Teacher | teacher@edukids.com      | Teacher@123    |
| Student | student@edukids.com      | Student@123    |

---

## 🌐 Language Logic

### Rules (strictly implemented):

1. **Language subjects** (Hindi, English) → **NEVER translated**
   - Hindi subject always served in `hi`
   - English subject always served in `en`

2. **Non-language subjects** (Maths, EVS, Science, Social Science) → **served in student's selected language**
   - Falls back to `en` if content not available in selected language

3. **Student can change language** from their Dashboard sidebar

4. **AI Buddy** responds in the student's selected language

### Database Language Field:
```
contents.language = 'en' | 'hi' | 'pa'
students.language = 'en' | 'hi' | 'pa'
```

---

## 📋 API Endpoints

### Auth
```
POST   /api/auth/signup/student    Student registration
POST   /api/auth/signup/teacher    Teacher registration
POST   /api/auth/verify-otp        OTP verification
POST   /api/auth/resend-otp        Resend OTP
POST   /api/auth/login             Login (all roles)
GET    /api/auth/me                Get current user
```

### Student (requires JWT + STUDENT role)
```
GET    /api/student/dashboard
GET    /api/student/subjects
GET    /api/student/chapters/:subjectId
GET    /api/student/content/:chapterId
GET    /api/student/quizzes/:subjectId
GET    /api/student/quiz/:quizId
POST   /api/student/quiz/attempt
GET    /api/student/remarks
GET    /api/student/leaderboard
PUT    /api/student/settings
```

### Teacher (requires JWT + TEACHER role)
```
GET    /api/teacher/dashboard
GET    /api/teacher/students
GET    /api/teacher/analytics
GET    /api/teacher/leaderboard
POST   /api/teacher/quiz/create
POST   /api/teacher/questions/add
POST   /api/teacher/remarks/add
```

### Admin (requires JWT + ADMIN role)
```
GET    /api/admin/overview
GET    /api/admin/users
DELETE /api/admin/users/:id
POST   /api/admin/subjects/add
POST   /api/admin/chapters/add
POST   /api/admin/content/add
```

### AI
```
POST   /api/ai/chat     AI conversation (Gemini)
POST   /api/ai/hint     Quiz hint (Gemini)
```

---

## 🤖 AI Integration (Google Gemini)

### Setup:
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Generate an API key
3. Add to `.env`: `GEMINI_API_KEY=your-key`

### Features:
- **Buddy Chat**: Student asks any study question → Gemini answers in simple kid-friendly language in their selected language
- **Quiz Hints**: During quiz, student can request an AI hint without revealing the answer

### Prompt Engineering:
```javascript
"You are a friendly teacher named Buddy for kids in Class {N}.
Explain in very simple language appropriate for a {N+4} year old child.
Always be positive and encouraging! Use emojis 🌟
Keep answers short (3-5 sentences max).
Respond in {student's language}."
```

---

## 🎮 Gamification System

| Action               | Reward                    |
|----------------------|---------------------------|
| Complete a quiz      | Score points              |
| 90%+ accuracy        | ⭐⭐⭐ 3 Stars             |
| 60–89% accuracy      | ⭐⭐ 2 Stars               |
| 30–59% accuracy      | ⭐ 1 Star                 |
| 100% perfect score   | 🏅 Badge                  |
| Reading content      | Progress % increase       |

---

## ✅ Validation Rules

### Student Signup:
| Field         | Rule                                              |
|---------------|---------------------------------------------------|
| name          | Alphabets only, min 3 chars                       |
| age           | Integer, 5–15                                     |
| dob           | Valid past date                                   |
| parentName    | Required                                          |
| email         | Valid email format                                |
| phone         | Exactly 10 digits                                 |
| password      | Min 6 chars + at least 1 number                  |
| OTP           | 6 numeric digits, expires in 5 minutes           |

Validation is enforced on **both frontend and backend**.

---

## 🔐 Security Features

- **bcrypt** password hashing (12 rounds)
- **JWT** authentication with expiry
- **Role-based middleware** (STUDENT | TEACHER | ADMIN)
- **OTP verification** required before login
- **Rate limiting** on all API routes (100 req/15 min)
- **Stricter rate limiting** on AI endpoints (10 req/min)
- **Helmet** HTTP security headers
- **Input validation** middleware on all POST routes
- **CORS** configured for frontend URL only

---

## 🗄️ Database Schema

See `backend/prisma/schema.prisma` for the full relational schema with all models, relations, and constraints.

Key tables:
- `users` → base authentication
- `students` → extended student data with `language` field
- `teachers`, `admins`
- `subjects` → with `isLang` flag for language logic
- `chapters`, `contents` → with `language` field
- `quizzes`, `questions`, `student_answers`
- `remarks`, `progress`, `leaderboard`
- `otp_verification`

---

## 🚢 Production Deployment

### Backend:
```bash
# Set NODE_ENV=production in .env
# Run migrations
npx prisma migrate deploy
# Start
npm start
```

### Frontend:
```bash
# Set REACT_APP_API_URL=https://your-api.com/api
npm run build
# Serve the build folder with nginx or serve
```

### Recommended:
- Backend: Railway, Render, or AWS EC2
- Frontend: Vercel or Netlify
- Database: Supabase or Railway PostgreSQL

---

## 📦 Environment Variables Summary

```
DATABASE_URL        PostgreSQL connection string
JWT_SECRET          Secret for JWT signing
JWT_EXPIRES_IN      Token expiry (e.g. "7d")
PORT                Backend port (default: 5000)
SMTP_HOST           Gmail SMTP host
SMTP_PORT           587
SMTP_USER           Gmail address
SMTP_PASS           Gmail App Password
FROM_EMAIL          Sender display name + email
GEMINI_API_KEY      Google Generative AI key
FRONTEND_URL        React app URL (for CORS)
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper commit messages
4. Submit a pull request

---

Built with ❤️ for kids who love to learn! 🎓⭐
