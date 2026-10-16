package com.learnhub.backend.modules.ai.dtos;

import java.util.List;

public class AiChatReplyDTO {
    private final String reply;
    private final List<AiCourseCardDTO> courses;

    public AiChatReplyDTO(String reply, List<AiCourseCardDTO> courses) {
        this.reply = reply;
        this.courses = courses == null ? List.of() : courses;
    }

    public String getReply() {
        return reply;
    }

    public List<AiCourseCardDTO> getCourses() {
        return courses;
    }
}
