package com.learnhub.backend.modules.instructor.dtos;

public class PerformanceTrendDTO {
    private final String month;
    private final long students;
    private final long revenue;

    public PerformanceTrendDTO(String month, long students, long revenue) {
        this.month = month;
        this.students = students;
        this.revenue = revenue;
    }

    public String getMonth() {
        return month;
    }

    public long getStudents() {
        return students;
    }

    public long getRevenue() {
        return revenue;
    }
}
