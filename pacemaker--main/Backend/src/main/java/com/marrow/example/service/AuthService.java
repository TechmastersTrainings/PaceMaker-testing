package com.marrow.example.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.marrow.example.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import com.marrow.example.dto.LoginRequest;
import com.marrow.example.dto.RegisterRequest;
import com.marrow.example.dto.AuthResponse;
import com.marrow.example.dto.WelcomeEmailDto;
import com.marrow.example.entity.User;
import com.marrow.example.repository.UserRepository;
import com.marrow.example.util.JwtUtil;

import lombok.extern.slf4j.Slf4j;

/**
 * Handles user registration and authentication.
 *
 * Key fix: generateToken(email, role) is now called during login so that
 * the JWT carries the user's role as a claim — required by
 * JwtAuthenticationFilter to build GrantedAuthority without a DB round-trip.
 */
@Service
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            NotificationService notificationService) {

        this.userRepository       = userRepository;
        this.passwordEncoder      = passwordEncoder;
        this.jwtUtil              = jwtUtil;
        this.notificationService  = notificationService;
    }

    // ── Register ─────────────────────────────────────────────────────────────

    public String register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already registered.");
        }

        String role = request.getRole() != null
                ? request.getRole().toUpperCase()
                : "STUDENT";

        // Instructors require admin approval before they can log in
        boolean enabled = !role.equals("INSTRUCTOR");

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .currentYear(request.getCurrentYear())
                .enabled(enabled)
                .status(role.equals("INSTRUCTOR") ? "pending" : "approved")
                .specialization(request.getSpecialization())
                .subSpecialization(request.getSubSpecialization())
                .qualification(request.getQualification())
                .college(request.getCollege())
                .graduationYear(request.getGraduationYear())
                .experience(request.getExperience())
                .designation(request.getDesignation())
                .hospital(request.getHospital())
                .teachingExperience(request.getTeachingExperience())
                .dob(request.getDob())
                .gender(request.getGender())
                .nationality(request.getNationality())
                .phone(request.getPhone())
                .altPhone(request.getAltPhone())
                .address(request.getAddress())
                .medicalCertName(request.getMedicalCertName())
                .aadharCardName(request.getAadharCardName())
                .cvName(request.getCvName())
                .academicLevelId(request.getAcademicLevelId())
                .build();

        userRepository.save(user);

        try {
            WelcomeEmailDto welcome = new WelcomeEmailDto();
            welcome.setEmail(user.getEmail());
            welcome.setName(user.getName());
            notificationService.sendWelcomeEmail(welcome);
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}", user.getEmail(), e);
        }

        return role.equals("INSTRUCTOR")
                ? "Registration successful. Please wait for admin approval."
                : "User registered successfully.";
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResourceNotFoundException("Invalid email or password");
        }

        if (user.getEnabled() != null && !user.getEnabled()) {
            throw new IllegalArgumentException("Account not approved. Please contact administrator.");
        }

        // Embed role + currentYear in JWT so the filter doesn't need an extra DB call
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getCurrentYear());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .role(user.getRole())
                .currentYear(user.getCurrentYear())
                .academicLevelId(user.getAcademicLevelId())
                .build();
    }
}