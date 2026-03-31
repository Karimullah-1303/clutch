package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ModuleDto {
    private UUID id;
    private Integer moduleNumber;
    private String title;
    private List<TopicDto> topics; // The React accordion will map over this list!
}