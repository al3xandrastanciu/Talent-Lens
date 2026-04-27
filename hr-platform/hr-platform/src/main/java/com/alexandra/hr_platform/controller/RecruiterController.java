package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.entity.Recruiter;
import com.alexandra.hr_platform.service.RecruiterService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recruiters")
@RequiredArgsConstructor
public class RecruiterController {
    private final RecruiterService recruiterService;

    @GetMapping("/{id}")
    public ResponseEntity<Recruiter> getById(@PathVariable Long id){
        return ResponseEntity.ok(recruiterService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Recruiter> getByUserId(@PathVariable Long userId){
        return ResponseEntity.ok(recruiterService.getUserById(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Recruiter> updateProfile(@PathVariable Long id, @RequestParam String fullName, @RequestParam String jobTitle){
        return ResponseEntity.ok(recruiterService.updateProfile(id, fullName, jobTitle));
    }

    @PutMapping("/{id}/department/{departmentId}")
    public ResponseEntity<Recruiter> assignToDepartment(@PathVariable Long id, @PathVariable Long departmentId){
        return ResponseEntity.ok(recruiterService.assignToDepartment(id, departmentId));
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Recruiter>> getByDepartment(@PathVariable Long departmentId){
        return ResponseEntity.ok(recruiterService.getByDepartmentId(departmentId));
    }
}
