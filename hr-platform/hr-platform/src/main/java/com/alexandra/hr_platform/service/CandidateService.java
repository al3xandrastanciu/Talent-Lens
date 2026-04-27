package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Candidate;
import com.alexandra.hr_platform.model.entity.Skill;
import com.alexandra.hr_platform.repository.CandidateRepository;
import com.alexandra.hr_platform.repository.SkillRepository;
import com.alexandra.hr_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CandidateService {
    private final CandidateRepository candidateRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public Candidate getByUserID(Long userId) {
        return candidateRepository.findByUserId(userId).orElseGet(() -> {
            com.alexandra.hr_platform.model.entity.User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found for id: " + userId));
            Candidate newCandidate = new Candidate();
            newCandidate.setUser(user);
            newCandidate.setFullName(user.getEmail()); // Default name
            return candidateRepository.save(newCandidate);
        });
    }

    public Candidate getById(Long id) {
        return candidateRepository.findById(id).orElseThrow(() -> new RuntimeException("Candidate not found for ID: " + id));
    }

    public Candidate updateProfile(Long id, String fullName, String phone) {
        Candidate candidate = getById(id);
        candidate.setFullName(fullName);
        candidate.setPhone(phone);
        return candidateRepository.save(candidate);
    }

    public Candidate addSkill(Long candidateID, String skillName) {
        Candidate candidate = getById(candidateID);
        Skill skill = skillRepository.findByNameIgnoreCase(skillName).orElseGet(() -> skillRepository.save(new Skill(null, skillName)));
        if (!candidate.getSkills().contains(skill)) {
            candidate.getSkills().add(skill);
        }
        return candidateRepository.save(candidate);
    }

    public Candidate removeSkill(Long candidateId, Long skillId) {
        Candidate candidate = getById(candidateId);
        candidate.getSkills().removeIf(skill -> skill.getId().equals(skillId));
        return candidateRepository.save(candidate);
    }

    public List<Skill> getSkills(Long candidateId) {
        return getById(candidateId).getSkills();
    }
}
