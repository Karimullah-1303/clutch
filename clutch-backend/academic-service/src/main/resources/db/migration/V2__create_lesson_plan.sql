CREATE TABLE academic_schema.lesson_plans (
                                              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                              teacher_id UUID NOT NULL,
                                              subject_code VARCHAR(50) NOT NULL,
                                              section_name VARCHAR(50) NOT NULL,
                                              class_date DATE NOT NULL,
                                              start_time TIME NOT NULL,
                                              topic TEXT,
                                              notes TEXT,
                                              homework TEXT,
                                              status VARCHAR(20) DEFAULT 'PLANNED',
                                              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creating an index because teachers will frequently search for plans by date and their ID
CREATE INDEX idx_lesson_plan_teacher_date ON academic_schema.lesson_plans(teacher_id, class_date);