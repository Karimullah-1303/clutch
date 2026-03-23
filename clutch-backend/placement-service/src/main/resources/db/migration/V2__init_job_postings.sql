CREATE TABLE job_postings (
                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                              company_name VARCHAR(255) NOT NULL,
                              job_role VARCHAR(255) NOT NULL,
                              description TEXT,
                              ctc NUMERIC(10,2) NOT NULL, -- e.g., 7.50 for 7.5 LPA
                              min_cgpa NUMERIC(4,2) NOT NULL DEFAULT 0.00,
                              application_deadline TIMESTAMP NOT NULL,
                              is_active BOOLEAN NOT NULL DEFAULT TRUE,
                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_applications (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  job_posting_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
                                  student_id UUID NOT NULL REFERENCES student_profiles(student_id) ON DELETE CASCADE,
                                  status VARCHAR(50) NOT NULL DEFAULT 'APPLIED',
                                  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- THE GUARDRAIL: A student can only apply to a specific job ONE time!
                                  UNIQUE(job_posting_id, student_id)
);