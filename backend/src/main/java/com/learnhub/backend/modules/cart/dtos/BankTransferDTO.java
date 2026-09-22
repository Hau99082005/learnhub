package com.learnhub.backend.modules.cart.dtos;

public class BankTransferDTO {
    private final String bankName;
    private final String accountName;
    private final String accountNumber;
    private final String transferContent;

    public BankTransferDTO(String bankName, String accountName, String accountNumber, String transferContent) {
        this.bankName = bankName;
        this.accountName = accountName;
        this.accountNumber = accountNumber;
        this.transferContent = transferContent;
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
}
