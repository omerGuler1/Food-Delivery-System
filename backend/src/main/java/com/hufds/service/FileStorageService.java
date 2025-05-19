package com.hufds.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Service for handling file storage operations.
 */
public interface FileStorageService {
    /**
     * Stores a file in the specified directory.
     *
     * @param file The file to store
     * @param directory The directory to store the file in (e.g., "restaurant-profiles", "menu-items")
     * @return The URL/path of the stored file
     * @throws RuntimeException if file storage fails
     */
    String storeFile(MultipartFile file, String directory);

    /**
     * Deletes a file from storage.
     *
     * @param fileUrl The URL/path of the file to delete
     * @throws RuntimeException if file deletion fails
     */
    void deleteFile(String fileUrl);

    /**
     * Retrieves a file from storage.
     *
     * @param fileUrl The URL/path of the file to retrieve
     * @return The file as a byte array
     * @throws RuntimeException if file retrieval fails
     */
    byte[] getFile(String fileUrl);
} 