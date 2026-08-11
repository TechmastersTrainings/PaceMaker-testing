package com.marrow.example.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "patient_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String difficulty; // "Medium" or "Advanced"

    @Column(name = "system_subject", nullable = false)
    private String systemSubject; // "chest_pain", "abdominal_pain", etc.
}
