# 📘 AptiTrack – Aptitude Tracker & Progress Dashboard  

**AptiTrack** is a full-stack aptitude preparation and tracking platform that helps users monitor their performance across various topics, attempt smart quizzes, and visualize progress over time.  
It is designed for students and job seekers aiming to improve aptitude skills with measurable insights and AI-powered explanations.  

---

## 🚀 Features  

- 🔐 **User Authentication** (JWT-based login and secure routes)  
- 🧮 **Topic-Wise Practice** – Curated questions with topic & difficulty filters  
- ⏱️ **Timed Quizzes** – Interactive multi-question quizzes with navigation  
- 📊 **Visual Analytics**:  
  - Topic-wise scores (Bar Chart)  
  - Accuracy Summary (Pie Chart)  
  - Daily Quiz Attempts (Area Chart)  
  - Average Time Taken per quiz  
- 📂 **Date & Topic Filters** – Drill down your stats with flexible filters 
- 🤖 **AI-Powered Explanations** – Wrong answers are explained using **Ollama model**  
- 👤 **User-specific Data** – Each user sees only their own progress & insights  

---

## 🛠️ Tech Stack  

### 🎨 Frontend  
- **React.js**  
- **Recharts** (for data visualizations)  
- **Bootstrap + Custom CSS** (for styling and responsive UI)  
- **html2pdf.js** (for PDF export of analytics)  

### ⚙️ Backend  
- **Node.js + Express.js**  
- **MongoDB Atlas** (cloud database)  
- **JWT** for secure authentication  
- **CORS**, **bcryptjs**, **dotenv** for API security & environment handling  

### 🤖 AI Integration  
- **Ollama Model** – Provides natural language explanations for wrong quiz answers  

