package com.hufds.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebMvcConfig.class);

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();
        
        logger.info("Configuring static resource handler for uploads directory: {}", uploadAbsolutePath);
        
        // Ensure the directory exists
        if (!uploadPath.toFile().exists()) {
            logger.warn("Upload directory does not exist: {}", uploadAbsolutePath);
            uploadPath.toFile().mkdirs();
            logger.info("Created upload directory: {}", uploadAbsolutePath);
        }

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/")
                .setCachePeriod(3600) // Cache for 1 hour
                .resourceChain(true); // Enable resource chain for better performance
                
        logger.info("Static resource handler configured for /uploads/** -> {}", uploadAbsolutePath);
    }
} 