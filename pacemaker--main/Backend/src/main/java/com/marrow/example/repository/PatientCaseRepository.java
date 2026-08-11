package com.marrow.example.repository;

import com.marrow.example.entity.PatientCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatientCaseRepository extends JpaRepository<PatientCase, Long> {
}
