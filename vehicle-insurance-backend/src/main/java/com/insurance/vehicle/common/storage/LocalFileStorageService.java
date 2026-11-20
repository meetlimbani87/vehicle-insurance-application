package com.insurance.vehicle.common.storage;

import com.insurance.vehicle.common.exception.BadRequestException;
import com.insurance.vehicle.common.exception.FileStorageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Real (local-disk) file storage - chosen over Cloudinary for now since no
 * Cloudinary account/API keys exist yet. Files are saved under
 * {app.upload.dir}/{subDir}/ and served back out via the static resource
 * handler registered in AppConfig, so the returned path is directly usable
 * as an <img src> / download link once the frontend origin is prepended.
 *
 * Enforces its own size/type limits server-side rather than trusting the
 * frontend's <input accept="..."> - that's just a browser hint the person
 * can trivially bypass (drag-and-drop, editing the DOM, curl, etc.), not an
 * actual security boundary. spring.servlet.multipart.max-file-size in
 * application.yml is a second, outer line of defense at the HTTP layer;
 * this check exists independently in case that config ever changes.
 */
@Service
public class LocalFileStorageService {

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5MB per file

    // Extensions allowed across all current upload use cases (claim photos,
    // claim/policy supporting documents). Deliberately a single shared
    // whitelist rather than a stricter "images only" one for photos - keeps
    // this one service simple; split it per-caller later if a use case
    // needs tighter rules than this.
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".pdf");
    private static final int MAX_FILES_PER_UPLOAD = 5;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // Saves one uploaded file under a subfolder (e.g. "claims/{claimId}/photos")
    // and returns the URL path it can be fetched back from. Renames the file to
    // a random UUID + its original extension to avoid collisions and to strip
    // anything unsafe out of a user-supplied filename.
    public String store(MultipartFile file, String subDir) {
        validate(file);

        try {
            Path targetDir = Path.of(uploadDir, subDir);
            Files.createDirectories(targetDir);

            String extension = extractExtension(file.getOriginalFilename());
            String storedName = UUID.randomUUID() + extension;
            Path targetFile = targetDir.resolve(storedName);

            file.transferTo(targetFile);

            // Served by the "/uploads/**" resource handler in AppConfig
            return "/uploads/" + subDir + "/" + storedName;
        } catch (IOException e) {
            throw new FileStorageException("Failed to store uploaded file", e);
        }
    }

    // Rejects an entire batch upfront if it has too many files - cheaper and
    // clearer for the caller than failing partway through storing them one by one
    public void validateBatchSize(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            throw new BadRequestException("No files were provided");
        }
        if (files.size() > MAX_FILES_PER_UPLOAD) {
            throw new BadRequestException("You can upload at most " + MAX_FILES_PER_UPLOAD + " files at a time");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was provided");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("\"" + file.getOriginalFilename() + "\" is too large. Maximum allowed size is 5MB per file.");
        }
        String extension = extractExtension(file.getOriginalFilename()).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("\"" + file.getOriginalFilename() + "\" is not an allowed file type. Allowed: JPG, PNG, WEBP, PDF.");
        }
    }

    // ".jpg" from "photo.jpg", or "" if there's no extension to preserve
    private String extractExtension(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dotIndex = originalFilename.lastIndexOf('.');
        return dotIndex >= 0 ? originalFilename.substring(dotIndex) : "";
    }
}
