-- Fix interview_date type to match LocalDate in Java
ALTER TABLE evaluation ALTER COLUMN interview_date TYPE DATE;
