package com.marrow.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponseDto implements Serializable {
    private Long id;
    private String questionText;
    private String difficulty;
    private String subject;
    private List<String> tags;
    private List<String> options;
    private Integer correctOption; // 0 for A, 1 for B, 2 for C, 3 for D
    private String explanation;
    private String topic;
}
