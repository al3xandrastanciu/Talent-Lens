package com.alexandra.hr_platform.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "classification_model")
@NoArgsConstructor
@AllArgsConstructor
public class ClassificationModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String algorithmName;

    private String version;
    private LocalDateTime trainedAt;
    private float accuracy;

}
