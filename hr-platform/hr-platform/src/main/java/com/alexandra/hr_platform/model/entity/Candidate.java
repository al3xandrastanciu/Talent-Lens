package com.alexandra.hr_platform.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.List;

@Entity
@Data
@Table(name = "candidate")
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    private String phone;

    @OneToOne
    @JoinColumn(name = "user_id",nullable = false,unique = true)
    User user;

    @ManyToMany
    @JoinTable(
            name = "candidate_skill",
            joinColumns = @JoinColumn(name = "candidate_id"),
            inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private List<Skill> skills;
    @ToString.Exclude
    @OneToMany(mappedBy = "candidate")
    @JsonIgnoreProperties({"candidate", "jobPosting", "classificationResult", "evaluation"})
    private List<Application> applications;
    @ToString.Exclude
    @OneToMany(mappedBy = "candidate")
    @JsonIgnoreProperties("candidate")
    private List<Resume> resumes;
}
