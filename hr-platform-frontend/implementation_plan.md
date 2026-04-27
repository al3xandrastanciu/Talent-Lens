# HR Platform - Final Phase Implementation Plan

## [NEW] Python ML Microservice
Summary: A lightweight Python web service that calculates the match score between a candidate's CV and job requirements using NLP techniques.

### Component Design
- **Framework:** FastAPI or Flask
- **Algorithm:** TF-IDF Vectorization + Cosine Similarity
- **NLP Library:** `scikit-learn`, `nltk` (for tokenization and stop-word removal)

#### API Specification
`POST /classify`
- **Request Body:** `{ "cv_text": "...", "job_requirements": "..." }`
- **Response Body:** `{ "score": 0.85, "matchedSkills": "Java, Spring, SQL", "missing_skills": "Docker, Kubernetes" }`

### Implementation Steps
1. **Model Setup:** Implement a basic similarity engine using TF-IDF.
2. **Skill Extraction:** Use simple keyword mapping to identify matching skills.
3. **API Endpoint:** Wrap the logic in a Flask/FastAPI app.
4. **Integration:** Update Spring Boot's `ml.service.url` in `application-dev.yml`.

## Verification Plan
### Automated Tests
- Integration test for [ClassificationService](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/service/ClassificationService.java#18-76) calling the Python mock/real service.
- Python unit tests for the similarity logic.

---

Based on your requirements, here is the suggested order of implementation to ensure a stable and logical progression.

## 1. CV Per Application (Structural Change)
**Goal**: Allow candidates to upload a specific CV for each job they apply to, rather than having one global CV per profile.

### Proposed Changes
- **Backend**:
    - [MODIFY] [Application](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/model/entity/Application.java#13-55) entity: Add a `resume_id` field (ManyToOne to [Resume](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/model/entity/Resume.java#11-33)).
    - [NEW] [V5__link_resume_to_application.sql](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/resources/db/migration/V5__link_resume_to_application.sql): Migration to add the column.
    - [MODIFY] [ApplicationService](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/service/ApplicationService.java#18-85): Update `applyToJob` to accept a `MultipartFile` or a `resumeId`.
- **Frontend**:
    - [MODIFY] [JobDetail.js](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform-frontend/src/pages/candidate/JobDetail.js): Update the "Apply" modal to include a file upload input.

## 2. Recruiter View: Candidate Profile & CV
**Goal**: Enable recruiters to see the full details of a candidate, including their specific CV for that application.

### Proposed Changes
- **Backend**:
    - Ensure `ApplicationDTO` includes full candidate details and the linked resume URL/text.
- **Frontend**:
    - [NEW] `CandidateProfileModal.js`: A modal or page to display candidate info, skills, and the CV text.
    - [MODIFY] [JobApplications.js](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform-frontend/src/pages/recruiter/JobApplications.js): Add a "View Profile" button for each applicant.

## 3. Job Filtering by Department
**Goal**: Help candidates find relevant jobs by filtering by department/domain.

### Proposed Changes
- **Backend**:
    - Already has the `domain` field in [JobPosting](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/model/entity/JobPosting.java#12-53).
    - [MODIFY] [JobPostingRepository](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/repository/JobPostingRepository.java#10-18): Add a method [findByDomain](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/repository/JobPostingRepository.java#14-15).
- **Frontend**:
    - [MODIFY] [JobBoard.js](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform-frontend/src/pages/candidate/JobBoard.js): Add a filter sidebar or dropdown to select departments (IT, Marketing, Finance, etc.).

## 4. Python Microservice Integration
**Goal**: Display the AI Match Score calculated by the Python ML service.

### Proposed Changes
- **Backend**:
    - [MODIFY] [ClassificationService](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform/hr-platform/src/main/java/com/alexandra/hr_platform/service/ClassificationService.java#18-76): Trigger the call to the Python service when an application is submitted or viewed.
- **Frontend**:
    - [MODIFY] [JobApplications.js](file:///c:/Users/Alexandra/Desktop/LICENTA-app/hr-platform-frontend/src/pages/recruiter/JobApplications.js): Display the score percentage with a colored progress bar (as seen in the Stitch prototype).

## 5. Notification System (Email)
**Goal**: Automated emails for key events.

### Proposed Changes
- **Backend**:
    - [NEW] `EmailService`: Logic to send emails via SMTP.
    - [MODIFY] Services to trigger emails for:
        - "Application Received" (immediately after applying).
        - "Status Update" (when a recruiter accepts or rejects).

---

## User Review Required
> [!IMPORTANT]
> The change to "CV per application" is a major structural update. It means candidates will choose/upload a CV *at the moment of applying*, which is more flexible than the current "one CV per profile" model. Does this align with your vision?

> [!NOTE]
> For the Email notifications, you will eventually need to provide SMTP credentials (like a Gmail App Password) for it to actually send real emails.
