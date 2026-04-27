package com.alexandra.hr_platform.model.dto.request;

import lombok.Data;

@Data
public class ApplicationRequest {
    private Long candidateId;
    private Long jobId;
    private Long resumeId;
}
