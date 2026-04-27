package com.alexandra.hr_platform.model.dto.request;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EvaluationRequest {
    private Long applicationId;
    private Long recruiterId;
    private LocalDate interviewDate;
    private Integer interviewrating;
    private String comments;
    private String finalDecision;
}
