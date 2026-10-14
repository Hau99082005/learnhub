package com.learnhub.backend.modules.instructor.dtos;

import java.util.List;

public class InstructorToolsDTO {
    private final List<ToolCheckDTO> recording;
    private final List<CopyTemplateDTO> templates;
    private final List<PublishCourseDTO> courses;

    public InstructorToolsDTO(
            List<ToolCheckDTO> recording,
            List<CopyTemplateDTO> templates,
            List<PublishCourseDTO> courses) {
        this.recording = recording;
        this.templates = templates;
        this.courses = courses;
    }

    public List<ToolCheckDTO> getRecording() {
        return recording;
    }

    public List<CopyTemplateDTO> getTemplates() {
        return templates;
    }

    public List<PublishCourseDTO> getCourses() {
        return courses;
    }
}
