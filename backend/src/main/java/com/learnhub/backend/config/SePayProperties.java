package com.learnhub.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "sepay")
public class SePayProperties {
    private String apiToken = "";
    private String webhookApiKey = "";
    private String bank = "MBBank";
    private String accountNumber = "";
    private String accountName = "";
    private String qrUrl = "https://qr.sepay.vn/img";
    private String apiBaseUrl = "https://userapi.sepay.vn/v2";
    private String sandboxBaseUrl = "https://userapi-sandbox.sepay.vn/v2";

    public String getApiToken() {
        return apiToken;
    }

    public void setApiToken(String apiToken) {
        this.apiToken = apiToken == null ? "" : apiToken;
    }

    public String getWebhookApiKey() {
        return webhookApiKey;
    }

    public void setWebhookApiKey(String webhookApiKey) {
        this.webhookApiKey = webhookApiKey == null ? "" : webhookApiKey;
    }

    public String getBank() {
        return bank;
    }

    public void setBank(String bank) {
        this.bank = bank == null ? "" : bank;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber == null ? "" : accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName == null ? "" : accountName;
    }

    public String getQrUrl() {
        return qrUrl;
    }

    public void setQrUrl(String qrUrl) {
        this.qrUrl = qrUrl == null || qrUrl.isBlank() ? "https://qr.sepay.vn/img" : qrUrl;
    }

    public String getApiBaseUrl() {
        return apiBaseUrl;
    }

    public void setApiBaseUrl(String apiBaseUrl) {
        this.apiBaseUrl = apiBaseUrl == null || apiBaseUrl.isBlank()
                ? "https://userapi.sepay.vn/v2"
                : apiBaseUrl;
    }

    public String getSandboxBaseUrl() {
        return sandboxBaseUrl;
    }

    public void setSandboxBaseUrl(String sandboxBaseUrl) {
        this.sandboxBaseUrl = sandboxBaseUrl == null || sandboxBaseUrl.isBlank()
                ? "https://userapi-sandbox.sepay.vn/v2"
                : sandboxBaseUrl;
    }
}
