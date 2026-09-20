package com.meeting.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String[] allowedOrigins;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:[*]",
                        "http://127.0.0.1:[*]",
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://*.vercel.app",
                        "https://*.netlify.app",
                        "https://*.onrender.com"
                )
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Authorization", "Content-Type", "X-Request-ID", "Accept", "Origin", "X-Requested-With")
                .exposedHeaders("Location", "X-Request-ID", "Authorization")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
