package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.entity.Candidate;
import com.alexandra.hr_platform.model.entity.Skill;
import com.alexandra.hr_platform.service.CandidateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/candidates")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class CandidateController {
    private final CandidateService candidateService;

    @GetMapping("/{id}")
    public ResponseEntity<Candidate> getById(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Candidate> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(candidateService.getByUserID(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Candidate> updateProfile(@PathVariable Long id, @RequestParam String fullName, @RequestParam String phone) {
        return ResponseEntity.ok(candidateService.updateProfile(id, fullName, phone));
    }

    @PostMapping("/{id}/skills")
    public ResponseEntity<Candidate> addSkills(@PathVariable Long id, @RequestParam String skillName) {
        return ResponseEntity.ok(candidateService.addSkill(id, skillName));
    }

    @DeleteMapping("/{is}/skills/{skillId}")
    public ResponseEntity<Candidate> removeSkill(@PathVariable Long id, @PathVariable Long skillId) {
        return ResponseEntity.ok(candidateService.removeSkill(id, skillId));
    }

    @GetMapping("/{id}/skills")
    public ResponseEntity<List<Skill>> getSkills(@PathVariable Long id) {
        return ResponseEntity.ok(candidateService.getSkills(id));
    }
}
