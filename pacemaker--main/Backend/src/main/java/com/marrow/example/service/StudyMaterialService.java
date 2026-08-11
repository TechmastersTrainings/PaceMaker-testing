package com.marrow.example.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.marrow.example.dto.StudyMaterialResponse;
import com.marrow.example.entity.StudyMaterial;
import com.marrow.example.repository.StudyMaterialRepository;
import com.marrow.example.exception.ResourceNotFoundException;

@Service
public class StudyMaterialService {

    private final StudyMaterialRepository
            studyMaterialRepository;

    private final Path uploadPath =
            Paths.get("uploads");

    public StudyMaterialService(
            StudyMaterialRepository
                    studyMaterialRepository)
            throws IOException {

        this.studyMaterialRepository =
                studyMaterialRepository;

        Files.createDirectories(uploadPath);
    }

    // UPLOAD PDF

    public StudyMaterialResponse uploadFile(
            String subjectName,
            String chapterName,
            MultipartFile file,
            Integer year) throws IOException {

        String fileName =
                System.currentTimeMillis()
                        + "_"
                        + file.getOriginalFilename();

        Path filePath =
                uploadPath.resolve(fileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING);

        StudyMaterial material =
                StudyMaterial.builder()
                        .subjectName(subjectName)
                        .chapterName(chapterName)
                        .fileName(fileName)
                        .fileType(
                                file.getContentType())
                        .filePath(
                                filePath.toString())
                        .fileSize(file.getSize())
                        .year(year)
                        .build();

        StudyMaterial saved =
                studyMaterialRepository
                        .save(material);

        return StudyMaterialResponse
                .builder()
                .id(saved.getId())
                .subjectName(
                        saved.getSubjectName())
                .chapterName(
                        saved.getChapterName())
                .fileName(
                        saved.getFileName())
                .year(saved.getYear())
                .downloadUrl(
                        "/api/study-materials/download/"
                                + saved.getId())
                .build();
    }

    // DOWNLOAD FILE

    public Resource downloadFile(Long id)
            throws IOException {

        StudyMaterial material =
                studyMaterialRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "File Not Found"));

        Path path =
                uploadPath.resolve(
                        material.getFileName());

        Resource resource =
                new UrlResource(path.toUri());

        if (!resource.exists() ||
                !resource.isReadable()) {
            throw new ResourceNotFoundException(
                    "File not found on disk: "
                            + path.toString());
        }

        return resource;
    }

    // GET ALL FILES (optionally filtered by year)

    public List<StudyMaterial>
    getAllMaterials(Integer year) {

        if (year != null) {
            return studyMaterialRepository
                    .findByYearIsNullOrYear(year);
        }
        return studyMaterialRepository
                .findAll();
    }

    public StudyMaterial updateMaterial(Long id, String subjectName, String chapterName, String status, MultipartFile file, Integer year) throws IOException {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File Not Found"));
        
        material.setSubjectName(subjectName);
        material.setChapterName(chapterName);
        if (year != null) {
            material.setYear(year);
        }
        if (status != null) {
            material.setStatus(status);
        }

        if (file != null && !file.isEmpty()) {
            try {
                Files.deleteIfExists(Paths.get(material.getFilePath()));
            } catch (Exception e) {
                // Log and ignore
            }
            
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            material.setFileName(fileName);
            material.setFileType(file.getContentType());
            material.setFilePath(filePath.toString());
            material.setFileSize(file.getSize());
        }

        return studyMaterialRepository.save(material);
    }

    public void deleteMaterial(Long id) throws IOException {
        StudyMaterial material = studyMaterialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File Not Found"));
        Path path = Paths.get(material.getFilePath());
        Files.deleteIfExists(path);
        studyMaterialRepository.deleteById(id);
    }
}