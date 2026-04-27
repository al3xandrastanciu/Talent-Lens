package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.ClassificationModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClassificationModelRepository extends JpaRepository<ClassificationModel, Long> {
    Optional<ClassificationModel> findByAlgorithmNameAndVersion(String algorithmName, String version);
    Optional<ClassificationModel> findTopByAlgorithmNameOrderByTrainedAtDesc(String algorithmName);
}
