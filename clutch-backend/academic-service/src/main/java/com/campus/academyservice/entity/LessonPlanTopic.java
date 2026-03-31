package com.campus.academyservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "lesson_plan_topics", schema = "academic_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonPlanTopic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "lesson_plan_id", nullable = false)
    private UUID lessonPlanId;

    @Column(name = "topic_id", nullable = false)
    private UUID topicId;

    @Column(name = "coverage_status")
    private String coverageStatus; // "PLANNED" or "COVERED"

    @PrePersist
    protected void onCreate() {
        if (this.coverageStatus == null) {
            this.coverageStatus = "PLANNED";
        }
    }
}