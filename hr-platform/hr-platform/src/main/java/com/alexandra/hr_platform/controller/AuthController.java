package com.alexandra.hr_platform.controller;

import com.alexandra.hr_platform.model.dto.request.LoginRequest;
import com.alexandra.hr_platform.model.dto.request.RegisterRequest;
import com.alexandra.hr_platform.model.entity.Candidate;
import com.alexandra.hr_platform.model.entity.Recruiter;
import com.alexandra.hr_platform.model.entity.User;
import com.alexandra.hr_platform.model.entity.enums.Role;
import com.alexandra.hr_platform.repository.CandidateRepository;
import com.alexandra.hr_platform.repository.RecruiterRepository;
import com.alexandra.hr_platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final RecruiterRepository recruiterRepository;
    private final CandidateRepository candidateRepository;
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("This email has already been used!");
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        userRepository.save(user);
        if (request.getRole() == Role.RECRUITER) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(user);
            recruiter.setFullName(request.getFirstName() + " " + request.getLastName());
            recruiterRepository.save(recruiter);
        } else {
            Candidate candidate = new Candidate();
            candidate.setUser(user);
            candidate.setFullName(request.getFirstName() + " " + request.getLastName());
            candidateRepository.save(candidate);
        }
        return ResponseEntity.ok("Account succesfully created!");
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findUserByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        java.util.Map<String, Object> responseData = new java.util.HashMap<>();
        responseData.put("token", "dummy-token"); // Momentan punem un text până pui JWT-ul real
        responseData.put("user", user);
        return ResponseEntity.ok(responseData);
    }
}
