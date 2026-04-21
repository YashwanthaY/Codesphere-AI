# CodeSphere AI 🚀

<div align="center">

![CodeSphere AI Banner](https://img.shields.io/badge/CodeSphere-AI%20Platform-blue?style=for-the-badge&logo=react)

**Your AI-Powered Developer Productivity Platform**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=flat&logo=python)](https://python.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat&logo=tailwindcss)](https://tailwindcss.com)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-4285F4?style=flat&logo=google)](https://ai.google.dev)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel)](https://vercel.com)

[🔗 Live Demo](#) · [📁 GitHub Repo](https://github.com/YashwanthaY/Codesphere-AI) · [🐛 Report Bug](#)

</div>

---

## 📌 Problem Statement

Engineering students preparing for campus placements struggle with scattered resources — DSA practice on one site, SQL on another, OS concepts in textbooks, and mock interviews on paid platforms. There is no single free platform that covers all technical interview topics with AI assistance.

**CodeSphere AI solves this** by combining 8 powerful modules into one beautiful, AI-integrated web application — completely free.

---

## ✨ Features

### 🏠 Dashboard
- Real-time XP tracking and level progression (Beginner → Expert)
- Day streak counter that updates daily
- Module overview with quick navigation
- Recent activity feed from all modules

### 🌲 DSA Visualizer
- Animate 5 algorithms: Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Binary Search
- Step-by-step animation with Play, Pause, Reset, Speed controls
- C++ code panel with syntax highlighting alongside animations
- Color-coded visualization: Yellow (comparing), Red (swapping), Green (sorted)
- Time & Space complexity shown for each algorithm

### 🗄️ SQL Playground
- Real SQLite running in browser via WebAssembly (sql.js)
- 3 preloaded databases: Students DB, E-Commerce DB, Hospital DB
- Live SQL query execution with results table
- Chart.js toggle: visualize results as bar/pie charts
- DBMS concept cards: JOIN, GROUP BY, INDEX, FOREIGN KEY

### ⚙️ OS Simulator
- CPU Scheduling: FCFS, SJF, Priority, Round Robin with custom quantum
- Animated Gantt chart with hover tooltips
- Average waiting time and turnaround time calculations
- Memory Management: Fixed vs Dynamic partitioning visual
- Page Replacement: FIFO and LRU simulation with hit/miss tracking

### 🤖 AI Code Reviewer
- Paste any code (Python, JavaScript, C++, Java, TypeScript, SQL)
- Google Gemini AI returns: bug list, quality score (1-10), suggestions, improved code
- Severity classification: High / Medium / Low
- Review history saved to localStorage
- Backend: Python Flask REST API

### 📊 Analytics Dashboard
- Connect with any public GitHub username
- Power BI style KPI cards: repos, stars, forks, followers
- Bar chart and pie chart for language breakdown (Chart.js)
- Top repositories by stars table
- Recent activity feed

### 🎤 Interview Coach (with Timer!)
- AI generates unique questions per topic and difficulty
- Topics: JavaScript, React, CSS, DSA, OS, SQL, Python, System Design
- Difficulty levels: Easy (90s), Medium (60s), Hard (45s)
- Countdown timer with color change (green → amber → red)
- Auto-submit when timer hits 0
- AI evaluates answers and gives score + detailed feedback
- Final report with time stats and weak topic identification

### 🌟 Portfolio Generator
- Fill a form: name, skills, projects, education, experience
- 6 color themes: Ocean, Galaxy, Forest, Sunset, Rose, Clean
- Live preview mode
- Download as ready-to-host HTML file

### 🏆 Leaderboard
- Real Firebase leaderboard with all registered users
- 28 achievements across 7 modules
- XP history log with timestamps
- Level system: Beginner → Junior → Mid → Senior → Expert

---

## 🛠️ Tech Stack

| Category      | Technologies                                                  |
|---------------|---------------------------------------------------------------|
| **Frontend**  | React.js 18, Vite, Tailwind CSS, React Router DOM            |
| **State**     | React Context API (Auth, XP, Toast), localStorage            |
| **Backend**   | Python 3.x, Flask, Flask-CORS, python-dotenv                 |
| **AI**        | Google Gemini 2.0 Flash API                                  |
| **Auth**      | Firebase Authentication (Google OAuth)                        |
| **Database**  | Firebase Firestore, SQLite via WebAssembly (sql.js)          |
| **Charts**    | Chart.js, react-chartjs-2                                    |
| **Icons**     | Lucide React                                                  |
| **APIs**      | GitHub REST API (public, no auth required)                   |
| **Deploy**    | Vercel (frontend), Render (backend)                          |
| **DevOps**    | Git, GitHub, GitHub Actions (CI/CD)                          |

---

## 📁 Project Structure

```
codesphere-ai/
├── src/
│   ├── components/
│   │   └── Layout/
│   │       ├── Sidebar.jsx      # Navigation + XP bar
│   │       ├── Navbar.jsx       # Search + notifications + theme
│   │       └── Layout.jsx       # Shell wrapper
│   ├── context/
│   │   ├── AuthContext.jsx      # Firebase auth state
│   │   ├── ToastContext.jsx     # Global notifications
│   │   └── XPContext.jsx        # XP + level system
│   ├── pages/
│   │   ├── Dashboard.jsx        # Home with real stats
│   │   ├── DSAVisualizer.jsx    # Algorithm animations
│   │   ├── SQLPlayground.jsx    # Live SQL editor
│   │   ├── OSSimulator.jsx      # CPU scheduling
│   │   ├── AICodeReviewer.jsx   # Gemini code review
│   │   ├── AnalyticsDashboard.jsx # GitHub analytics
│   │   ├── InterviewCoach.jsx   # AI interviews + timer
│   │   ├── PortfolioGenerator.jsx # Portfolio creator
│   │   ├── Leaderboard.jsx      # Firebase leaderboard
│   │   └── Login.jsx            # Google auth page
│   ├── services/
│   │   └── userService.js       # Firestore CRUD
│   ├── config/
│   │   └── firebase.js          # Firebase config
│   ├── hooks/
│   │   ├── useDarkMode.js
│   │   └── useLocalStorage.js
│   └── utils/
│       ├── algorithms.js        # DSA step generators
│       ├── scheduling.js        # OS scheduling logic
│       ├── sqlDatabases.js      # Sample DB schemas
│       └── githubApi.js         # GitHub API calls
├── backend/
│   ├── app.py                   # Flask server
│   ├── routes/
│   │   ├── review.py            # /api/review endpoint
│   │   └── interview.py         # /api/interview endpoints
│   ├── services/
│   │   └── gemini_service.py    # Gemini API integration
│   └── requirements.txt
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- Git
- Google Firebase account (free)
- Google Gemini API key (free)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/YashwanthaY/Codesphere-AI.git
cd Codesphere-AI

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your GEMINI_API_KEY to .env

# Start Flask server
python app.py
```

### Environment Variables

Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

Get your free Gemini API key at: https://aistudio.google.com/app/apikey

### Firebase Setup

1. Create project at https://console.firebase.google.com
2. Enable Google Authentication
3. Enable Firestore Database
4. Copy config to `src/config/firebase.js`

---

## 🌐 Deployment

### Frontend → Vercel
```bash
# Push to GitHub
git add .
git commit -m "Deploy to Vercel"
git push

# Connect repo at vercel.com → Auto-deploys on push
```

### Backend → Render
```bash
# Set root directory to /backend
# Build command: pip install -r requirements.txt
# Start command: gunicorn app:app
# Add GEMINI_API_KEY environment variable
```

---

## 💡 Skills Demonstrated

| Skill | Evidence |
|-------|----------|
| React.js + Hooks | useState, useEffect, useCallback, useRef, custom hooks |
| React Context API | Auth, XP, Toast — 3 global context providers |
| Firebase | Google Auth, Firestore real-time database |
| Python Flask | REST API with 4 endpoints, CORS, error handling |
| AI Integration | Google Gemini API with prompt engineering |
| WebAssembly | SQLite running in browser via sql.js |
| Chart.js | Bar, Pie charts with real data |
| CSS Animations | Custom keyframes, stagger delays, glass effects |
| GitHub REST API | Public API without authentication |
| Responsive Design | Mobile-first with Tailwind CSS |
| localStorage | Persistent state across sessions |
| Git/GitHub | Version control with meaningful commits |
| Deployment | Vercel + Render with CI/CD pipeline |
| Algorithm Implementation | Bubble, Selection, Insertion, Merge Sort, Binary Search |
| OS Concepts | FCFS, SJF, Priority, Round Robin, Page Replacement |

---

## 🔮 Future Improvements

- [ ] More DSA algorithms: Quick Sort, Heap Sort, Binary Tree, Graph BFS/DFS
- [ ] SQL challenges with scoring system
- [ ] Code editor with syntax highlighting (Monaco Editor)
- [ ] Real-time collaborative coding (WebSockets)
- [ ] Mobile app (React Native)
- [ ] Progress reports via email (SendGrid)
- [ ] Company-specific interview tracks

---

## 👨‍💻 Author

**Yashwantha Y**
- 🎓 Final Year B.Tech CSE(AI&ML) Student
- 📍 Karnataka, India
- 🔗 GitHub: [@YashwanthaY](https://github.com/YashwanthaY)
- 💼 LinkedIn: [Add your LinkedIn]
- 📧 Email: [yashwanthagastya12@gmail.com]

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

Built with ❤️ using React.js · Python Flask · Google Gemini AI · Firebase

</div>