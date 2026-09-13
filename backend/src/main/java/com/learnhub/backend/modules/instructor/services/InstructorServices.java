package com.learnhub.backend.modules.instructor.services;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.learnhub.backend.modules.instructor.dtos.CourseDTO;
import com.learnhub.backend.modules.instructor.dtos.CourseRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorOnboardingDTO;
import com.learnhub.backend.modules.instructor.dtos.InstructorOnboardingRequest;
import com.learnhub.backend.modules.instructor.dtos.InstructorStudioDTO;
import com.learnhub.backend.modules.instructor.models.Course;
import com.learnhub.backend.modules.instructor.models.InstructorOnboarding;
import com.learnhub.backend.modules.instructor.repositories.CourseRepository;
import com.learnhub.backend.modules.instructor.repositories.InstructorOnboardingRepository;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.UserRole;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.models.userCatalogue;
import com.learnhub.backend.modules.user.repositories.userCatalogueRepository;
import com.learnhub.backend.modules.user.repositories.userRepository;
import com.learnhub.backend.modules.user.services.AuthSessionService;

@Service
public class InstructorServices {
    private static final Set<String> TEACHING = Set.of(
            "truc-tiep-chua-chinh-thuc",
            "truc-tiep-chuyen-mon",
            "truc-tuyen",
            "chua-tung-day");
    private static final Set<String> RECORDING = Set.of(
            "moi-bat-dau",
            "quay-duoc-vai-clip",
            "da-quay-nhieu",
            "da-dang-video");
    private static final Set<String> AUDIENCE = Set.of("chua-co", "nhom-nho", "cong-dong-lon");

    private final AuthSessionService sessions;
    private final userRepository users;
    private final userCatalogueRepository catalogues;
    private final InstructorOnboardingRepository onboardings;
    private final CourseRepository courses;

    public InstructorServices(
            AuthSessionService sessions,
            userRepository users,
            userCatalogueRepository catalogues,
            InstructorOnboardingRepository onboardings,
            CourseRepository courses) {
        this.sessions = sessions;
        this.users = users;
        this.catalogues = catalogues;
        this.onboardings = onboardings;
        this.courses = courses;
    }

    @Transactional
    public InstructorOnboardingDTO saveOnboarding(String authorization, InstructorOnboardingRequest request) {
        user account = requireAccount(authorization);
        InstructorOnboardingDTO saved = upsertForAccount(account, request);
        promoteInstructor(account);
        return saved;
    }

    @Transactional
    public InstructorOnboardingDTO upsertForAccount(user account, InstructorOnboardingRequest request) {
        if (account == null || account.getId() == null) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Không thể lưu thông tin giảng viên");
        }
        String teaching = normalize(request == null ? null : request.getTeachingFormat());
        String recording = normalize(request == null ? null : request.getRecordingExperience());
        String audience = normalize(request == null ? null : request.getAudienceSize());
        if (!TEACHING.contains(teaching)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn hình thức giảng dạy", "teachingFormat");
        }
        if (!RECORDING.contains(recording)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn mức độ ghi hình", "recordingExperience");
        }
        if (!AUDIENCE.contains(audience)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng chọn phạm vi tiếp cận", "audienceSize");
        }

        InstructorOnboarding row = onboardings.findByUserId(account.getId()).orElseGet(InstructorOnboarding::new);
        row.setUser(account);
        row.setTeachingFormat(teaching);
        row.setRecordingExperience(recording);
        row.setAudienceSize(audience);
        onboardings.save(row);
        return toOnboardingDto(row);
    }

    @Transactional
    public InstructorOnboardingDTO upsertIfPresent(user account, InstructorOnboardingRequest request) {
        if (request == null) {
            return null;
        }
        String teaching = normalize(request.getTeachingFormat());
        String recording = normalize(request.getRecordingExperience());
        String audience = normalize(request.getAudienceSize());
        if (teaching.isBlank() && recording.isBlank() && audience.isBlank()) {
            return null;
        }
        InstructorOnboardingDTO saved = upsertForAccount(account, request);
        promoteInstructor(account);
        return saved;
    }

    @Transactional(readOnly = true)
    public InstructorStudioDTO studio(String authorization) {
        user account = requireInstructor(authorization);
        InstructorOnboardingDTO onboarding = onboardings.findByUserId(account.getId())
                .map(this::toOnboardingDto)
                .orElse(null);
        List<CourseDTO> list = courses.findByInstructorIdOrderByCreatedAtDesc(account.getId())
                .stream()
                .map(this::toCourseDto)
                .toList();
        return new InstructorStudioDTO(toUserDto(account), onboarding, list);
    }

    @Transactional
    public CourseDTO createCourse(String authorization, CourseRequest request) {
        user account = requireInstructor(authorization);
        String title = request == null || request.getTitle() == null ? "" : request.getTitle().trim();
        if (title.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập tên khóa học", "title");
        }
        if (title.length() > 255) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Tên khóa học quá dài", "title");
        }
        Course course = new Course();
        course.setInstructor(account);
        course.setTitle(title);
        course.setStatus("DRAFT");
        courses.save(course);
        return toCourseDto(course);
    }

    private user requireInstructor(String authorization) {
        user account = requireAccount(authorization);
        UserRole role = UserRole.from(account.getRole());
        if (role != UserRole.INSTRUCTOR && role != UserRole.ADMIN) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Bạn cần tài khoản giảng viên");
        }
        return account;
    }

    private user requireAccount(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }
        String token = authorization.substring(7).trim();
        Long userId = sessions.findUserId(token);
        if (userId == null) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }
        user account = users.findById(userId)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ"));
        if (account.getDeletedAt() != null || !"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Tài khoản không khả dụng");
        }
        return account;
    }

    private void promoteInstructor(user account) {
        UserRole role = UserRole.from(account.getRole());
        if (role == UserRole.ADMIN) {
            return;
        }
        if (role == UserRole.INSTRUCTOR
                && account.getUserCatalogue() != null
                && "instructor".equalsIgnoreCase(account.getUserCatalogue().getCanonical())) {
            return;
        }
        userCatalogue catalogue = catalogues.findByCanonical(UserRole.INSTRUCTOR.getCanonical())
                .orElseThrow(() -> new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình quyền giảng viên"));
        account.setRole(UserRole.INSTRUCTOR.name());
        account.setUserCatalogue(catalogue);
        users.save(account);
    }

    private userDTO toUserDto(user account) {
        return new userDTO(
                account.getId(),
                account.getEmail(),
                account.getFullName(),
                UserRole.from(account.getRole()).name());
    }

    private InstructorOnboardingDTO toOnboardingDto(InstructorOnboarding row) {
        return new InstructorOnboardingDTO(
                row.getId(),
                row.getTeachingFormat(),
                row.getRecordingExperience(),
                row.getAudienceSize());
    }

    private CourseDTO toCourseDto(Course course) {
        return new CourseDTO(course.getId(), course.getTitle(), course.getStatus(), course.getCreatedAt());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
