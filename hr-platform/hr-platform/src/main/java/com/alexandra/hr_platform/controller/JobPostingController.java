package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.dto.request.JobPostingRequest;
import com.alexandra.hr_platform.model.entity.JobPosting;
import com.alexandra.hr_platform.service.JobPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobPostingController {
    private final JobPostingService jobPostingService;

    @GetMapping
    public ResponseEntity<List<JobPosting>> getAllActiveJobs() {
        return ResponseEntity.ok(jobPostingService.getAllActiveJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPosting> getJobById(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.getJobById(id));
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<JobPosting>> getJobsByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(jobPostingService.getJobsByRecruiter(recruiterId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<JobPosting>> getJobsByDomain(@RequestParam String domain) {
        return ResponseEntity.ok(jobPostingService.getJobsByDomain(domain));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobPosting>> searchJobs(@RequestParam String keyword) {
        return ResponseEntity.ok(jobPostingService.searchJobs(keyword));
    }

    @PostMapping
    public ResponseEntity<JobPosting> createJob(@RequestBody JobPostingRequest request) {
        JobPosting job = jobPostingService.createJob(
                request.getTitle(),
                request.getDescription(),
                request.getRequirements(),
                request.getDomain(),
                request.getRecruiterId(),
                request.getSkills()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(job);
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPosting> updateJob(@PathVariable Long id, @RequestBody JobPostingRequest request) {
        JobPosting job = jobPostingService.updateJob(
                id,
                request.getTitle(),
                request.getDescription(),
                request.getRequirements(),
                request.getDomain()
        );
        return ResponseEntity.ok(job);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<JobPosting> closeJob(@PathVariable Long id) {
        return ResponseEntity.ok(jobPostingService.closeJob(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable Long id) {
        jobPostingService.deleteJob(id);
        return ResponseEntity.noContent().build();
    }
}
