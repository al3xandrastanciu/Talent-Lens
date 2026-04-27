package com.alexandra.hr_platform.model.dto.response;

import com.alexandra.hr_platform.model.entity.enums.JobStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobPostingResponse {
    private Long id;
    private String title;
    private String descriptions;
    private String requirements;
    private JobStatus status;
    private LocalDateTime publishedAt;
    private String recruiterName;
    private List<String> skills;
}
