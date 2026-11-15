# 📚 StudyBuddy AI

**StudyBuddy AI** is a free, open-source educational web application designed to help students learn faster and smarter. Powered by Google's **Gemini AI**, it provides instant tutoring, generates study materials, and builds personalized schedules — all without requiring a user account.

## ✨ Features

- **💡 AI Tutor:** Ask any question and receive a structured, level-appropriate explanation complete with an everyday example, a common mistake to avoid, and a quick check question.
- **🃏 Flashcard Generator:** Paste raw study notes and instantly transform them into an interactive, 3D-flippable flashcard deck categorized by difficulty.
- **📝 Auto-Graded Quizzes:** Generate multiple-choice quizzes on any topic, take them in the browser, and get instant scores with explanations.
- **📅 Smart Study Planner:** Input your subjects, exam date, and weak topics to receive a realistic, day-by-day study schedule.
- **🔒 Zero-Friction Auth:** No registration required. The app uses a secure guest-session system to save your progress locally.
- **🎨 Premium UI/UX:** A highly polished, responsive interface featuring glassmorphism, animated aurora backgrounds, smooth page transitions, and a fully mobile-friendly layout.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js (v5)
- **Database:** MongoDB Atlas (via Mongoose)
- **AI Integration:** Google Gemini API (`gemini-3.5-flash-lite`)
- **Frontend:** Plain HTML5, CSS3, Vanilla JavaScript (ES Modules) — _No heavy frameworks, no build step required._
- **Security:** Helmet, Express-Rate-Limit, Express-Mongo-Sanitize, Bcrypt

## 🚀 Quick Start (Local Development)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/studybuddy-ai.git
   cd studybuddy-ai
   ```
