package com.insurance.vehicle.modules.ai.service;

import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.FileStorageException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class DocumentTextExtractor {

    @Value("${app.upload.dir}")
    private String uploadDir;

    /**
     * Extracts machine-readable text from local uploaded files (PDFs or plain text).
     * @param documentUrl Relative path stored in database (e.g. "/uploads/policies/.../doc.pdf")
     * @return Extracted plain text content
     */
    public String extractText(String documentUrl) {
        if (documentUrl == null || documentUrl.isBlank()) {
            throw new BadRequestException("Document URL is required for AI extraction");
        }

        // Strip leading "/uploads/" if present to resolve against uploadDir
        String relativePath = documentUrl;
        if (relativePath.startsWith("/uploads/")) {
            relativePath = relativePath.substring("/uploads/".length());
        } else if (relativePath.startsWith("/")) {
            relativePath = relativePath.substring(1);
        }

        Path filePath = Path.of(uploadDir, relativePath);
        File file = filePath.toFile();

        if (!file.exists() || !file.isFile()) {
            throw new BadRequestException("Policy document file not found on disk at: " + relativePath);
        }

        String fileName = file.getName().toLowerCase();
        if (fileName.endsWith(".pdf")) {
            return extractTextFromPdf(file);
        } else if (fileName.endsWith(".txt") || fileName.endsWith(".json") || fileName.endsWith(".csv")) {
            return extractTextFromPlainFile(file);
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".webp")) {
            // For image uploads, return placeholder indicating visual image
            return "Policy Document Image: " + file.getName();
        } else {
            throw new BadRequestException("Unsupported document type for AI extraction: " + fileName);
        }
    }

    private String extractTextFromPdf(File file) {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            if (text == null || text.trim().isEmpty()) {
                return "PDF document contains no machine-readable text (scanned image).";
            }
            return text.trim();
        } catch (IOException e) {
            throw new FileStorageException("Failed to extract text from PDF document", e);
        }
    }

    private String extractTextFromPlainFile(File file) {
        try {
            return Files.readString(file.toPath(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new FileStorageException("Failed to read text document", e);
        }
    }

    /**
     * Extracts text directly from an unpersisted MultipartFile (for AI pre-fill preview).
     */
    public String extractTextFromMultipartFile(org.springframework.web.multipart.MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided");
        }
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        if (fileName.endsWith(".pdf")) {
            try (PDDocument document = Loader.loadPDF(file.getBytes())) {
                PDFTextStripper stripper = new PDFTextStripper();
                String text = stripper.getText(document);
                if (text == null || text.trim().isEmpty()) {
                    return "PDF document contains no machine-readable text.";
                }
                return text.trim();
            } catch (IOException e) {
                throw new FileStorageException("Failed to extract text from uploaded PDF", e);
            }
        } else {
            try {
                return new String(file.getBytes(), StandardCharsets.UTF_8);
            } catch (IOException e) {
                return "Policy Document Image: " + file.getOriginalFilename();
            }
        }
    }
}
