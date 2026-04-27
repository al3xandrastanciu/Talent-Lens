package com.alexandra.hr_platform.model.entity;

import com.alexandra.hr_platform.model.entity.enums.RecipientType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "notification")
@NoArgsConstructor
@AllArgsConstructor
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   private String subject;

   @Column(columnDefinition = "TEXT")
    private String message;

   private Boolean isRead=false;

   private LocalDateTime sentAt=LocalDateTime.now();

   @Enumerated(EnumType.STRING)
    private RecipientType recipientType;

   private Long recipientId;

}
