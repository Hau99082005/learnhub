package com.learnhub.backend.modules.practice.dtos;

public class PracticeOptionDTO {
    private final Long id;
    private final String text;
    private final Boolean correct;

    public PracticeOptionDTO(Long id, String text) {
        this(id, text, null);
    }

    public PracticeOptionDTO(Long id, String text, Boolean correct) {
        this.id = id;
        this.text = text;
        this.correct = correct;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public Boolean getCorrect() {
        return correct;
    }
}
