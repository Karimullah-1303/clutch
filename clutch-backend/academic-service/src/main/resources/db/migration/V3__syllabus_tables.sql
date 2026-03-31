-- 1. Create Modules Table (Linked to your existing subjects)
CREATE TABLE academic_schema.modules (
                                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                         subject_code VARCHAR(50) NOT NULL,
                                         module_number INT NOT NULL,
                                         title VARCHAR(255) NOT NULL,
                                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                         UNIQUE(subject_code, module_number)
);

-- 2. Create Topics Table (Linked to Modules)
CREATE TABLE academic_schema.topics (
                                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                        module_id UUID NOT NULL REFERENCES academic_schema.modules(id) ON DELETE CASCADE,
                                        topic_number VARCHAR(20) NOT NULL, -- e.g., "1.1", "1.2"
                                        title VARCHAR(255) NOT NULL,
                                        description TEXT,
                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Upgrade the Lesson Plans Table
-- We drop the old free-text topic because we are now fully relational!
ALTER TABLE academic_schema.lesson_plans
DROP COLUMN topic;

-- 4. Create the Junction Table: Lesson Plan <-> Topics
-- This is where the magic happens. A teacher plans multiple topics per class.
CREATE TABLE academic_schema.lesson_plan_topics (
                                                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                                    lesson_plan_id UUID NOT NULL REFERENCES academic_schema.lesson_plans(id) ON DELETE CASCADE,
                                                    topic_id UUID NOT NULL REFERENCES academic_schema.topics(id) ON DELETE CASCADE,
                                                    coverage_status VARCHAR(20) DEFAULT 'PLANNED', -- Switches to 'COVERED' after class
                                                    UNIQUE(lesson_plan_id, topic_id)
);

-- 5. Create the Materials Engine
-- Holds URLs to Supabase Storage. Can be linked to a Topic (Department) or a Lesson Plan (Personal)
CREATE TABLE academic_schema.materials (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                           teacher_id UUID NOT NULL, -- Who uploaded it
                                           topic_id UUID REFERENCES academic_schema.topics(id) ON DELETE CASCADE,           -- For official syllabus materials
                                           lesson_plan_id UUID REFERENCES academic_schema.lesson_plans(id) ON DELETE CASCADE, -- For personal class notes
                                           title VARCHAR(255) NOT NULL,
                                           file_url TEXT NOT NULL,
                                           material_type VARCHAR(50), -- e.g., 'PDF', 'VIDEO_LINK', 'SLIDES'
                                           uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast queries when the mobile app loads
CREATE INDEX idx_topics_module ON academic_schema.topics(module_id);
CREATE INDEX idx_lpt_lesson_plan ON academic_schema.lesson_plan_topics(lesson_plan_id);
CREATE INDEX idx_materials_topic ON academic_schema.materials(topic_id);