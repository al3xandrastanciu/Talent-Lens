package com.alexandra.hr_platform.model.dto.response;

import com.alexandra.hr_platform.model.entity.enums.RecipientType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NotificationResponse {
    private Long id;
    private String subject;
    private String message;
    private Boolean isRead;
    private LocalDateTime sentAt;
    private RecipientType recipientType;

}
