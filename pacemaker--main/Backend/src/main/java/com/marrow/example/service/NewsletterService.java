package com.marrow.example.service;

import com.marrow.example.dto.NewsletterSubscribeRequest;
import com.marrow.example.dto.NewsletterSubscribeResponse;
import com.marrow.example.entity.Newsletter;
import com.marrow.example.repository.NewsletterRepository;
import com.marrow.example.util.EmailTemplateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NewsletterService {

    private final NewsletterRepository newsletterRepository;
    private final EmailService emailService;

    @Transactional
    public NewsletterSubscribeResponse subscribe(NewsletterSubscribeRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (newsletterRepository.existsByEmail(email)) {
            return NewsletterSubscribeResponse.builder()
                    .message("You are already subscribed!")
                    .build();
        }

        Newsletter subscriber = Newsletter.builder()
                .email(email)
                .build();

        newsletterRepository.save(subscriber);

        try {
            String subject = "Welcome to PaceMaker Medical High-Yields!";
            String body = EmailTemplateUtil.getNewsletterConfirmationTemplate();
            emailService.sendEmailAsync(email, subject, body);
            log.info("Newsletter confirmation email sent to {}", email);
        } catch (Exception e) {
            log.error("Failed to send newsletter confirmation to {}", email, e);
        }

        return NewsletterSubscribeResponse.builder()
                .message("Subscribed successfully! Check your inbox for confirmation.")
                .build();
    }
}
