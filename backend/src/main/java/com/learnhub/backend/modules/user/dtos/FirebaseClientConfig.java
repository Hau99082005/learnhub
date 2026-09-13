package com.learnhub.backend.modules.user.dtos;

public class FirebaseClientConfig {
    private final String apiKey;
    private final String authDomain;
    private final String projectId;
    private final String storageBucket;
    private final String messagingSenderId;
    private final String appId;
    private final String measurementId;

    public FirebaseClientConfig(
            String apiKey,
            String authDomain,
            String projectId,
            String storageBucket,
            String messagingSenderId,
            String appId,
            String measurementId) {
        this.apiKey = apiKey;
        this.authDomain = authDomain;
        this.projectId = projectId;
        this.storageBucket = storageBucket;
        this.messagingSenderId = messagingSenderId;
        this.appId = appId;
        this.measurementId = measurementId;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getAuthDomain() {
        return authDomain;
    }

    public String getProjectId() {
        return projectId;
    }

    public String getStorageBucket() {
        return storageBucket;
    }

    public String getMessagingSenderId() {
        return messagingSenderId;
    }

    public String getAppId() {
        return appId;
    }

    public String getMeasurementId() {
        return measurementId;
    }
}
