package com.marrow.example.seeder;

import com.marrow.example.entity.Course;
import com.marrow.example.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Seeds the 4 professional medical courses on first startup.
 * Safe to run on every start — skips if courses already exist.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class CourseSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;

    @Override
    public void run(String... args) {
        if (courseRepository.count() > 0) {
            log.info("Courses already exist in DB — skipping course seeding.");
            return;
        }
        log.info("Seeding 4 professional medical courses...");

        courseRepository.save(Course.builder()
                .courseName("Anatomy Masterclass")
                .description("A comprehensive high-yield anatomy course covering all clinically significant structures tested in NEET PG and INICET. Includes detailed dissections, radiological anatomy, and surface markings.")
                .subject("Anatomy")
                .level("High-yield")
                .thumbnailUrl("/anatomy_course.png")
                .build());

        courseRepository.save(Course.builder()
                .courseName("Clinical Physiology")
                .description("Master the core physiological concepts with clinical correlations. From membrane potentials to cardiovascular hemodynamics — taught with real case scenarios to strengthen your clinical reasoning.")
                .subject("Physiology")
                .level("Core Concepts")
                .thumbnailUrl("/physiology_course.png")
                .build());

        courseRepository.save(Course.builder()
                .courseName("Biochemistry Elite")
                .description("Essential biochemistry made exam-ready. Covers metabolic pathways, enzyme kinetics, molecular biology, and inherited metabolic disorders with mnemonics and high-yield tables.")
                .subject("Biochemistry")
                .level("Essentials")
                .thumbnailUrl("/biochemistry_course.png")
                .build());

        courseRepository.save(Course.builder()
                .courseName("Advanced Pathology")
                .description("Deep-dive into clinical pathology with case-based modules. Covers general pathology, systemic pathology, histopathology slides interpretation, and high-frequency exam topics in detail.")
                .subject("Pathology")
                .level("Clinical Cases")
                .thumbnailUrl("/pathology_course.png")
                .build());

        log.info("✅ Seeded 4 medical courses: Anatomy, Physiology, Biochemistry, Pathology.");
    }
}
