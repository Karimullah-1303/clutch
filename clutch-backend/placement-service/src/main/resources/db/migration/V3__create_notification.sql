-- V3: Migration to add the Notifications system for Students
CREATE TABLE notifications (
                               id UUID PRIMARY KEY,
                               student_id UUID NOT NULL,
                               title VARCHAR(255) NOT NULL,
                               message TEXT NOT NULL,
                               is_read BOOLEAN DEFAULT FALSE,
                               created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups when a student logs in
CREATE INDEX idx_notifications_student_id ON notifications(student_id);