package com.learnhub.backend.modules.user.dtos;

import java.util.List;

public class DashboardCardDTO {
    private final String key;
    private final String label;
    private final long value;
    private final String change;
    private final boolean up;
    private final List<Long> series;

    public DashboardCardDTO(String key, String label, long value, String change, boolean up, List<Long> series) {
        this.key = key;
        this.label = label;
        this.value = value;
        this.change = change;
        this.up = up;
        this.series = series;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public long getValue() {
        return value;
    }

    public String getChange() {
        return change;
    }

    public boolean isUp() {
        return up;
    }

    public List<Long> getSeries() {
        return series;
    }
}
