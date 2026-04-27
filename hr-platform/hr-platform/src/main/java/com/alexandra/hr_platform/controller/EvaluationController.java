package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.dto.request.EvaluationRequest;
import com.alexandra.hr_platform.model.entity.Evaluation;
import com.alexandra.hr_platform.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {
    private final EvaluationService evaluationService;

    @PostMapping
    public ResponseEntity<Evaluation> createEvaluation(@RequestBody EvaluationRequest request) {
        Evaluation evaluation = evaluationService.createEvaluation(
                request.getApplicationId(),
                request.getRecruiterId(),
                request.getInterviewDate(),
                request.getInterviewrating(),
                request.getComments(),
                request.getFinalDecision()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluation);
    }

    @GetMapping("/application/{applicationId}")
    public ResponseEntity<Evaluation> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(evaluationService.getByApplication(applicationId));
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<Evaluation>> getByRecruiter(@PathVariable Long recruiterId) {
        return ResponseEntity.ok(evaluationService.getByRecruiter(recruiterId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Evaluation> updateevaluation(@PathVariable Long id, @RequestBody EvaluationRequest request) {
        Evaluation evaluation = evaluationService.updateEvaluation(
                id,
                request.getInterviewDate(),
                request.getInterviewrating(),
                request.getComments(),
                request.getFinalDecision()
        );
        return ResponseEntity.ok(evaluation);
    }
}
