package com.marrow.example.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class NewsletterSubscribeRequest {
    @NotBlank
    @Email
    private String email;
}
