package com.alexandra.hr_platform.model.dto.request;

import com.alexandra.hr_platform.model.entity.enums.ApplicationStatus;
import lombok.Data;

@Data
public class UpdateStatusRequest {
    private ApplicationStatus status;
}
