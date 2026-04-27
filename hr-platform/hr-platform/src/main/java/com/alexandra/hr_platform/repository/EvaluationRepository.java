package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    Optional<Evaluation> findByApplicationId(Long applicationId);
    List<Evaluation> findByRecruiterId(Long recruiterId);
}
