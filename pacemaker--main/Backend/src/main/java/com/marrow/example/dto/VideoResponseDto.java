package com.marrow.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoResponseDto implements Serializable {
    private Long id;
    private String title;
    private String description;
    private String videoUrl;
    private String thumbnailUrl;
    private Integer duration;
    private String accessLevel;
    private String category;
    private String tags;
    private String subject;
    private String assetId;
    private String uploadUrl;
    private String instructor;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
}
