package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.JobPosting;
import com.alexandra.hr_platform.model.entity.Recruiter;
import com.alexandra.hr_platform.model.entity.Skill;
import com.alexandra.hr_platform.model.entity.enums.JobStatus;
import com.alexandra.hr_platform.repository.JobPostingRepository;
import com.alexandra.hr_platform.repository.RecruiterRepository;
import com.alexandra.hr_platform.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobPostingService {
    private final JobPostingRepository jobPostingRepository;
    private final RecruiterRepository recruiterRepository;
    private final SkillRepository skillRepository;

    public JobPosting createJob(String title, String description, String requirements, String domain, Long recruiterId, List<String> skillNames) {
        Recruiter recruiter = recruiterRepository.findById(recruiterId).orElseThrow(() -> new RuntimeException("Recruitor with id " + recruiterId + " not found."));
        List<Skill> skills = skillNames.stream().map(name -> skillRepository.findByNameIgnoreCase(name).orElseGet(() -> skillRepository.save(new Skill(null, name)))).toList();
        JobPosting job = new JobPosting();
        job.setTitle(title);
        job.setDescription(description);
        job.setRequirements(requirements);
        job.setDomain(domain);
        job.setStatus(JobStatus.ACTIVE);
        job.setRecruiter(recruiter);
        job.setSkills(skills);
        return jobPostingRepository.save(job);
    }

    public List<JobPosting> getAllActiveJobs() {
        return jobPostingRepository.findByStatus(JobStatus.ACTIVE);
    }

    public List<JobPosting> getJobsByDomain(String domain) {
        return jobPostingRepository.findByDomain(domain);
    }

    public List<JobPosting> getJobsByRecruiter(Long recruiterId) {
        return jobPostingRepository.findByRecruiterId(recruiterId);
    }

    public JobPosting getJobById(Long id) {
        return jobPostingRepository.findById(id).orElseThrow(() -> new RuntimeException("Job with id: " + id + " not found!"));
    }

    public List<JobPosting> searchJobs(String keyword) {
        return jobPostingRepository.findByTitleContainingIgnoreCase(keyword);
    }

    public JobPosting updateJob(Long id, String title, String description, String requirements, String domain) {
        JobPosting job = getJobById(id);
        job.setTitle(title);
        job.setDescription(description);
        job.setRequirements(requirements);
        job.setDomain(domain);
        return jobPostingRepository.save(job);
    }

    public JobPosting closeJob(Long id) {
        JobPosting job = getJobById(id);
        job.setStatus(JobStatus.CLOSED);
        return jobPostingRepository.save(job);
    }

    public void deleteJob(Long id) {
        if (!jobPostingRepository.existsById(id)) {
            throw new RuntimeException("Job with id: " + id + " not found!");
        }
        jobPostingRepository.deleteById(id);
    }
}
