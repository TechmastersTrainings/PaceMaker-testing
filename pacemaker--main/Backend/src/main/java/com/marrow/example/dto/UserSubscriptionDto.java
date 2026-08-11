package com.marrow.example.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSubscriptionDto {
    private Long id;
    private String userName;
    private String plan;
    private String status;
    private LocalDate startDate;
    private LocalDate expiryDate;
    private Boolean active;
    private String email;
    private Double amount;
    private String paymentMethod;
    private Boolean autoRenew;
    private String cardBrand;
    private String cardLastFour;
    private String cardExpiry;
    private String cardHolderName;
}
