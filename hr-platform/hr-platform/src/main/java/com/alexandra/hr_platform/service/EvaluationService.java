package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Application;
import com.alexandra.hr_platform.model.entity.Evaluation;
import com.alexandra.hr_platform.model.entity.Recruiter;
import com.alexandra.hr_platform.model.entity.enums.ApplicationStatus;
import com.alexandra.hr_platform.repository.ApplicationRepository;
import com.alexandra.hr_platform.repository.EvaluationRepository;
import com.alexandra.hr_platform.repository.RecruiterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {
    private final EvaluationRepository evaluationRepository;
    private final ApplicationRepository applicationRepository;
    private final RecruiterRepository recruiterRepository;

    public Evaluation createEvaluation(Long applicationId, Long recruiterId, LocalDate interviewDate, Integer rating, String comments, String finaldecision) {
        Application application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found!"));
        Recruiter recruiter = recruiterRepository.findById(recruiterId).orElseThrow(() -> new RuntimeException("Recruiter not found!"));
        if (evaluationRepository.findByApplicationId(applicationId).isPresent()) {
            throw new RuntimeException("This application has already been evaluated!");
        }
        Evaluation evaluation = new Evaluation();
        evaluation.setApplication(application);
        evaluation.setRecruiter(recruiter);
        evaluation.setInterviewDate(interviewDate);
        evaluation.setInterviewRating(rating);
        evaluation.setComments(comments);
        evaluation.setFinalDecision(finaldecision);

        if ("ACCEPTED".equals(finaldecision)) {
            application.setApplicationStatus(ApplicationStatus.ACCEPTED);
        } else if ("REJECTED".equals(finaldecision)) {
            application.setApplicationStatus(ApplicationStatus.REJECTED);
        } else if (application.getApplicationStatus() == ApplicationStatus.PENDING) {
            application.setApplicationStatus(ApplicationStatus.REVIEWED);
        }
        applicationRepository.save(application);

        return evaluationRepository.save(evaluation);
    }

    public Evaluation getByApplication(Long applicationId) {
        return evaluationRepository.findByApplicationId(applicationId).orElse(null);
    }

    public List<Evaluation> getByRecruiter(Long recruiterId) {
        return evaluationRepository.findByRecruiterId(recruiterId);
    }

    public Evaluation updateEvaluation(Long id, LocalDate interviewDate, Integer rating, String comments, String finalDecision) {
        Evaluation evaluation = evaluationRepository.findById(id).orElseThrow(() -> new RuntimeException("Evaluation not found!"));
        evaluation.setInterviewDate(interviewDate);
        evaluation.setInterviewRating(rating);
        evaluation.setComments(comments);
        evaluation.setFinalDecision(finalDecision);

        Application application = evaluation.getApplication();
        if ("ACCEPTED".equals(finalDecision)) {
            application.setApplicationStatus(ApplicationStatus.ACCEPTED);
        } else if ("REJECTED".equals(finalDecision)) {
            application.setApplicationStatus(ApplicationStatus.REJECTED);
        }
        applicationRepository.save(application);

        return evaluationRepository.save(evaluation);
    }
}
