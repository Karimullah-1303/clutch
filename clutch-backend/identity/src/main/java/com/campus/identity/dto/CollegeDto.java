package com.campus.identity.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CollegeDto {

    @NotBlank(message = "College name is required")
    private String name;

    @NotBlank(message = "Domain name is required (e.g., andhrauniversity.edu.in)")
    private String domain;
}