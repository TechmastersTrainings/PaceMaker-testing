package com.marrow.example.service;

import com.marrow.example.dto.UserSubscriptionResponseDto;
import com.marrow.example.entity.User;
import com.marrow.example.entity.UserSubscription;
import com.marrow.example.exception.ResourceNotFoundException;
import com.marrow.example.repository.UserRepository;
import com.marrow.example.repository.UserSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class UserSubscriptionService {

    private final UserSubscriptionRepository userSubscriptionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserSubscriptionResponseDto getUserSubscription() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if ("ADMIN".equalsIgnoreCase(user.getRole()) || "INSTRUCTOR".equalsIgnoreCase(user.getRole()) || "TRAINER".equalsIgnoreCase(user.getRole())) {
            return UserSubscriptionResponseDto.builder()
                    .plan("HIGH")
                    .status("ACTIVE")
                    .expiryDate("2099-12-31")
                    .qbankAccess(true)
                    .videoAccess(true)
                    .liveClassAccess(true)
                    .aiAccess(true)
                    .paymentMethod("System")
                    .autoRenew(true)
                    .build();
        }

        UserSubscription subscription = userSubscriptionRepository.findTopByUserIdOrderByCreatedAtDesc(user.getId())
                .orElse(null);

        if (subscription == null) {
            return UserSubscriptionResponseDto.builder()
                    .plan(null)
                    .status("NONE")
                    .expiryDate(null)
                    .qbankAccess(false)
                    .videoAccess(false)
                    .liveClassAccess(false)
                    .aiAccess(false)
                    .paymentMethod(null)
                    .autoRenew(false)
                    .build();
        }

        boolean isSubscriptionActive = com.marrow.example.enums.SubscriptionStatus.ACTIVE == subscription.getSubscriptionStatus();
        return UserSubscriptionResponseDto.builder()
                .plan(subscription.getSubscriptionPlan().getPlanType().name())
                .status(subscription.getSubscriptionStatus().name())
                .expiryDate(subscription.getExpiryDate() != null ? subscription.getExpiryDate().format(DateTimeFormatter.ISO_LOCAL_DATE) : null)
                .qbankAccess(isSubscriptionActive || subscription.getSubscriptionPlan().getQbankAccess())
                .videoAccess(isSubscriptionActive || subscription.getSubscriptionPlan().getVideoAccess())
                .liveClassAccess(isSubscriptionActive || subscription.getSubscriptionPlan().getLiveClassAccess())
                .aiAccess(isSubscriptionActive || subscription.getSubscriptionPlan().getAiAccess())
                .paymentMethod(subscription.getPaymentMethod() != null ? subscription.getPaymentMethod() : "Razorpay")
                .autoRenew(subscription.getAutoRenew() != null ? subscription.getAutoRenew() : true)
                .cardBrand(subscription.getCardBrand())
                .cardLastFour(subscription.getCardLastFour())
                .cardExpiry(subscription.getCardExpiry())
                .cardHolderName(subscription.getCardHolderName())
                .build();
    }
}
