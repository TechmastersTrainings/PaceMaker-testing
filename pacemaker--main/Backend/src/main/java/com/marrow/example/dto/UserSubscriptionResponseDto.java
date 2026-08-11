package com.marrow.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionResponseDto {
    private String plan;
    private String status;
    private String expiryDate;
    private Boolean qbankAccess;
    private Boolean videoAccess;
    private Boolean liveClassAccess;
    private Boolean aiAccess;
    
    private String paymentMethod;
    private Boolean autoRenew;
    private String cardBrand;
    private String cardLastFour;
    private String cardExpiry;
    private String cardHolderName;
}
