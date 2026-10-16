package com.learnhub.backend.modules.practice.dtos;

import java.util.List;

public class PracticeQuestionDTO {
    private final Long id;
    private final String question;
    private final List<PracticeOptionDTO> options;
    private final Long chosenOptionId;
    private final boolean right;

    public PracticeQuestionDTO(Long id, String question, List<PracticeOptionDTO> options) {
        this(id, question, options, null, false);
    }

    public PracticeQuestionDTO(
            Long id,
            String question,
            List<PracticeOptionDTO> options,
            Long chosenOptionId,
            boolean right) {
        this.id = id;
        this.question = question;
        this.options = options == null ? List.of() : options;
        this.chosenOptionId = chosenOptionId;
        this.right = right;
    }

    public Long getId() {
        return id;
    }

    public String getQuestion() {
        return question;
    }

    public List<PracticeOptionDTO> getOptions() {
        return options;
    }

    public Long getChosenOptionId() {
        return chosenOptionId;
    }

    public boolean isRight() {
        return right;
    }
}
