package com.learnhub.backend.modules.cart.dtos;

public class BankTransferDTO {
    private final String bankCode;
    private final String bankName;
    private final String accountName;
    private final String accountNumber;
    private final String transferContent;
    private final String qrUrl;
    private final String syncMessage;

    public BankTransferDTO(
            String bankName,
            String accountName,
            String accountNumber,
            String transferContent) {
        this(bankName, bankName, accountName, accountNumber, transferContent, "", "");
    }

    public BankTransferDTO(
            String bankName,
            String accountName,
            String accountNumber,
            String transferContent,
            String qrUrl) {
        this(bankName, bankName, accountName, accountNumber, transferContent, qrUrl, "");
    }

    public BankTransferDTO(
            String bankName,
            String accountName,
            String accountNumber,
            String transferContent,
            String qrUrl,
            String syncMessage) {
        this(bankName, bankName, accountName, accountNumber, transferContent, qrUrl, syncMessage);
    }

    public BankTransferDTO(
            String bankCode,
            String bankName,
            String accountName,
            String accountNumber,
            String transferContent,
            String qrUrl,
            String syncMessage) {
        this.bankCode = bankCode;
        this.bankName = bankName;
        this.accountName = accountName;
        this.accountNumber = accountNumber;
        this.transferContent = transferContent;
        this.qrUrl = qrUrl;
        this.syncMessage = syncMessage;
    }

    public String getBankCode() {
        return bankCode;
    }

    public String getBankName() {
        return bankName;
    }

    public String getAccountName() {
        return accountName;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getTransferContent() {
        return transferContent;
    }

    public String getQrUrl() {
        return qrUrl;
    }

    public String getSyncMessage() {
        return syncMessage;
    }
}
