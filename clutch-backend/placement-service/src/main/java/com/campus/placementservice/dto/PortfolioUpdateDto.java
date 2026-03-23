package com.campus.placementservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class PortfolioUpdateDto {
    private String githubUrl;
    private String leetcodeUrl;
    private String portfolioUrl;
    private String resumePdfUrl;
    private List<String> skills;
}