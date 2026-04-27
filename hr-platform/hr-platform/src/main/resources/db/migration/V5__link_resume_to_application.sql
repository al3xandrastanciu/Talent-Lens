ALTER TABLE application ADD COLUMN resume_id BIGINT;
ALTER TABLE application ADD CONSTRAINT fk_application_resume FOREIGN KEY (resume_id) REFERENCES resume(id);
