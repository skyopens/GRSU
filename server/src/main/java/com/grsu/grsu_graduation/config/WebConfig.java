package com.grsu.grsu_graduation.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS for the demo backend, configured in one place instead of annotating every controller.
 * Paths are listed explicitly rather than using /apis/**, so a future endpoint is not opened by accident.
 * Comment out a line to close that path; the whole class can be removed once the demo is over.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/apis/store/**").allowedOrigins("*");
        registry.addMapping("/apis/clips").allowedOrigins("*");
        registry.addMapping("/apis/todos/**").allowedOrigins("*");
    }
}
