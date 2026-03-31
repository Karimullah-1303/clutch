CREATE TABLE academic_schema.section_subject_allocations (
                                                             id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                             section_name VARCHAR(50) NOT NULL,       -- e.g., 'CSE-1'
                                                             timetable_slot_code VARCHAR(50) NOT NULL,-- e.g., 'CS3204'
                                                             actual_subject_code VARCHAR(50) NOT NULL,-- e.g., 'SN' (Sensor Networks)
                                                             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                                             UNIQUE(section_name, timetable_slot_code)
);

-- Index for fast routing during login
CREATE INDEX idx_section_slot ON academic_schema.section_subject_allocations(section_name, timetable_slot_code);