package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Application;
import com.alexandra.hr_platform.model.entity.Candidate;
import com.alexandra.hr_platform.model.entity.JobPosting;
import com.alexandra.hr_platform.model.entity.enums.ApplicationStatus;
import com.alexandra.hr_platform.model.entity.enums.RecipientType;
import com.alexandra.hr_platform.repository.ApplicationRepository;
import com.alexandra.hr_platform.repository.CandidateRepository;
import com.alexandra.hr_platform.repository.JobPostingRepository;
import com.alexandra.hr_platform.repository.ResumeRepository;
import com.alexandra.hr_platform.model.entity.Resume;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final CandidateRepository candidateRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final NotificationService notificationService;

    public Application apply(Long candidateId, Long jobId, Long resumeId) {
        if (applicationRepository.existsByCandidateIdAndJobPostingId(candidateId, jobId)) {
            throw new RuntimeException("You have already applied for this job!");
        }
        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow(() -> new RuntimeException("Candidate with id: " + candidateId + " not found!"));
        JobPosting job = jobPostingRepository.findById(jobId).orElseThrow(() -> new RuntimeException("Job with id:" + jobId + " not found!"));
        Application application = new Application();
        application.setCandidate(candidate);
        application.setJobPosting(job);
        
        if (resumeId != null) {
            Resume resume = resumeRepository.findById(resumeId).orElseThrow(() -> new RuntimeException("Resume with id: " + resumeId + " not found!"));
            application.setResume(resume);
        }
        
        application.setApplicationStatus(ApplicationStatus.PENDING);
        return applicationRepository.save(application);
    }

    public Application getById(Long id) {
        return applicationRepository.findById(id).orElseThrow(() -> new RuntimeException("Application with id: " + id + " does not exist!"));
    }

    public List<Application> getByJobId(Long jobId) {
        return applicationRepository.findByJobPostingId(jobId);
    }

    public List<Application> getByCandidate(Long candidateId) {
        return applicationRepository.findByCandidateId(candidateId);
    }

    public Application updateStatus(Long id, ApplicationStatus newStatus) {
        Application application = getById(id);
        application.setApplicationStatus(newStatus);
        applicationRepository.save(application);
        notificationService.send(
                application.getCandidate().getId(),
                RecipientType.CANDIDATE,
                "Application status updated",
                "Your application status has been updated to: " + newStatus
        );
        return application;
    }

    public void withdrawApplication(Long id) {
        Application application = getById(id);
        if (application.getApplicationStatus() != ApplicationStatus.PENDING) {
            throw new RuntimeException("You can't withdraw an application with status: "
                    + application.getApplicationStatus());
        }
        applicationRepository.deleteById(id);
    }

    public List<Application> getByStatus(ApplicationStatus status) {
        return applicationRepository.findByApplicationStatus(status);
    }

}
