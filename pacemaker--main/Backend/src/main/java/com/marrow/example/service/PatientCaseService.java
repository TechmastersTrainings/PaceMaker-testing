package com.marrow.example.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.marrow.example.entity.PatientCase;
import com.marrow.example.repository.PatientCaseRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatientCaseService {

    private final PatientCaseRepository patientCaseRepository;

    public List<PatientCase> getAllCases() {
        return patientCaseRepository.findAll();
    }

    public PatientCase getCaseById(Long id) {
        return patientCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient case not found with id: " + id));
    }

    @Transactional
    public PatientCase createCase(PatientCase patientCase) {
        return patientCaseRepository.save(patientCase);
    }

    @Transactional
    public PatientCase updateCase(Long id, PatientCase updated) {
        PatientCase existing = getCaseById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setDifficulty(updated.getDifficulty());
        existing.setSystemSubject(updated.getSystemSubject());
        return patientCaseRepository.save(existing);
    }

    @Transactional
    public void deleteCase(Long id) {
        PatientCase existing = getCaseById(id);
        patientCaseRepository.delete(existing);
    }
}
