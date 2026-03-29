package com.sentri.backend;

import com.sentri.backend.config.TimetableUploadProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
@EnableConfigurationProperties(TimetableUploadProperties.class)
public class SentriBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SentriBackendApplication.class, args);
    }
}
