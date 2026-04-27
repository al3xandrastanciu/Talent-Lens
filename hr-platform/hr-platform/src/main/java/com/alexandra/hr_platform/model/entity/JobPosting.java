package com.alexandra.hr_platform.model.entity;

import com.alexandra.hr_platform.model.entity.enums.JobStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "job_posting")
@NoArgsConstructor
@AllArgsConstructor
public class JobPosting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

   @Column(columnDefinition = "TEXT")
    private String description;

   @Column(columnDefinition = "TEXT")
    private String requirements;

   @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobStatus status = JobStatus.ACTIVE;

    @Column(name = "published_at")
    private LocalDateTime publishedAt = LocalDateTime.now();
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @ManyToOne
    @JoinColumn(name = "recruiter_id")
    private Recruiter recruiter;

    @Column(name = "domain")
    private String domain;

    @ManyToMany
    @JoinTable(name = "job_skill",
    joinColumns = @JoinColumn(name = "job_id"),
    inverseJoinColumns = @JoinColumn(name="skill_id"))
    private List<Skill> skills;
}
