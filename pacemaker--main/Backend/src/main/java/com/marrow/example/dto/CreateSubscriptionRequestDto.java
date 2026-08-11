package com.marrow.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateSubscriptionRequestDto {
    @NotBlank(message = "Plan is required")
    private String plan;

    @NotNull(message = "Amount is required")
    private Double amount;
}
