package com.learnhub.backend.modules.instructor.dtos;

import java.util.List;

public class InstructorResourcesDTO {
    private final List<ResourceItemDTO> guides;
    private final List<ResourceItemDTO> standards;
    private final List<ResourceCourseDTO> courses;
    private final List<SupportTicketDTO> tickets;

    public InstructorResourcesDTO(
            List<ResourceItemDTO> guides,
            List<ResourceItemDTO> standards,
            List<ResourceCourseDTO> courses,
            List<SupportTicketDTO> tickets) {
        this.guides = guides;
        this.standards = standards;
        this.courses = courses;
        this.tickets = tickets;
    }

    public List<ResourceItemDTO> getGuides() {
        return guides;
    }

    public List<ResourceItemDTO> getStandards() {
        return standards;
    }

    public List<ResourceCourseDTO> getCourses() {
        return courses;
    }

    public List<SupportTicketDTO> getTickets() {
        return tickets;
    }
}
