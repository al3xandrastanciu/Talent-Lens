package com.alexandra.hr_platform.model.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class CandidateProfileResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private List<String> skills;
}
