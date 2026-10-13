package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.cart.dtos.CoursePlayerDTO;
import com.learnhub.backend.modules.cart.dtos.LearningItemDTO;
import com.learnhub.backend.modules.cart.dtos.LearningProgressRequest;
import com.learnhub.backend.modules.cart.models.Enrollment;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.category.models.Category;
import com.learnhub.backend.modules.course.services.CourseCurriculumService;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class LearningService {
    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;
    private final CourseCurriculumService curriculum;
    private final UserServicesInterfaces userServices;

    public LearningService(
            EnrollmentRepository enrollments,
            CourseRepository courses,
            CourseCurriculumService curriculum,
            UserServicesInterfaces userServices) {
        this.enrollments = enrollments;
        this.courses = courses;
        this.curriculum = curriculum;
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

    @Transactional(readOnly = true)
    public CoursePlayerDTO player(String authorization, String slug) {
        user account = userServices.requireAccount(authorization);
        Course course = courses.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        Enrollment enrollment = enrollments.findByUserIdAndCourseId(account.getId(), course.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.FORBIDDEN, "Bạn chưa sở hữu khóa học này"));
        return new CoursePlayerDTO(
                course.getId(),
                enrollment.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getSubtitle(),
                course.getDescription(),
                course.getImages(),
                instructorName(course),
                course.getDurationSeconds(),
                enrollment.getProgressPercent() == null ? BigDecimal.ZERO : enrollment.getProgressPercent(),
                curriculum.listPublic(course.getId()));
    }

    @Transactional
    public CoursePlayerDTO saveProgress(String authorization, String slug, LearningProgressRequest request) {
        user account = userServices.requireAccount(authorization);
        Course course = courses.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy khóa học"));
        Enrollment enrollment = enrollments.findByUserIdAndCourseId(account.getId(), course.getId())
                .orElseThrow(() -> new AuthException(HttpStatus.FORBIDDEN, "Bạn chưa sở hữu khóa học này"));
        BigDecimal percent = request == null || request.getPercent() == null
                ? enrollment.getProgressPercent()
                : request.getPercent();
        if (percent == null) {
            percent = BigDecimal.ZERO;
        }
        if (percent.compareTo(BigDecimal.ZERO) < 0) {
            percent = BigDecimal.ZERO;
        }
        if (percent.compareTo(BigDecimal.valueOf(100)) > 0) {
            percent = BigDecimal.valueOf(100);
        }
        enrollment.setProgressPercent(percent.setScale(2, RoundingMode.HALF_UP));
        if (percent.compareTo(BigDecimal.valueOf(100)) >= 0) {
            enrollment.setStatus("COMPLETED");
            if (enrollment.getCompletedAt() == null) {
                enrollment.setCompletedAt(LocalDateTime.now());
            }
        } else if (!"REVOKED".equalsIgnoreCase(enrollment.getStatus())
                && !"EXPIRED".equalsIgnoreCase(enrollment.getStatus())) {
            enrollment.setStatus("ACTIVE");
        }
        enrollments.save(enrollment);
        return player(authorization, slug);
    }

    private LearningItemDTO toDto(Enrollment row, Course course) {
        Category category = course.getCategory();
        BigDecimal progress = row.getProgressPercent() == null ? BigDecimal.ZERO : row.getProgressPercent();
        return new LearningItemDTO(
                row.getId(),
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getImages(),
                instructorName(course),
                course.getInstructor() == null ? null : course.getInstructor().getId(),
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

    private String instructorName(Course course) {
        user instructor = course.getInstructor();
        if (instructor == null) {
            return "Giảng viên LearnHub";
        }
        String name = instructor.getFullName();
        if (name != null && !name.isBlank()) {
            return name;
        }
        if (instructor.getEmail() != null && !instructor.getEmail().isBlank()) {
            return instructor.getEmail();
        }
        return "Giảng viên LearnHub";
    }
}
