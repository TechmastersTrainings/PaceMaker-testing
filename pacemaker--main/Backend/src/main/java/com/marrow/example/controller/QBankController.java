package com.marrow.example.controller;

import com.marrow.example.dto.ApiResponse;
import com.marrow.example.dto.PaginationResponseDto;
import com.marrow.example.dto.QuestionResponseDto;
import com.marrow.example.dto.QuestionRequestDto;
import com.marrow.example.service.QBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/qbank")
@RequiredArgsConstructor
public class QBankController {

    private final QBankService qbankService;

    @GetMapping("/questions")
    public ResponseEntity<ApiResponse<PaginationResponseDto<QuestionResponseDto>>> getQuestions(
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String difficulty,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(ApiResponse.success(qbankService.getQuestions(subject, tag, difficulty, pageable)));
    }

    @GetMapping("/questions/subject/{subjectName}")
    public ResponseEntity<ApiResponse<PaginationResponseDto<QuestionResponseDto>>> getQuestionsBySubject(
            @PathVariable String subjectName,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(ApiResponse.success(qbankService.getQuestionsBySubject(subjectName, pageable)));
    }

    @GetMapping("/questions/difficulty/{difficulty}")
    public ResponseEntity<ApiResponse<PaginationResponseDto<QuestionResponseDto>>> getQuestionsByDifficulty(
            @PathVariable String difficulty,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(ApiResponse.success(qbankService.getQuestionsByDifficulty(difficulty, pageable)));
    }

    @GetMapping("/questions/tag/{tagName}")
    public ResponseEntity<ApiResponse<PaginationResponseDto<QuestionResponseDto>>> getQuestionsByTag(
            @PathVariable String tagName,
            @PageableDefault(size = 10) Pageable pageable) {
        
        return ResponseEntity.ok(ApiResponse.success(qbankService.getQuestionsByTag(tagName, pageable)));
    }

    @PostMapping("/questions")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<QuestionResponseDto>> createQuestion(@RequestBody QuestionRequestDto dto) {
        QuestionResponseDto created = qbankService.createQuestion(dto);
        return ResponseEntity.ok(ApiResponse.success("Question created successfully", created));
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<QuestionResponseDto>> updateQuestion(@PathVariable Long id, @RequestBody QuestionRequestDto dto) {
        QuestionResponseDto updated = qbankService.updateQuestion(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Question updated successfully", updated));
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteQuestion(@PathVariable Long id) {
        qbankService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Question deleted successfully", "Success"));
    }
}