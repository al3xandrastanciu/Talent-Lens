package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.ClassificationResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassificationResultRepository extends JpaRepository<ClassificationResult, Long> {
    Optional<ClassificationResult> findByApplicationId(Long applicationId);
    List<ClassificationResult> findByModelId(Long modelId);
    List<ClassificationResult> findByScoreGreaterThanEqual(float minScore);

    @Modifying
    @Transactional
    @Query(value = "DELETE FROM classification_result", nativeQuery = true)
    void truncateTable();
}
