package com.marrow.example.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyPaymentRequestDto {
    @NotBlank
    private String razorpayPaymentId;

    private String razorpayOrderId;

    private String razorpaySignature;

    private String cardBrand;
    private String cardLastFour;
    private String cardExpiry;
    private String cardHolderName;
    private String paymentMethod;
    private Boolean autoRenew;
}
