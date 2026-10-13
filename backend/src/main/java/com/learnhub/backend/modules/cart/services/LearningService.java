package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.dtos.LearningItemDTO;
import com.learnhub.backend.modules.cart.models.Enrollment;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.category.models.Category;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class LearningService {
    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;
    private final UserServicesInterfaces userServices;

    public LearningService(
            EnrollmentRepository enrollments,
            CourseRepository courses,
            UserServicesInterfaces userServices) {
        this.enrollments = enrollments;
        this.courses = courses;
        this.userServices = userServices;
    }

    @Transactional(readOnly = true)
    public List<LearningItemDTO> listMine(String authorization) {
        user account = userServices.requireAccount(authorization);
        List<Enrollment> rows = enrollments.findByUserIdOrderByEnrolledAtDesc(account.getId());
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> courseIds = rows.stream().map(Enrollment::getCourseId).toList();
        Map<Long, Course> byId = courses.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity(), (left, right) -> left));
        List<LearningItemDTO> items = new ArrayList<>();
        for (Enrollment row : rows) {
            Course course = byId.get(row.getCourseId());
            if (course == null || course.getDeletedAt() != null) {
                continue;
            }
            items.add(toDto(row, course));
        }
        return items;
    }

    private LearningItemDTO toDto(Enrollment row, Course course) {
        user instructor = course.getInstructor();
        Category category = course.getCategory();
        String instructorName = "Giảng viên LearnHub";
        if (instructor != null) {
            String name = instructor.getFullName();
            if (name != null && !name.isBlank()) {
                instructorName = name;
            } else if (instructor.getEmail() != null && !instructor.getEmail().isBlank()) {
                instructorName = instructor.getEmail();
            }
        }
        BigDecimal progress = row.getProgressPercent() == null ? BigDecimal.ZERO : row.getProgressPercent();
        return new LearningItemDTO(
                row.getId(),
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getImages(),
                instructorName,
                instructor == null ? null : instructor.getId(),
                category == null ? null : category.getId(),
                category == null ? "" : category.getName(),
                course.getDurationSeconds(),
                course.getLevel(),
                progress,
                row.getStatus(),
                row.getSource(),
                Boolean.TRUE.equals(course.getIssuesCertificate()),
                row.getEnrolledAt(),
                row.getCompletedAt());
    }
}
