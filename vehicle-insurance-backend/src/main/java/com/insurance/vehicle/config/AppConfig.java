package com.insurance.vehicle.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Serves locally-stored uploads (claim photos/documents - see
 * LocalFileStorageService) back out over HTTP so the frontend can actually
 * display/download them. A request to "/api/uploads/claims/xyz.jpg" is
 * served straight from disk at "{app.upload.dir}/claims/xyz.jpg".
 */
@Configuration
public class AppConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // "file:" + trailing slash tells Spring this is a filesystem path, not classpath
        String location = "file:" + uploadDir + (uploadDir.endsWith("/") ? "" : "/");
        registry.addResourceHandler("/uploads/**").addResourceLocations(location);
    }
}
