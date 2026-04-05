package com.campus.academyservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class TopicDto {
    private UUID id;
    private String topicNumber;
    private String title;
    private String description;

    private Integer targetLectureNumber;
    private String pacingStatus;
    private Integer pacingOffset;
}