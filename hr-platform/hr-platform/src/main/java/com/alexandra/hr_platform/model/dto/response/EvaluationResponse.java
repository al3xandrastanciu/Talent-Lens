package com.alexandra.hr_platform.model.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EvaluationResponse {
    private Long id;
    private LocalDateTime interviewDate;
    private Integer interviewRating;
    private String comments;
    private String finalDecision;
    private String recruiterName;
}
