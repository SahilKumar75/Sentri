package com.sentri.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class SentriBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SentriBackendApplication.class, args);
    }
}
