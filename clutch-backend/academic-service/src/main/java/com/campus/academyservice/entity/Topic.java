package com.campus.academyservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "topics", schema = "academic_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Topic {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "module_id", nullable = false)
    private UUID moduleId;

    @Column(name = "topic_number", nullable = false)
    private String topicNumber;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_lecture_number")
    private Integer targetLectureNumber;
}