package com.alexandra.hr_platform.service;

import com.alexandra.hr_platform.model.entity.Application;
import com.alexandra.hr_platform.model.entity.Candidate;
import com.alexandra.hr_platform.model.entity.Resume;
import com.alexandra.hr_platform.repository.ApplicationRepository;
import com.alexandra.hr_platform.repository.CandidateRepository;
import com.alexandra.hr_platform.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {
    private final ResumeRepository resumeRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;

    private static final String UPLOAD_DIR = "../uploads/resumes/";


    public Resume uploadResume(Long candidateId, MultipartFile file) throws IOException {
        Candidate candidate = candidateRepository.findById(candidateId).orElseThrow(() -> new RuntimeException("Candidate not found!"));
        String originalName = file.getOriginalFilename();
        if (originalName == null ||
                (!originalName.endsWith(".pdf") && !originalName.endsWith(".docx"))) {
            throw new RuntimeException("Only PDF or DOCX files are allowed!");
        }
        String uniqueFileName = UUID.randomUUID() + "_" + originalName;
        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);
        
        System.out.println("Resume Upload: File saved to ABSOLUTE path: " + filePath);

        String extractedText = "";
        try {
            Tika tika = new Tika();
            extractedText = tika.parseToString(file.getInputStream());
        } catch (Exception e) {
            extractedText = "Error during text extraction: " + e.getMessage();
        }

        String format = originalName.endsWith(".pdf") ? "PDF" : "DOCX";
        Resume resume = new Resume();
        resume.setCandidate(candidate);
        resume.setFilePath(filePath.toString());
        resume.setFileFormat(format);
        resume.setExtractedText(extractedText);
        return resumeRepository.save(resume);

    }

    public List<Resume> getByCandidate(Long candidateId) {
        return resumeRepository.findByCandidateId(candidateId);
    }

    public Resume getlatestResume(Long candidateId) {
        return resumeRepository.findTopByCandidateIdOrderByUploadedAtDesc(candidateId).orElseThrow(() -> new RuntimeException("No resumes found for candidate with id: " + candidateId));
    }

    public Resume getById(Long id) {
        return resumeRepository.findById(id).orElseThrow(() -> new RuntimeException("No resume found!"));
    }

    public void deleteResume(Long id) throws IOException {
        Resume resume = getById(id);
        
        // Unlink this resume from all applications that reference it
        List<Application> linkedApps = applicationRepository.findByResumeId(id);
        for (Application app : linkedApps) {
            app.setResume(null);
            applicationRepository.save(app);
        }
        
        Path filePath = Paths.get(resume.getFilePath());
        Files.deleteIfExists(filePath);
        resumeRepository.deleteById(id);
    }
    public List<Resume> listAllResumesForDebug() {
        return resumeRepository.findAll();
    }
}
