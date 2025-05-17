package com.hufds.service.impl;

import com.hufds.exception.CustomException;
import com.hufds.service.FileStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${file.base-url}")
    private String baseUrl;

    @Override
    public String storeFile(MultipartFile file, String directory) {
        try {
            // Create directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir, directory).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;

            // Copy file to target location
            Path targetLocation = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return the URL to access the file
            return baseUrl + "/" + directory + "/" + filename;
        } catch (IOException ex) {
            throw new CustomException("Could not store file. Please try again!", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        try {
            if (fileUrl == null || !fileUrl.startsWith(baseUrl)) {
                return;
            }

            String relativePath = fileUrl.substring(baseUrl.length());
            Path filePath = Paths.get(uploadDir, relativePath).toAbsolutePath().normalize();
            
            // Verify the file is within the upload directory
            Path uploadDirPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            if (!filePath.startsWith(uploadDirPath)) {
                throw new CustomException("Invalid file path", HttpStatus.BAD_REQUEST);
            }

            Files.deleteIfExists(filePath);
        } catch (IOException ex) {
            throw new CustomException("Could not delete file. Please try again!", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 