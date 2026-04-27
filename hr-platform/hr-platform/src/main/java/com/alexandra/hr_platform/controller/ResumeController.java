package com.alexandra.hr_platform.controller;
 
import com.alexandra.hr_platform.model.entity.Resume;
import com.alexandra.hr_platform.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
 
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
 
@RestController
@RequestMapping("/api/resumes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ResumeController {
    private final ResumeService resumeService;
 
    @PostMapping("/upload/{candidateId}")
    public ResponseEntity<Resume> upload(@PathVariable Long candidateId, @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(resumeService.uploadResume(candidateId, file));
    }
 
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<List<Resume>> getByCandidate(@PathVariable Long candidateId) {
        return ResponseEntity.ok(resumeService.getByCandidate(candidateId));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id){
        Resume resume = resumeService.getById(id);
        try {
            String dbPath = resume.getFilePath();
            String fileName = Paths.get(dbPath).getFileName().toString();
            Resource resource = null;
            
            // Strategy 1: Try the exact path from DB
            Path filePath = Paths.get(dbPath).toAbsolutePath().normalize();
            resource = new UrlResource(filePath.toUri());
            
            // Strategy 2: Try ../uploads/resumes/filename (relative to app working dir)
            if (!resource.exists() || !resource.isReadable()) {
                Path fallback1 = Paths.get("..", "uploads", "resumes", fileName).toAbsolutePath().normalize();
                resource = new UrlResource(fallback1.toUri());
                System.out.println("Download: Trying fallback ../uploads/resumes/ -> " + fallback1);
            }
            
            // Strategy 3: Try uploads/resumes/filename (inside app dir)
            if (!resource.exists() || !resource.isReadable()) {
                Path fallback2 = Paths.get("uploads", "resumes", fileName).toAbsolutePath().normalize();
                resource = new UrlResource(fallback2.toUri());
                System.out.println("Download: Trying fallback uploads/resumes/ -> " + fallback2);
            }

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/octet-stream";
                if (resume.getFileFormat() != null) {
                    contentType = resume.getFileFormat().equalsIgnoreCase("pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                        .body(resource);
            } else {
                System.err.println("CRITICAL: File not found. DB path: " + dbPath + ", Filename: " + fileName);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error during file download: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
 
    @GetMapping("/debug/all")
    public ResponseEntity<List<Resume>> debugAll() {
        return ResponseEntity.ok(resumeService.listAllResumesForDebug());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        resumeService.deleteResume(id);
        return ResponseEntity.noContent().build();
    }
}
