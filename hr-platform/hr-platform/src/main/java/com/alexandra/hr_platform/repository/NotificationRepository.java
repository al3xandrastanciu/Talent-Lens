package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.Notification;
import com.alexandra.hr_platform.model.entity.enums.RecipientType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdAndRecipientType(Long recipientId, RecipientType recipientType);
    List<Notification> findByRecipientIdAndRecipientTypeAndIsRead(Long recipientId, RecipientType recipientType, Boolean isRead);
    long countByRecipientIdAndRecipientTypeAndIsRead(Long recipientId, RecipientType recipientType, Boolean isRead);
}
