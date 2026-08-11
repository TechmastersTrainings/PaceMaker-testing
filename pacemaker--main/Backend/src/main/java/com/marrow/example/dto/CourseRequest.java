package com.marrow.example.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class CourseRequest {

    private String courseName;

    private String description;

    private String thumbnailUrl;

    private String subject;

    private String level;

    private Integer lectureCount;
}