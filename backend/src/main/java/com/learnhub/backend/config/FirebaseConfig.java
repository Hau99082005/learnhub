package com.learnhub.backend.config;

import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;

@Configuration
@EnableConfigurationProperties(FirebaseProperties.class)
public class FirebaseConfig {

	private final FirebaseProperties firebaseProperties;

	public FirebaseConfig(FirebaseProperties firebaseProperties) {
		this.firebaseProperties = firebaseProperties;
	}

	@PostConstruct
	public void init() throws IOException {
		String credentialsPath = firebaseProperties.getCredentialsPath();
		if (credentialsPath == null || credentialsPath.isBlank() || !FirebaseApp.getApps().isEmpty()) {
			return;
		}
		Path path = Path.of(credentialsPath);
		if (!path.isAbsolute()) {
			path = Path.of(System.getProperty("user.dir")).resolve(path).normalize();
		}
		if (!Files.exists(path)) {
			return;
		}

		try (FileInputStream serviceAccount = new FileInputStream(path.toFile())) {
			FirebaseOptions.Builder builder = FirebaseOptions.builder()
					.setCredentials(GoogleCredentials.fromStream(serviceAccount));
			if (firebaseProperties.getProjectId() != null && !firebaseProperties.getProjectId().isBlank()) {
				builder.setProjectId(firebaseProperties.getProjectId());
			}
			FirebaseApp.initializeApp(builder.build());
		}
	}
}
