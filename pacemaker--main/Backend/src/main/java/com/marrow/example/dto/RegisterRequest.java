package com.marrow.example.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private String role;

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

    public RegisterRequest() {}

    public RegisterRequest(String name, String email, String password, String role) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getSpecialization() { return specialization; }
    public void setSpecialization(String specialization) { this.specialization = specialization; }

    public String getSubSpecialization() { return subSpecialization; }
    public void setSubSpecialization(String subSpecialization) { this.subSpecialization = subSpecialization; }

    public String getQualification() { return qualification; }
    public void setQualification(String qualification) { this.qualification = qualification; }

    public String getCollege() { return college; }
    public void setCollege(String college) { this.college = college; }

    public String getGraduationYear() { return graduationYear; }
    public void setGraduationYear(String graduationYear) { this.graduationYear = graduationYear; }

    public Integer getCurrentYear() { return currentYear; }
    public void setCurrentYear(Integer currentYear) { this.currentYear = currentYear; }

    public String getExperience() { return experience; }
    public void setExperience(String experience) { this.experience = experience; }

    public String getDesignation() { return designation; }
    public void setDesignation(String designation) { this.designation = designation; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public String getTeachingExperience() { return teachingExperience; }
    public void setTeachingExperience(String teachingExperience) { this.teachingExperience = teachingExperience; }

    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAltPhone() { return altPhone; }
    public void setAltPhone(String altPhone) { this.altPhone = altPhone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getMedicalCertName() { return medicalCertName; }
    public void setMedicalCertName(String medicalCertName) { this.medicalCertName = medicalCertName; }

    public String getAadharCardName() { return aadharCardName; }
    public void setAadharCardName(String aadharCardName) { this.aadharCardName = aadharCardName; }

    public String getCvName() { return cvName; }
    public void setCvName(String cvName) { this.cvName = cvName; }

    public String getAcademicLevelId() { return academicLevelId; }
    public void setAcademicLevelId(String academicLevelId) { this.academicLevelId = academicLevelId; }
}