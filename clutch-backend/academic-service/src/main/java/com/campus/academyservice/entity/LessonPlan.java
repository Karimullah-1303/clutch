package com.campus.academyservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lesson_plans", schema = "academic_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "teacher_id", nullable = false)
    private UUID teacherId;

    @Column(name = "subject_code", nullable = false)
    private String subjectCode;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "class_date", nullable = false)
    private LocalDate classDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;



    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "TEXT")
    private String homework;

    @Column(nullable = false)
    private String status; // e.g., "PLANNED", "COMPLETED"

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = "PLANNED";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}