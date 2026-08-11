package com.marrow.example.dto;

import lombok.Data;
import java.util.Map;

@Data
public class QuestionRequestDto {
    private String subject;
    private String topic;
    private String difficulty;
    private String questionText;
    private Map<String, String> options; // keys "a", "b", "c", "d"
    private String correctOption; // "a", "b", "c", "d"
    private String explanation;
}
