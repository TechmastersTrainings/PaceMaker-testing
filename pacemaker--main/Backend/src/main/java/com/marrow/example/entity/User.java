package com.marrow.example.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_role", columnList = "role")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder


public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String role;

    // ACTIVE / DISABLED

    private Boolean enabled;

    private String status;
    private String specialization;
    private String subSpecialization;
    private String qualification;
    private String college;
    private String graduationYear;
    private Integer currentYear;
    private String experience;
    private String designation;
    private String hospital;
    private String teachingExperience;
    private String dob;
    private String gender;
    private String nationality;
    private String phone;
    private String altPhone;
    private String address;
    private String medicalCertName;
    private String aadharCardName;
    private String cvName;
    private String academicLevelId;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<UserSubscription> subscriptions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<VideoWatchHistory> videoWatchHistories;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<StudentPerformance> studentPerformances;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<UserActivity> userActivities;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<QuestionAttempt> questionAttempts;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<NotificationHistory> notificationHistories;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<SearchHistory> searchHistories;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<Invoice> invoices;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.List<UserBadge> userBadges;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private UserStreak userStreak;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private UserPoints userPoints;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.List<UserSession> userSessions;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.List<SSOAuditLog> ssoAuditLogs;

    @OneToMany(mappedBy = "requestedBy", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private java.util.List<ExportHistory> exportHistories;

    @PrePersist
    public void prePersist() {

        createdAt = LocalDateTime.now();

        if (enabled == null) {

            enabled = true;
        }

        if (status == null) {
            status = "INSTRUCTOR".equalsIgnoreCase(role) ? "pending" : "approved";
        }
    }
}