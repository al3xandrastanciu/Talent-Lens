package com.alexandra.hr_platform.model.entity;

import com.alexandra.hr_platform.model.entity.enums.ApplicationStatus;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "application")
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @JsonProperty("status")
    private ApplicationStatus applicationStatus = ApplicationStatus.PENDING;

    private LocalDateTime appliedAt=LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "candidate_id", nullable = false)
    @JsonIgnoreProperties({"applications", "user"})
    private Candidate candidate;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnoreProperties({"recruiter", "skills"})
    private JobPosting jobPosting;

    @ManyToOne
    @JoinColumn(name = "resume_id")
    @JsonIgnoreProperties("candidate")
    private Resume resume;

    @OneToOne(mappedBy = "application", cascade=CascadeType.ALL)
    @JsonIgnoreProperties("application")
    private ClassificationResult classificationResult;

    @OneToOne(mappedBy = "application", cascade=CascadeType.ALL)
    @JsonIgnoreProperties("application")
    private Evaluation evaluation;


}
