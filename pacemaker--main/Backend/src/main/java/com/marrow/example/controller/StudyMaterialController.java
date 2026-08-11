package com.marrow.example.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.marrow.example.dto.ApiResponse;
import com.marrow.example.dto.StudyMaterialResponse;
import com.marrow.example.entity.StudyMaterial;
import com.marrow.example.entity.User;
import com.marrow.example.repository.UserRepository;
import com.marrow.example.service.StudyMaterialService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/study-materials")
@RequiredArgsConstructor
public class StudyMaterialController {

    private final StudyMaterialService studyMaterialService;
    private final UserRepository userRepository;

    // UPLOAD PDF
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<StudyMaterialResponse>> uploadFile(
            @RequestParam String subjectName,
            @RequestParam String chapterName,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam("file") MultipartFile file) throws IOException {

        StudyMaterialResponse response = studyMaterialService.uploadFile(subjectName, chapterName, file, year);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", response));
    }

    // DOWNLOAD PDF
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) throws IOException {
        Resource resource = studyMaterialService.downloadFile(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // GET ALL MATERIALS (filtered by student's year if applicable)
    @GetMapping
    public ResponseEntity<ApiResponse<List<StudyMaterial>>> getAllMaterials(Authentication authentication) {
        Integer year = null;
        if (authentication != null) {
            String email = authentication.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null && "STUDENT".equalsIgnoreCase(user.getRole()) && user.getCurrentYear() != null) {
                year = user.getCurrentYear();
            }
        }
        List<StudyMaterial> materials = studyMaterialService.getAllMaterials(year);
        return ResponseEntity.ok(ApiResponse.success(materials));
    }

    // UPDATE MATERIAL
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<StudyMaterial>> updateMaterial(
            @PathVariable Long id,
            @RequestParam("subjectName") String subjectName,
            @RequestParam("chapterName") String chapterName,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "file", required = false) MultipartFile file) throws IOException {

        StudyMaterial updated = studyMaterialService.updateMaterial(id, subjectName, chapterName, status, file, year);
        return ResponseEntity.ok(ApiResponse.success("Study material updated successfully", updated));
    }

    // DELETE MATERIAL
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteMaterial(@PathVariable Long id) throws IOException {
        studyMaterialService.deleteMaterial(id);
        return ResponseEntity.ok(ApiResponse.success("File deleted successfully", "Deleted"));
    }
}