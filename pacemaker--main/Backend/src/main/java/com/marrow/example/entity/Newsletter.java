package com.marrow.example.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "newsletter_subscribers", indexes = {
    @Index(name = "idx_newsletter_email", columnList = "email", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Newsletter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "subscribed_at", nullable = false)
    private LocalDateTime subscribedAt;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @PrePersist
    public void prePersist() {
        this.subscribedAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
    }
}
