# TalentLens — AI-Powered HR Recruitment Platform

TalentLens is a modern, full-stack HR recruitment platform that leverages advanced Machine Learning and Generative AI to automatically evaluate candidate-job compatibility. It supports two distinct user roles — **Candidates** and **Recruiters** — each featuring a dedicated dashboard and secure workflow.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21, Spring Boot 3.5, Spring Security, JWT, BCrypt |
| **Frontend** | React 18, Tailwind CSS v3, React Router, Axios |
| **ML Service** | Python, Flask, scikit-learn, NLTK, **Google Gemini LLM** |
| **Database** | PostgreSQL, Flyway Migrations |
| **Parsing** | PyPDF2, Apache Tika |

---

## ✨ Features

### For Candidates
- Secure registration and JWT-based authentication
- Browse and search active job postings
- Upload PDF resumes (text auto-extracted & pre-processed)
- Apply to jobs using a selected resume
- Track application status (Pending / Reviewed / Accepted / Rejected)
- Manage profile, technical skills, and document library
- **Receive personalized AI-generated constructive feedback** upon rejection

### For Recruiters
- Dedicated secure recruiter dashboard
- Create, edit, and close job postings (CRUD operations)
- View all applicants per job with intelligent compatibility scoring
- Run in-depth AI analysis on any candidate via the ML microservice
- View extracted missing/matched skills automatically
- Evaluate candidates manually (interview rating, executive commentary, final disposition)

---

## 🧠 AI Classification Engine

The ML microservice (`/classify`) acts as a Decision Support System. It receives the extracted CV text and the job requirements, processing them in two distinct phases to return a highly accurate compatibility score:

1. **Algorithmic Evaluation (TF-IDF & Cosine Similarity):** Mathematical text similarity measuring exact keyword matches.
2. **Semantic Evaluation (Google Gemini LLM):** Advanced prompt engineering to understand context, synonyms, and experience level.

**Final Hybrid Score Formula:**

	Final_Score = (TFIDF_Score × 0.4) + (Gemini_Score × 0.6)

| Score Range | Label | Color Indicator |
|---|---|---|
| **≥ 70%** | HIGH MATCH | 🟢 Green |
| **40% – 69%** | POTENTIAL | 🟡 Amber |
| **< 40%** | LOW MATCH | 🔴 Red |

---

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Python 3.10+
- PostgreSQL
- Google Gemini API Key

### 1. Database Setup
Create a PostgreSQL database named `hrdb`.

### 2. Backend (Spring Boot)
	cd hr-platform/hr-platform
	# Configure database credentials in src/main/resources/application-dev.properties
	./mvnw spring-boot:run
	# The API will run on http://localhost:8080

### 3. ML Service (Python / Flask)
	cd hr_platform-ml
	pip install -r requirements.txt
	# Export your GEMINI_API_KEY environment variable before running
	python app.py
	# The ML microservice will run on http://localhost:5000

### 4. Frontend (React)
	cd hr-platform-frontend
	npm install
	npm start
	# The web app will launch on http://localhost:3000
