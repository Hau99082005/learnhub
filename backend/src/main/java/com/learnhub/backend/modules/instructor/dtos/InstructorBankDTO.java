package com.learnhub.backend.modules.instructor.dtos;

public class InstructorBankDTO {
    private final Long id;
    private final String bankCode;
    private final String bankName;
    private final String accountNumber;
    private final String accountName;
    private final String qrUrl;
    private final boolean sepayLinked;

    public InstructorBankDTO(
            Long id,
            String bankCode,
            String bankName,
            String accountNumber,
            String accountName,
            String qrUrl,
            boolean sepayLinked) {
        this.id = id;
        this.bankCode = bankCode;
        this.bankName = bankName;
        this.accountNumber = accountNumber;
        this.accountName = accountName;
        this.qrUrl = qrUrl;
        this.sepayLinked = sepayLinked;
    }

    public Long getId() {
        return id;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getBankName() {
        return bankName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }

    public String getQrUrl() {
        return qrUrl;
    }

    public boolean isSepayLinked() {
        return sepayLinked;
    }
}
