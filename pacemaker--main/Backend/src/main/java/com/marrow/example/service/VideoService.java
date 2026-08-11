package com.marrow.example.service;

import com.marrow.example.dto.VideoAccessResponseDto;
import com.marrow.example.dto.VideoCategoryProgressDto;
import com.marrow.example.entity.User;
import com.marrow.example.entity.UserSubscription;
import com.marrow.example.entity.Video;
import com.marrow.example.enums.AccessLevel;
import com.marrow.example.enums.SubscriptionStatus;
import com.marrow.example.enums.VideoCategory;
import com.marrow.example.exception.ResourceNotFoundException;
import com.marrow.example.repository.UserRepository;
import com.marrow.example.repository.UserSubscriptionRepository;
import com.marrow.example.repository.VideoRepository;
import com.marrow.example.repository.VideoWatchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final UserRepository userRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final VideoWatchHistoryRepository videoWatchHistoryRepository;

    public java.util.List<VideoCategoryProgressDto> getCategoryProgress() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElse(null);
        Long userId = user != null ? user.getId() : -1L;

        java.util.List<VideoCategoryProgressDto> result = new java.util.ArrayList<>();
        for (VideoCategory category : VideoCategory.values()) {
            long total = videoRepository.countByCategory(category);
            long completed = userId > 0 ? videoWatchHistoryRepository.countCompletedByUserAndCategory(userId, category) : 0;
            int progress = total > 0 ? (int) (completed * 100 / total) : 0;
            result.add(VideoCategoryProgressDto.builder()
                    .category(category.name())
                    .totalVideos((int) total)
                    .completedVideos((int) completed)
                    .progressPercentage(progress)
                    .build());
        }
        return result;
    }

    public VideoAccessResponseDto checkVideoAccess(Long videoId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found"));

        UserSubscription subscription = userSubscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(null);

        boolean allowed = false;
        String planName = "NONE";

        if (video.getAccessLevel() == AccessLevel.FREE) {
            allowed = true;
        } else if (subscription != null && subscription.getSubscriptionStatus() == SubscriptionStatus.ACTIVE) {
            planName = subscription.getSubscriptionPlan().getPlanType().name();
            allowed = true; // Active subscription of any plan unlocks all video access
        }

        return VideoAccessResponseDto.builder()
                .videoId(video.getId())
                .allowed(allowed)
                .subscription(planName)
                .build();
    }

    @org.springframework.cache.annotation.Cacheable(value = "videos", key = "'video:list'")
    public java.util.List<com.marrow.example.dto.VideoResponseDto> getAllVideos() {
        return videoRepository.findAll().stream().map(this::mapToDto).collect(java.util.stream.Collectors.toList());
    }

    @org.springframework.cache.annotation.Cacheable(value = "videos", key = "'video:details:' + #id")
    public com.marrow.example.dto.VideoResponseDto getVideoById(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));
        return mapToDto(video);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "videos", allEntries = true)
    public com.marrow.example.dto.VideoResponseDto uploadVideo(
            String title,
            String description,
            String category,
            String accessLevel,
            String tags,
            String subject,
            String assetId,
            String uploadUrl,
            String instructor,
            org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {

        Video video = Video.builder()
                .title(title)
                .description(description)
                .videoUrl("pending")
                .thumbnailUrl("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300")
                .duration(300)
                .accessLevel(com.marrow.example.enums.AccessLevel.valueOf(accessLevel.toUpperCase()))
                .category(com.marrow.example.enums.VideoCategory.valueOf(category.toUpperCase()))
                .tags(tags != null ? tags : "")
                .subject(subject)
                .assetId(assetId)
                .uploadUrl(uploadUrl)
                .instructor(instructor)
                .videoData(file.getBytes())
                .createdAt(java.time.LocalDateTime.now())
                .build();

        Video saved = videoRepository.save(video);
        saved.setVideoUrl("/api/v1/videos/stream/" + saved.getId());
        videoRepository.save(saved);
        return mapToDto(saved);
    }

    @org.springframework.cache.annotation.CacheEvict(value = "videos", allEntries = true)
    public com.marrow.example.dto.VideoResponseDto updateVideo(Long id, String title, String description, String category, String accessLevel, String tags, String subject, String instructor) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));

        if (title != null && !title.isBlank()) video.setTitle(title);
        if (description != null) video.setDescription(description);
        if (category != null && !category.isBlank()) video.setCategory(com.marrow.example.enums.VideoCategory.valueOf(category.toUpperCase()));
        if (accessLevel != null && !accessLevel.isBlank()) video.setAccessLevel(com.marrow.example.enums.AccessLevel.valueOf(accessLevel.toUpperCase()));
        if (tags != null) video.setTags(tags);
        if (subject != null) video.setSubject(subject);
        if (instructor != null) video.setInstructor(instructor);

        Video saved = videoRepository.save(video);
        return mapToDto(saved);
    }

    public byte[] getVideoData(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));
        return video.getVideoData();
    }

    @org.springframework.cache.annotation.CacheEvict(value = "videos", allEntries = true)
    public void deleteVideo(Long id) {
        Video video = videoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Video not found with id: " + id));

        videoRepository.delete(video);
    }

    private com.marrow.example.dto.VideoResponseDto mapToDto(Video video) {
        return com.marrow.example.dto.VideoResponseDto.builder()
                .id(video.getId())
                .title(video.getTitle())
                .description(video.getDescription())
                .videoUrl(video.getVideoUrl())
                .thumbnailUrl(video.getThumbnailUrl())
                .duration(video.getDuration())
                .accessLevel(video.getAccessLevel() != null ? video.getAccessLevel().name() : "FREE")
                .category(video.getCategory() != null ? video.getCategory().name() : "GENERAL")
                .tags(video.getTags())
                .subject(video.getSubject())
                .assetId(video.getAssetId())
                .uploadUrl(video.getUploadUrl())
                .instructor(video.getInstructor())
                .createdAt(video.getCreatedAt())
                .updatedAt(video.getUpdatedAt())
                .build();
    }
}