package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.JobPosting;
import com.alexandra.hr_platform.model.entity.enums.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostingRepository extends JpaRepository<JobPosting, Long> {
    List<JobPosting> findByRecruiterId(Long recruiterId);
    List<JobPosting> findByStatus(JobStatus status);
    List<JobPosting> findByDomain(String domain);
    List<JobPosting> findByTitleContainingIgnoreCase(String keyword);
    List<JobPosting> findByRecruiterIdAndStatus(Long recruiterId, JobStatus status);
}
