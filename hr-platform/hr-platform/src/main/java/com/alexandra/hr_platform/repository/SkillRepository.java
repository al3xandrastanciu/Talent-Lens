package com.alexandra.hr_platform.repository;

import com.alexandra.hr_platform.model.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    Optional<Skill> findByNameIgnoreCase(String name);
    List<Skill> findByNameIn(List<String> names);
    boolean existsByNameIgnoreCase(String name);
}
