package com.marrow.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.marrow.example.entity.StudyMaterial;

public interface StudyMaterialRepository
        extends JpaRepository<StudyMaterial, Long> {

    List<StudyMaterial>
    findBySubjectName(String subjectName);

    List<StudyMaterial>
    findByChapterName(String chapterName);

    List<StudyMaterial>
    findByYear(Integer year);

    List<StudyMaterial>
    findByYearIsNullOrYear(Integer year);
}