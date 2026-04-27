package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.Application;
import com.alexandra.hr_platform.model.entity.enums.ApplicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobPostingId(Long jobPostingId);
    List<Application> findByApplicationStatus(ApplicationStatus status);
    boolean existsByCandidateIdAndJobPostingId(Long candidateId, Long jobPostingId);
    List<Application> findByCandidateIdAndApplicationStatus(Long candidateId, ApplicationStatus status);
    List<Application> findByResumeId(Long resumeId);
}
