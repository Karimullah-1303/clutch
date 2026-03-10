CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE section(
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    college_id UUID NOT NULL
);

CREATE TABLE subjects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          course_code VARCHAR(50) NOT NULL UNIQUE,
                          name VARCHAR(255) NOT NULL
);

CREATE TABLE student_enrollments (
                                     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                     student_id UUID NOT NULL, -- Links to Identity DB
                                     section_id UUID NOT NULL REFERENCES section(id)
);

CREATE TABLE timetable_blocks (
                                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                  subject_id UUID NOT NULL REFERENCES subjects(id),
                                  section_id UUID NOT NULL REFERENCES section(id),
                                  teacher_id UUID NOT NULL, -- Stored in identity-service
                                  day_of_week VARCHAR(15) NOT NULL,
                                  start_time TIME NOT NULL,
                                  end_time TIME NOT NULL
);

CREATE TABLE class_sessions (
                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                timetable_block_id UUID NOT NULL REFERENCES timetable_blocks(id),
                                session_date DATE NOT NULL,
                                UNIQUE(timetable_block_id, session_date) -- Prevents duplicate classes on the same day
);


CREATE TABLE attendance_records (
                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    class_session_id UUID NOT NULL REFERENCES class_sessions(id),
                                    student_id UUID NOT NULL, -- Stored in identity-service
                                    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT
                                    UNIQUE(class_session_id, student_id) -- A student can only have one status per session
);