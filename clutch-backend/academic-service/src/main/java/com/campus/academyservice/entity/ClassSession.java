package com.campus.academyservice.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Table(name = "class_sessions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"timetable_block_id", "session_date"})
})
public class ClassSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_block_id", nullable = false)
    private TimetableBlock timetableBlock;

    @Column(name = "session_date", nullable = false)
    private LocalDate sessionDate;


}