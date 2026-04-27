package com.alexandra.hr_platform.model.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class JobPostingRequest {
    private String title;
    private String description;
    private String requirements;
    private Long recruiterId;
    private String domain;
    private List<String> skills;
}
