# TalentLens — AI-Powered HR Recruitment Platform

TalentLens is a full-stack HR recruitment platform that uses machine learning 
to automatically evaluate candidate-job compatibility. It supports two user 
roles — **Candidates** and **Recruiters** — each with a dedicated dashboard 
and workflow.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.5, Spring Security |
| Frontend | React 18, Tailwind CSS v3, React Router |
| ML Service | Python, Flask, scikit-learn, NLTK |
| Database | PostgreSQL |
| CV Parsing | Apache Tika |
| Migrations | Flyway |

---

## Project Structure

Talent-Lens/ ├── hr-platform/ # Spring Boot REST API (port 8080) ├── hr-platform-frontend/ # React SPA (port 3000) └── hr_platform-ml/ # Python Flask ML microservice (port 5000)
---

## Features

### For Candidates
- Register and log in as a candidate
- Browse and search active job postings
- Upload PDF/DOCX resumes (text auto-extracted)
- Apply to jobs with a selected resume
- Track application status (Pending / Reviewed / Accepted / Rejected)
- Manage profile, skills and uploaded CVs

### For Recruiters
- Register and log in as a recruiter
- Create, edit and close job postings
- View all applicants per job with AI compatibility scores
- Run AI analysis on any candidate (ML microservice)
- See matched and missing skills per candidate
- Evaluate candidates manually (interview rating, comments, final decision)

---

## AI Classification Engine

The ML microservice (`/classify`) receives the extracted CV text and the 
job requirements, then returns a compatibility score using:

1. **TF-IDF Cosine Similarity** — semantic text similarity
2. **NLTK POS Tagging** — extracts skills from job requirements
3. **Smart Skill Matching** — checks which skills appear in the CV

**Final score formula:**
score = (skill_score × 0.8) + (tfidf_similarity × 0.2)


| Score | Label | Color |
|---|---|---|
| ≥ 0.70 | HIGH MATCH | 🟢 Green |
| 0.40 – 0.69 | POTENTIAL | 🟡 Amber |
| < 0.40 | LOW MATCH | 🔴 Red |

---

## Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Python 3.10+
- PostgreSQL

### 1. Database
Create a PostgreSQL database named `hrdb`.

### 2. Backend
```bash
cd hr-platform/hr-platform
# Configure database credentials in src/main/resources/application-dev.properties
./mvnw spring-boot:run
# Runs on http://localhost:8080
