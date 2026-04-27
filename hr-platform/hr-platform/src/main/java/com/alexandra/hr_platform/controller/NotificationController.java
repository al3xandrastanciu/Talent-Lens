package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.entity.Notification;
import com.alexandra.hr_platform.model.entity.enums.RecipientType;
import com.alexandra.hr_platform.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/{userId}")
    public ResponseEntity<List<Notification>> getAllNotifications(@PathVariable Long userId, @RequestParam RecipientType recipientType) {
        return ResponseEntity.ok(notificationService.getAll(userId, recipientType));
    }

    @GetMapping("/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId, @RequestParam RecipientType recipientType) {
        return ResponseEntity.ok(notificationService.getUnread(userId, recipientType));
    }

    @GetMapping("/{userId}/count")
    public ResponseEntity<Long> countUnreadNotifications(@PathVariable Long userId, @RequestParam RecipientType recipientType) {
        return ResponseEntity.ok(notificationService.countUnread(userId, recipientType));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}
