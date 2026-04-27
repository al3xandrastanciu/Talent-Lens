package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Notification;
import com.alexandra.hr_platform.model.entity.enums.RecipientType;
import com.alexandra.hr_platform.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public Notification send(Long recipientId, RecipientType recipientType, String subject, String message) {
        Notification notification = new Notification();
        notification.setRecipientId(recipientId);
        notification.setRecipientType(recipientType);
        notification.setSubject(subject);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getAll(Long recipientId, RecipientType recipientType) {
        return notificationRepository.findByRecipientIdAndRecipientType(recipientId, recipientType);
    }

    public List<Notification> getUnread(Long recipientId, RecipientType recipientType) {
        return notificationRepository.findByRecipientIdAndRecipientTypeAndIsRead(
                recipientId, recipientType, false);
    }

    public long countUnread(Long recipientId, RecipientType recipientType) {
        return notificationRepository.countByRecipientIdAndRecipientTypeAndIsRead(
                recipientId, recipientType, false);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificare negasita: " + id));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(Long recipientId, RecipientType recipientType) {
        List<Notification> unread = getUnread(recipientId, recipientType);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}
