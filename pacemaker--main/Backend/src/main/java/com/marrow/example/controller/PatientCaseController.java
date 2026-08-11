package com.marrow.example.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.marrow.example.dto.ApiResponse;
import com.marrow.example.entity.PatientCase;
import com.marrow.example.service.PatientCaseService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/patient-cases")
@RequiredArgsConstructor
public class PatientCaseController {

    private final PatientCaseService patientCaseService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PatientCase>>> getAllCases() {
        return ResponseEntity.ok(ApiResponse.success(patientCaseService.getAllCases()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PatientCase>> getCaseById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(patientCaseService.getCaseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<PatientCase>> createCase(@RequestBody PatientCase patientCase) {
        PatientCase created = patientCaseService.createCase(patientCase);
        return ResponseEntity.ok(ApiResponse.success("Patient case created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<PatientCase>> updateCase(@PathVariable Long id, @RequestBody PatientCase patientCase) {
        PatientCase updated = patientCaseService.updateCase(id, patientCase);
        return ResponseEntity.ok(ApiResponse.success("Patient case updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TRAINER') or hasRole('INSTRUCTOR')")
    public ResponseEntity<ApiResponse<String>> deleteCase(@PathVariable Long id) {
        patientCaseService.deleteCase(id);
        return ResponseEntity.ok(ApiResponse.success("Patient case deleted successfully", "Success"));
    }
}
