package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.Recruiter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruiterRepository extends JpaRepository<Recruiter, Long> {
    Optional<Recruiter> findByUserId(Long userId);
    List<Recruiter> findByDepartmentId(Long departmentId);
    boolean existsByUserId(Long userId);
}
