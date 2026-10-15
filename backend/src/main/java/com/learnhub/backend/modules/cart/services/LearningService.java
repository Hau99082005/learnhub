package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.learnhub.backend.modules.cart.dtos.CertificateDTO;
import com.learnhub.backend.modules.cart.dtos.CoursePlayerDTO;
import com.learnhub.backend.modules.cart.dtos.LearningItemDTO;
import com.learnhub.backend.modules.cart.dtos.LearningProgressRequest;
import com.learnhub.backend.modules.cart.models.Certificate;
import com.learnhub.backend.modules.cart.models.Enrollment;
import com.learnhub.backend.modules.cart.repositories.CertificateRepository;
import com.learnhub.backend.modules.cart.repositories.EnrollmentRepository;
import com.learnhub.backend.modules.cart.support.CertificateGrades;
import com.learnhub.backend.modules.category.models.Category;
import com.learnhub.backend.modules.course.services.CourseCurriculumService;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.notify.models.NotificationJob;
import com.learnhub.backend.modules.notify.services.NotificationQueue;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

@Service
public class LearningService {
    private final EnrollmentRepository enrollments;
    private final CertificateRepository certificates;
    private final CourseRepository courses;
    private final CourseCurriculumService curriculum;
    private final UserServicesInterfaces userServices;
    private final NotificationQueue notificationQueue;

    public LearningService(
            EnrollmentRepository enrollments,
            CertificateRepository certificates,
            CourseRepository courses,
            CourseCurriculumService curriculum,
            UserServicesInterfaces userServices,
            NotificationQueue notificationQueue) {
        this.enrollments = enrollments;
        this.certificates = certificates;
        this.courses = courses;
        this.curriculum = curriculum;
        this.userServices = userServices;
        this.notificationQueue = notificationQueue;
    }

    @Transactional
    public List<LearningItemDTO> listMine(String authorization) {
        return listMine(authorization, "");
    }

    @Transactional
    public List<LearningItemDTO> listMine(String authorization, String query) {
        user account = userServices.requireAccount(authorization);
        String term = query == null ? "" : query.trim();
        List<Enrollment> rows = term.isBlank()
                ? enrollments.findByUserIdOrderByEnrolledAtDesc(account.getId())
                : enrollments.searchByUserId(account.getId(), term);
        if (rows.isEmpty()) {
            return List.of();
        }
        List<Long> courseIds = rows.stream().map(Enrollment::getCourseId).toList();
        Map<Long, Course> byId = courses.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity(), (left, right) -> left));
        Map<Long, Certificate> certByEnrollment = certificates
                .findByEnrollmentIdIn(rows.stream().map(Enrollment::getId).toList())
                .stream()
                .collect(Collectors.toMap(Certificate::getEnrollmentId, Function.identity(), (left, right) -> left));
        List<LearningItemDTO> items = new ArrayList<>();
        for (Enrollment row : rows) {
            Course course = byId.get(row.getCourseId());
            if (course == null || course.getDeletedAt() != null) {
                continue;
            }
            Certificate cert = syncCertificate(row, course, account, certByEnrollment.get(row.getId()));
            if (cert != null) {
                certByEnrollment.put(row.getId(), cert);
            }
            items.add(toDto(row, course, certByEnrollment.get(row.getId())));
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
        Certificate cert = certificates.findByEnrollmentId(enrollment.getId()).orElse(null);
        return toPlayer(course, enrollment, cert);
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
        Certificate existing = certificates.findByEnrollmentId(enrollment.getId()).orElse(null);
        Certificate cert = syncCertificate(enrollment, course, account, existing);
        return toPlayer(course, enrollment, cert);
    }

    @Transactional
    public List<CertificateDTO> listCertificates(String authorization) {
        user account = userServices.requireAccount(authorization);
        List<Enrollment> rows = enrollments.findByUserIdOrderByEnrolledAtDesc(account.getId());
        if (rows.isEmpty()) {
            return List.of();
        }
        Map<Long, Course> byId = courses.findAllById(rows.stream().map(Enrollment::getCourseId).toList()).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity(), (left, right) -> left));
        Map<Long, Certificate> certByEnrollment = certificates
                .findByEnrollmentIdIn(rows.stream().map(Enrollment::getId).toList())
                .stream()
                .collect(Collectors.toMap(Certificate::getEnrollmentId, Function.identity(), (left, right) -> left));
        List<CertificateDTO> items = new ArrayList<>();
        for (Enrollment row : rows) {
            Course course = byId.get(row.getCourseId());
            if (course == null || course.getDeletedAt() != null) {
                continue;
            }
            Certificate cert = syncCertificate(row, course, account, certByEnrollment.get(row.getId()));
            if (cert == null) {
                continue;
            }
            items.add(toCertDto(cert, row, course));
        }
        return items;
    }

    @Transactional(readOnly = true)
    public CertificateDTO getCertificate(String code) {
        String value = code == null ? "" : code.trim();
        if (value.isBlank()) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy chứng chỉ");
        }
        Certificate cert = certificates.findByCertificateCode(value)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy chứng chỉ"));
        Enrollment enrollment = enrollments.findById(cert.getEnrollmentId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy chứng chỉ"));
        Course course = courses.findById(enrollment.getCourseId())
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "Không tìm thấy chứng chỉ"));
        return toCertDto(cert, enrollment, course);
    }

    private CoursePlayerDTO toPlayer(Course course, Enrollment enrollment, Certificate cert) {
        BigDecimal progress = enrollment.getProgressPercent() == null
                ? BigDecimal.ZERO
                : enrollment.getProgressPercent();
        String grade = CertificateGrades.of(progress);
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
                progress,
                true,
                cert == null ? null : cert.getCertificateCode(),
                grade,
                CertificateGrades.label(grade),
                curriculum.listPublic(course.getId()));
    }

    private LearningItemDTO toDto(Enrollment row, Course course, Certificate cert) {
        Category category = course.getCategory();
        BigDecimal progress = row.getProgressPercent() == null ? BigDecimal.ZERO : row.getProgressPercent();
        String grade = CertificateGrades.of(progress);
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
                true,
                cert == null ? null : cert.getCertificateCode(),
                grade,
                CertificateGrades.label(grade),
                row.getEnrolledAt(),
                row.getCompletedAt());
    }

    private CertificateDTO toCertDto(Certificate cert, Enrollment enrollment, Course course) {
        BigDecimal watch = cert.getWatchPercent() == null
                ? enrollment.getProgressPercent()
                : cert.getWatchPercent();
        if (watch == null) {
            watch = BigDecimal.ZERO;
        }
        String grade = cert.getGrade() == null ? CertificateGrades.of(watch) : cert.getGrade();
        return new CertificateDTO(
                cert.getId(),
                cert.getCertificateCode(),
                enrollment.getId(),
                course.getId(),
                course.getSlug(),
                filled(cert.getCourseTitle()) ? cert.getCourseTitle() : course.getTitle(),
                course.getImages(),
                cert.getLearnerName(),
                filled(cert.getInstructorName()) ? cert.getInstructorName() : instructorName(course),
                watch,
                grade,
                CertificateGrades.label(grade),
                cert.getIssuedAt(),
                enrollment.getEnrolledAt());
    }

    private Certificate syncCertificate(Enrollment enrollment, Course course, user account, Certificate existing) {
        BigDecimal percent = enrollment.getProgressPercent() == null
                ? BigDecimal.ZERO
                : enrollment.getProgressPercent();
        if (!CertificateGrades.passed(percent)) {
            return existing;
        }
        String grade = CertificateGrades.of(percent);
        String learner = displayName(account);
        String teacher = instructorName(course);
        if (existing == null) {
            Certificate created = new Certificate();
            created.setEnrollmentId(enrollment.getId());
            created.setCertificateCode(nextCode());
            created.setWatchPercent(percent);
            created.setGrade(grade);
            created.setLearnerName(learner);
            created.setCourseTitle(course.getTitle());
            created.setInstructorName(teacher);
            created.setIssuedAt(LocalDateTime.now());
            Certificate saved = certificates.save(created);
            notifyCertificate(account, course, saved, true);
            return saved;
        }
        String previousGrade = existing.getGrade();
        boolean richer = existing.getWatchPercent() == null
                || percent.compareTo(existing.getWatchPercent()) > 0;
        if (richer || !filled(existing.getLearnerName()) || !filled(existing.getCourseTitle())) {
            existing.setWatchPercent(percent);
            existing.setGrade(grade);
            if (filled(learner)) {
                existing.setLearnerName(learner);
            }
            existing.setCourseTitle(course.getTitle());
            existing.setInstructorName(teacher);
            Certificate saved = certificates.save(existing);
            if (filled(grade) && !grade.equals(previousGrade)) {
                notifyCertificate(account, course, saved, false);
            }
            return saved;
        }
        return existing;
    }

    private void notifyCertificate(user account, Course course, Certificate cert, boolean firstIssue) {
        if (account == null || cert == null) {
            return;
        }
        Long userId = account.getId();
        Long enrollmentId = cert.getEnrollmentId();
        String title = firstIssue ? "Bạn đã nhận chứng chỉ" : "Chứng chỉ được nâng hạng";
        String body = firstIssue
                ? "Khóa học \"" + course.getTitle() + "\" đã được cấp chứng chỉ xếp loại "
                    + CertificateGrades.label(cert.getGrade()) + ". Mã " + cert.getCertificateCode() + "."
                : "Chứng chỉ khóa học \"" + course.getTitle() + "\" đã lên hạng "
                    + CertificateGrades.label(cert.getGrade()) + ".";
        String type = firstIssue ? "CERTIFICATE" : "CERTIFICATE_GRADE";
        afterCommit(() -> notificationQueue.enqueue(new NotificationJob(
                userId,
                title,
                body,
                type,
                "CERTIFICATE",
                enrollmentId)));
    }

    private void afterCommit(Runnable action) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            action.run();
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }

    private String nextCode() {
        for (int index = 0; index < 12; index++) {
            String left = Long.toHexString(System.nanoTime() ^ ThreadLocalRandom.current().nextLong())
                    .toUpperCase();
            if (left.length() > 8) {
                left = left.substring(left.length() - 8);
            }
            String right = Integer.toHexString(ThreadLocalRandom.current().nextInt(0x10000))
                    .toUpperCase();
            while (right.length() < 4) {
                right = "0" + right;
            }
            String code = "LH-" + left + "-" + right;
            if (!certificates.existsByCertificateCode(code)) {
                return code;
            }
        }
        return "LH-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private String displayName(user account) {
        if (account == null) {
            return "Học viên LearnHub";
        }
        if (filled(account.getFullName())) {
            return account.getFullName().trim();
        }
        if (filled(account.getUsername())) {
            return account.getUsername().trim();
        }
        if (filled(account.getEmail())) {
            return account.getEmail().trim();
        }
        return "Học viên LearnHub";
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

    private boolean filled(String value) {
        return value != null && !value.isBlank();
    }
}
