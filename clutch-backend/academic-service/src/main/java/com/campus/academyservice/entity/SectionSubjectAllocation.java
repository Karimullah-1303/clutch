package com.campus.academyservice.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "section_subject_allocations", schema = "academic_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SectionSubjectAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "section_name", nullable = false)
    private String sectionName;

    @Column(name = "timetable_slot_code", nullable = false)
    private String timetableSlotCode;

    @Column(name = "actual_subject_code", nullable = false)
    private String actualSubjectCode;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}