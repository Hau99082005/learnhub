package com.learnhub.backend.modules.user.dtos;

public class DashboardTrendDTO {
    private final String month;
    private final long users;
    private final long orders;
    private final long courses;
    private final long payments;

    public DashboardTrendDTO(String month, long users, long orders, long courses, long payments) {
        this.month = month;
        this.users = users;
        this.orders = orders;
        this.courses = courses;
        this.payments = payments;
    }

    public String getMonth() {
        return month;
    }

    public long getUsers() {
        return users;
    }

    public long getOrders() {
        return orders;
    }

    public long getCourses() {
        return courses;
    }

    public long getPayments() {
        return payments;
    }
}
