package com.learnhub.backend.modules.practice.dtos;

import java.util.ArrayList;
import java.util.List;

public class PracticeSubmitRequest {
    private List<PracticeAnswerRequest> answers = new ArrayList<>();

    public List<PracticeAnswerRequest> getAnswers() {
        return answers;
    }

    public void setAnswers(List<PracticeAnswerRequest> answers) {
        this.answers = answers == null ? new ArrayList<>() : answers;
    }
}
