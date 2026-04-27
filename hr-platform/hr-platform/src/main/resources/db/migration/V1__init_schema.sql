-- ============================================================
-- DEPARTMENT
-- ============================================================
CREATE TABLE department (
                            id      BIGSERIAL PRIMARY KEY,
                            name    VARCHAR(100) NOT NULL,
                            location VARCHAR(200)
);

-- ============================================================
-- USERS (authentication - Spring Security)
-- ============================================================
CREATE TABLE users (
                       id          BIGSERIAL PRIMARY KEY,
                       email       VARCHAR(150) NOT NULL UNIQUE,
                       password    VARCHAR(255) NOT NULL,
                       role        VARCHAR(20)  NOT NULL,   -- RECRUITER, CANDIDATE
                       created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- RECRUITER
-- ============================================================
CREATE TABLE recruiter (
                           id              BIGSERIAL PRIMARY KEY,
                           full_name       VARCHAR(100) NOT NULL,
                           job_title       VARCHAR(100),
                           user_id         BIGINT NOT NULL UNIQUE,
                           department_id   BIGINT,
                           CONSTRAINT fk_recruiter_user       FOREIGN KEY (user_id)
                               REFERENCES users(id),
                           CONSTRAINT fk_recruiter_department FOREIGN KEY (department_id)
                               REFERENCES department(id)
);

-- ============================================================
-- CANDIDATE
-- ============================================================
CREATE TABLE candidate (
                           id          BIGSERIAL PRIMARY KEY,
                           full_name   VARCHAR(100) NOT NULL,
                           phone       VARCHAR(20),
                           user_id     BIGINT NOT NULL UNIQUE,
                           CONSTRAINT fk_candidate_user FOREIGN KEY (user_id)
                               REFERENCES users(id)
);

-- ============================================================
-- SKILLS (dictionary)
-- ============================================================
CREATE TABLE skill (
                       id      BIGSERIAL PRIMARY KEY,
                       name    VARCHAR(100) NOT NULL UNIQUE   -- e.g. "Java", "Spring Boot", "Python"
);

-- ============================================================
-- CANDIDATE SKILLS (candidate <-> skill)
-- ============================================================
CREATE TABLE candidate_skill (
                                 candidate_id    BIGINT NOT NULL,
                                 skill_id        BIGINT NOT NULL,
                                 PRIMARY KEY (candidate_id, skill_id),
                                 CONSTRAINT fk_cs_candidate FOREIGN KEY (candidate_id)
                                     REFERENCES candidate(id),
                                 CONSTRAINT fk_cs_skill     FOREIGN KEY (skill_id)
                                     REFERENCES skill(id)
);

-- ============================================================
-- RESUME / CV
-- ============================================================
CREATE TABLE resume (
                        id              BIGSERIAL PRIMARY KEY,
                        file_path       VARCHAR(500) NOT NULL,
                        extracted_text  TEXT,
                        file_format     VARCHAR(10),            -- PDF, DOCX
                        uploaded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        candidate_id    BIGINT NOT NULL,
                        CONSTRAINT fk_resume_candidate FOREIGN KEY (candidate_id)
                            REFERENCES candidate(id)
);

-- ============================================================
-- JOB POSTING
-- ============================================================
CREATE TABLE job_posting (
                             id              BIGSERIAL PRIMARY KEY,
                             title           VARCHAR(150) NOT NULL,
                             description     TEXT,
                             requirements    TEXT,
                             status          VARCHAR(20) DEFAULT 'ACTIVE',   -- DRAFT, ACTIVE, CLOSED
                             published_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             expires_at      TIMESTAMP,
                             recruiter_id    BIGINT,
                             CONSTRAINT fk_job_recruiter FOREIGN KEY (recruiter_id)
                                 REFERENCES recruiter(id)
);

-- ============================================================
-- JOB SKILLS (job_posting <-> skill)
-- ============================================================
CREATE TABLE job_skill (
                           job_id      BIGINT NOT NULL,
                           skill_id    BIGINT NOT NULL,
                           PRIMARY KEY (job_id, skill_id),
                           CONSTRAINT fk_js_job   FOREIGN KEY (job_id)
                               REFERENCES job_posting(id),
                           CONSTRAINT fk_js_skill FOREIGN KEY (skill_id)
                               REFERENCES skill(id)
);

-- ============================================================
-- APPLICATION (candidate applies to a job)
-- ============================================================
CREATE TABLE application (
                             id              BIGSERIAL PRIMARY KEY,
                             status          VARCHAR(30) DEFAULT 'PENDING',  -- PENDING, UNDER_REVIEW, REJECTED, ACCEPTED
                             applied_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                             candidate_id    BIGINT NOT NULL,
                             job_id          BIGINT NOT NULL,
                             CONSTRAINT fk_app_candidate FOREIGN KEY (candidate_id)
                                 REFERENCES candidate(id),
                             CONSTRAINT fk_app_job       FOREIGN KEY (job_id)
                                 REFERENCES job_posting(id)
);

-- ============================================================
-- CLASSIFICATION MODEL (Python ML model metadata)
-- ============================================================
CREATE TABLE classification_model (
                                      id              BIGSERIAL PRIMARY KEY,
                                      algorithm_name  VARCHAR(100) NOT NULL,
                                      version         VARCHAR(20),
                                      trained_at      TIMESTAMP,
                                      accuracy        FLOAT
);

-- ============================================================
-- CLASSIFICATION RESULTS (ML score for an application)
-- ============================================================
CREATE TABLE classification_result (
                                       id                  BIGSERIAL PRIMARY KEY,
                                       score               FLOAT NOT NULL,         -- e.g. 0.85 = 85% match
                                       matched_skills      TEXT,
                                       missing_skills      TEXT,
                                       classified_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                       application_id      BIGINT NOT NULL,
                                       model_id            BIGINT,
                                       CONSTRAINT fk_cr_application FOREIGN KEY (application_id)
                                           REFERENCES application(id),
                                       CONSTRAINT fk_cr_model       FOREIGN KEY (model_id)
                                           REFERENCES classification_model(id)
);

-- ============================================================
-- EVALUATION (interview + HR decision)
-- ============================================================
CREATE TABLE evaluation (
                            id                  BIGSERIAL PRIMARY KEY,
                            interview_date      TIMESTAMP,
                            interview_rating    INT,                    -- scale 1-10
                            comments            TEXT,
                            final_decision      VARCHAR(30),            -- ACCEPTED, REJECTED, PENDING
                            created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            application_id      BIGINT NOT NULL,
                            recruiter_id        BIGINT,
                            CONSTRAINT fk_eval_application FOREIGN KEY (application_id)
                                REFERENCES application(id),
                            CONSTRAINT fk_eval_recruiter   FOREIGN KEY (recruiter_id)
                                REFERENCES recruiter(id)
);

-- ============================================================
-- NOTIFICATION
-- ============================================================
CREATE TABLE notification (
                              id              BIGSERIAL PRIMARY KEY,
                              subject         VARCHAR(200),
                              message         TEXT,
                              is_read         BOOLEAN DEFAULT FALSE,
                              sent_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                              recipient_type  VARCHAR(20) NOT NULL,       -- CANDIDATE or RECRUITER
                              recipient_id    BIGINT NOT NULL
);
