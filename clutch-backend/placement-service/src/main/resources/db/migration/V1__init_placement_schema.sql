CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE student_profiles (
                                  student_id UUID PRIMARY KEY, -- This will hold the exact UUID from the Identity Service
                                  roll_number VARCHAR(100) UNIQUE NOT NULL,

    -- Official University Data
                                  cgpa NUMERIC(4,2),
                                  is_cgpa_verified BOOLEAN NOT NULL DEFAULT FALSE,

    -- Student Portfolio Links
                                  github_url VARCHAR(255),
                                  leetcode_url VARCHAR(255),
                                  portfolio_url VARCHAR(255),
                                  resume_pdf_url VARCHAR(255)
);

-- A separate table to handle the list of strings for student skills
CREATE TABLE student_skills (
                                student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
                                skill VARCHAR(100) NOT NULL
);