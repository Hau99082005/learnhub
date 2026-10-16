package com.learnhub.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "gemini")
public class GeminiProperties {
    private String apiKey = "";
    private String model = "gemini-2.5-flash";
    private String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey == null ? "" : apiKey.trim();
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model == null || model.isBlank() ? "gemini-2.5-flash" : model.trim();
    }

    public String getApiUrl() {
        return apiUrl;
    }

    public void setApiUrl(String apiUrl) {
        this.apiUrl = apiUrl == null || apiUrl.isBlank()
                ? "https://generativelanguage.googleapis.com/v1beta/models"
                : apiUrl.trim().replaceAll("/+$", "");
    }
}
