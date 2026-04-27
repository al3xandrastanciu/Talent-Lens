package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Application;
import com.alexandra.hr_platform.model.entity.ClassificationModel;
import com.alexandra.hr_platform.model.entity.ClassificationResult;
import com.alexandra.hr_platform.model.entity.Resume;
import com.alexandra.hr_platform.repository.ApplicationRepository;
import com.alexandra.hr_platform.repository.ClassificationModelRepository;
import com.alexandra.hr_platform.repository.ClassificationResultRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClassificationService {
    private final ApplicationRepository applicationRepository;
    private final ClassificationResultRepository classificationResultRepository;
    private final ClassificationModelRepository classificationModelRepository;
    private final RestTemplate restTemplate;
    private final ResumeService resumeService;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public ClassificationResult classify(Long applicationId) {
        Application application = applicationRepository.findById(applicationId).orElseThrow(() -> new RuntimeException("Application not found!"));
        
        if (application.getResume() == null) {
            // Fallback: find the candidate's latest resume
            Resume latestResume = resumeService.getlatestResume(application.getCandidate().getId());
            application.setResume(latestResume);
            applicationRepository.save(application); // persist the link for future calls
            System.out.println("AI Engine: Application had no resume linked. Auto-linked Resume ID: " + latestResume.getId());
        }
        
        String cvText = application.getResume().getExtractedText();
        String jobRequirements = application.getJobPosting() != null ? application.getJobPosting().getRequirements() : null;
        
        // Fallback: use description if requirements is empty
        if ((jobRequirements == null || jobRequirements.trim().isEmpty()) && application.getJobPosting() != null) {
            jobRequirements = application.getJobPosting().getDescription();
            System.out.println("AI Engine: Requirements empty, using job description as fallback.");
        }
        
        // Null safety
        if (cvText == null || cvText.trim().isEmpty()) {
            throw new RuntimeException("CV text is empty! Resume ID: " + application.getResume().getId());
        }
        if (jobRequirements == null || jobRequirements.trim().isEmpty()) {
            throw new RuntimeException("Both requirements and description are empty for Job ID: " + application.getJobPosting().getId());
        }
        
        System.out.println("AI Engine: Sending " + cvText.length() + " chars CV + " + jobRequirements.length() + " chars requirements");
        
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("cv_text", cvText);
        requestBody.put("job_requirements", jobRequirements);

        PythonResponse response = null;
        Exception lastException = null;

        // Force JSON headers
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
        org.springframework.http.HttpEntity<Map<String, String>> entity = new org.springframework.http.HttpEntity<>(requestBody, headers);

        try {
            System.out.println("AI Engine: Sending to " + mlServiceUrl + "/classify");
            response = restTemplate.postForObject(mlServiceUrl + "/classify", entity, PythonResponse.class);
            System.out.println("AI Engine: Success! Score = " + (response != null ? response.getScore() : "null"));
        } catch (Exception e) {
            lastException = e;
            System.err.println("AI Engine: Failed. Reason: " + e.getMessage());
        }

        if (response == null) {
            String errorMsg = lastException != null ? lastException.getMessage() : "Unknown error";
            throw new RuntimeException("AI Classification failed. Error: " + errorMsg);
        }

        ClassificationModel model = classificationModelRepository
                .findByAlgorithmNameAndVersion("TF-IDF", "1.0")
                .orElseGet(() -> {
                    ClassificationModel m = new ClassificationModel();
                    m.setAlgorithmName("TF-IDF");
                    m.setVersion("1.0");
                    m.setAccuracy(0.85f);
                    return classificationModelRepository.save(m);
                });
        ClassificationResult result = classificationResultRepository
                .findByApplicationId(applicationId)
                .orElse(new ClassificationResult());
        
        result.setApplication(application);
        result.setModel(model);
        result.setScore(response.getScore());
        result.setMatchedSkills(response.getMatchedSkills());
        result.setMissingSkills(response.getMissingSkills());
        result.setClassifiedAt(LocalDateTime.now());
        
        return classificationResultRepository.save(result);
    }

    public ClassificationResult getresult(Long applicationId) {
        return classificationResultRepository.findByApplicationId(applicationId).orElse(null);
    }

    public void deleteAllResults() {
        classificationResultRepository.truncateTable();
    }

    @Data
    public static class PythonResponse {
        private float score;
        private String matchedSkills;
        private String missingSkills;
    }
}
