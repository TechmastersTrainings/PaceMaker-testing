package com.marrow.example.controller;

import com.marrow.example.dto.ApiResponse;
import com.marrow.example.dto.VideoAccessResponseDto;
import com.marrow.example.dto.VideoCategoryProgressDto;
import com.marrow.example.dto.VideoResponseDto;
import com.marrow.example.dto.VideoWatchResponseDto;
import com.marrow.example.service.VideoService;
import com.marrow.example.service.VideoWatchHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
public class VideoController {

    private final VideoService videoService;
    private final VideoWatchHistoryService videoWatchHistoryService;

    @GetMapping("/{videoId}/access")
    public ResponseEntity<ApiResponse<VideoAccessResponseDto>> checkVideoAccess(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.success(videoService.checkVideoAccess(videoId)));
    }

    @GetMapping("/{videoId}/resume")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumeVideo(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.success(videoWatchHistoryService.resumeVideo(videoId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VideoResponseDto>>> getAllVideos() {
        return ResponseEntity.ok(ApiResponse.success(videoService.getAllVideos()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VideoResponseDto>> getVideoById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(videoService.getVideoById(id)));
    }

    @GetMapping("/progress")
    public ResponseEntity<ApiResponse<List<VideoCategoryProgressDto>>> getCategoryProgress() {
        return ResponseEntity.ok(ApiResponse.success(videoService.getCategoryProgress()));
    }

    @PostMapping("/{videoId}/complete")
    public ResponseEntity<ApiResponse<VideoWatchResponseDto>> markComplete(@PathVariable Long videoId) {
        return ResponseEntity.ok(ApiResponse.success(videoWatchHistoryService.markComplete(videoId)));
    }

    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<VideoResponseDto>> uploadVideo(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("accessLevel") String accessLevel,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "assetId", required = false) String assetId,
            @RequestParam(value = "uploadUrl", required = false) String uploadUrl,
            @RequestParam(value = "instructor", required = false) String instructor,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        
        VideoResponseDto response = videoService.uploadVideo(title, description, category, accessLevel, tags, subject, assetId, uploadUrl, instructor, file);
        return ResponseEntity.ok(ApiResponse.success("Video uploaded successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<VideoResponseDto>> updateVideo(
            @PathVariable Long id,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "accessLevel", required = false) String accessLevel,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "subject", required = false) String subject,
            @RequestParam(value = "instructor", required = false) String instructor) {

        VideoResponseDto response = videoService.updateVideo(id, title, description, category, accessLevel, tags, subject, instructor);
        return ResponseEntity.ok(ApiResponse.success("Video updated successfully", response));
    }

    @GetMapping("/stream/{id}")
    public ResponseEntity<org.springframework.core.io.Resource> streamVideo(@PathVariable Long id) {
        byte[] data = videoService.getVideoData(id);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        org.springframework.core.io.Resource resource = new org.springframework.core.io.ByteArrayResource(data);
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType("video/mp4"))
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"video_" + id + ".mp4\"")
                .body(resource);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteVideo(@PathVariable Long id) {
        videoService.deleteVideo(id);
        return ResponseEntity.ok(ApiResponse.success("Video deleted successfully", "Success"));
    }
}