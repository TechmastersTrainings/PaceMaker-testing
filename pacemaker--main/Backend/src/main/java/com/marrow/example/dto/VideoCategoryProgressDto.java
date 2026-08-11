package com.marrow.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoCategoryProgressDto {
    private String category;
    private int totalVideos;
    private int completedVideos;
    private int progressPercentage;
}
