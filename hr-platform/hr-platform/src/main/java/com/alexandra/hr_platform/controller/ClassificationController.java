package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.entity.ClassificationResult;
import com.alexandra.hr_platform.service.ClassificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/classifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ClassificationController {
    private final ClassificationService classificationService;

    @PostMapping("/{applicationId}")
    public ResponseEntity<ClassificationResult> classify(@PathVariable Long applicationId) {
        return ResponseEntity.ok(classificationService.classify(applicationId));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<ClassificationResult> getResult(@PathVariable Long applicationId) {
        ClassificationResult result = classificationService.getresult(applicationId);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/cleanup")
    public ResponseEntity<String> cleanup() {
        classificationService.deleteAllResults();
        return ResponseEntity.ok("Baza de date a fost curatata de rezultatele 'stricate'. Poti reincerca acum!");
    }
}
