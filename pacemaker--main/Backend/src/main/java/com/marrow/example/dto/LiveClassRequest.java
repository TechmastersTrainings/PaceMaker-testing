package com.marrow.example.dto;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class LiveClassRequest {

    private String title;

    private LocalDateTime classDateTime;

    private String trainerName;

    private String topic;

    private String description;

    private Boolean autoRecord;

    private Integer retentionDays;
}