package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Department;
import com.alexandra.hr_platform.model.entity.Recruiter;
import com.alexandra.hr_platform.repository.DepartmentRepository;
import com.alexandra.hr_platform.repository.RecruiterRepository;
import com.alexandra.hr_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecruiterService {
    private final RecruiterRepository recruiterRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public Recruiter getUserById(Long userId) {
        return recruiterRepository.findByUserId(userId).orElseGet(() -> {
            com.alexandra.hr_platform.model.entity.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found for id: " + userId));
            Recruiter newRecruiter = new Recruiter();
            newRecruiter.setUser(user);
            newRecruiter.setFullName(user.getEmail()); // Default name
            return recruiterRepository.save(newRecruiter);
        });
    }

    public Recruiter getById(Long id) {
        return recruiterRepository.findById(id).orElseThrow(() -> new RuntimeException("Recruiter with id: " + id + " Not found."));
    }

    public Recruiter updateProfile(Long id, String fullname, String jobTitle) {
        Recruiter recruiter = getById(id);
        recruiter.setFullName(fullname);
        recruiter.setJobTitle(jobTitle);
        return recruiterRepository.save(recruiter);
    }

    public Recruiter assignToDepartment(Long recruiterId, Long departmentId) {
        Recruiter recruiter = getById(recruiterId);
        Department department = departmentRepository.findById(departmentId).orElseThrow(() -> new RuntimeException("Department with id " + departmentId + " not found."));
        recruiter.setDepartment(department);
        return recruiterRepository.save(recruiter);
    }

    public List<Recruiter> getByDepartmentId(Long departmentid) {
        return recruiterRepository.findByDepartmentId(departmentid);
    }
}
