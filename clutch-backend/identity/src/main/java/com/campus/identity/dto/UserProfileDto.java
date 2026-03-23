package com.campus.identity.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class UserProfileDto {
    private UUID id;
    private String rollNumber;
    private String email;
    private String name;
    private String role;
    private String collegeName;
    private UUID collegeId;
}