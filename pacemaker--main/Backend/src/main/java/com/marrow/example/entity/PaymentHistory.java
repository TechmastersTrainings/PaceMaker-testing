package com.marrow.example.entity;

import com.marrow.example.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "razorpay_payment_id", unique = true, nullable = false)
    private String razorpayPaymentId;

    @Column(name = "subscription_id")
    private String subscriptionId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Column(name = "card_brand")
    private String cardBrand;

    @Column(name = "card_last_four")
    private String cardLastFour;

    @Column(name = "card_expiry")
    private String cardExpiry;

    @Column(name = "card_holder_name")
    private String cardHolderName;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
