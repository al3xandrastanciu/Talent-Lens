package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByCandidateId(Long candidateId);
    Optional<Resume> findTopByCandidateIdOrderByUploadedAtDesc(Long candidateId);
}
