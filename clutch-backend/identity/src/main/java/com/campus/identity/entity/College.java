package com.campus.identity.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity
@Table(name = "colleges")
public class College {
    @Id
    @GeneratedValue(strategy= GenerationType.UUID)
    private UUID id;
    @Column(name = "college_name", nullable = false, unique = true)
    private String name;

    @Column(name="domain_name", nullable = false, unique = true)
    private String domain;

}
