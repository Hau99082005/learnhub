package com.learnhub.backend.modules.user.dtos;

import java.util.List;

public class DashboardStatsDTO {
    private final List<DashboardCardDTO> cards;

    public DashboardStatsDTO(List<DashboardCardDTO> cards) {
        this.cards = cards;
    }

    public List<DashboardCardDTO> getCards() {
        return cards;
    }
}
