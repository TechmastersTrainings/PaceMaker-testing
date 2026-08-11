package com.marrow.example.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.marrow.example.dto.ApiResponse;
import com.marrow.example.dto.ExamRequest;
import com.marrow.example.entity.Exam;
import com.marrow.example.service.ExamService;

@RestController
@RequestMapping("/api/v1/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Exam>> createExam(@RequestBody ExamRequest request) {
        Exam exam = examService.createExam(request);
        return ResponseEntity.ok(ApiResponse.success("Exam created successfully", exam));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<Exam>> updateExam(@PathVariable Long id, @RequestBody ExamRequest request) {
        Exam exam = examService.updateExam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Exam updated successfully", exam));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Exam deleted successfully", "Success"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Exam>>> getAllExams() {
        return ResponseEntity.ok(ApiResponse.success(examService.getAllExams()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Exam>> getExamById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(examService.getExamById(id)));
    }
}