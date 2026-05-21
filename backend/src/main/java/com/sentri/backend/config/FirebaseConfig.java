package com.sentri.backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // We expect the user to place the firebase service account key in src/main/resources
            ClassPathResource resource = new ClassPathResource("firebase-service-account.json");
            
            // In a real scenario, you might want to check if the file exists or read from an ENV variable
            if (resource.exists()) {
                InputStream serviceAccount = resource.getInputStream();

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                if (FirebaseApp.getApps().isEmpty()) {
                    FirebaseApp.initializeApp(options);
                    System.out.println("Firebase Application has been initialized");
                }
            } else {
                System.err.println("Firebase Service Account file 'firebase-service-account.json' not found in resources. Firebase Admin won't be initialized.");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
