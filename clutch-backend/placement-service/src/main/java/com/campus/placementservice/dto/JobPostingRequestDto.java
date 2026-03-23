package com.campus.placementservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class JobPostingRequestDto {
    private String companyName;
    private String jobRole;
    private String description;
    private BigDecimal ctc;
    private BigDecimal minCgpa;
    private LocalDateTime applicationDeadline;
}