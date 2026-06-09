package com.marrow.example.repository;

import com.marrow.example.entity.SubscriptionPlan;
import com.marrow.example.enums.SubscriptionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, Long> {
    Optional<SubscriptionPlan> findByPlanType(SubscriptionType planType);
}
