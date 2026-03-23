package com.campus.placementservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "student_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfile {

    // Stored in identity-service (This is a Shared Primary Key pattern)
    @Id
    @Column(name = "student_id", updatable = false, nullable = false)
    private UUID studentId;

    @Column(name = "roll_number", unique = true, nullable = false)
    private String rollNumber;

    @Column(name = "cgpa")
    private BigDecimal cgpa;

    @Column(name = "is_cgpa_verified", nullable = false)
    private Boolean isCgpaVerified = false;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "leetcode_url")
    private String leetcodeUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "resume_pdf_url")
    private String resumePdfUrl;

    // Hibernate automatically maps this List to the 'student_skills' child table
    @ElementCollection
    @CollectionTable(
            name = "student_skills",
            joinColumns = @JoinColumn(name = "student_id")
    )
    @Column(name = "skill")
    private List<String> skills;
}