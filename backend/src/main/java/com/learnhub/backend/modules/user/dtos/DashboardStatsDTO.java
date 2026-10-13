package com.learnhub.backend.modules.user.dtos;

import java.util.List;

public class DashboardStatsDTO {
    private final List<DashboardCardDTO> cards;
    private final List<DashboardTrendDTO> trend;
    private final String from;
    private final String to;

    public DashboardStatsDTO(
            List<DashboardCardDTO> cards,
            List<DashboardTrendDTO> trend,
            String from,
            String to) {
        this.cards = cards;
        this.trend = trend;
        this.from = from;
        this.to = to;
    }

    public List<DashboardCardDTO> getCards() {
        return cards;
    }

    public List<DashboardTrendDTO> getTrend() {
        return trend;
    }

    public String getFrom() {
        return from;
    }

    public String getTo() {
        return to;
    }
}
