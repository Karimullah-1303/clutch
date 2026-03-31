package com.campus.academyservice.dto;
import lombok.Data;
import java.util.List;

@Data
public class AiSyllabusPayload {
    private String subjectCode;
    private int totalEstimatedLectures;
    private List<AiModule> modules;

    @Data
    public static class AiModule {
        private Integer moduleNumber;
        private String title;
        private List<AiTopic> topics;
    }

    @Data
    public static class AiTopic {
        private Integer topicNumber;
        private String title;
        private Integer targetLectureNumber;
    }
}