package com.alexandra.hr_platform.model.dto.response;

import com.alexandra.hr_platform.model.entity.enums.ApplicationStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {
    private Long id;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private String candidateName;
    private String jobTitle;
    private Float classificationScore;
}
