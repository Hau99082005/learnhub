package com.learnhub.backend.modules.user.services.impl;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.learnhub.backend.config.FirebaseProperties;
import com.learnhub.backend.modules.instructor.dtos.InstructorOnboardingRequest;
import com.learnhub.backend.modules.instructor.services.InstructorServices;
import com.learnhub.backend.modules.user.dtos.FirebaseClientConfig;
import com.learnhub.backend.modules.user.dtos.GoogleAuthRequest;
import com.learnhub.backend.modules.user.dtos.LoginReponse;
import com.learnhub.backend.modules.user.dtos.LoginRequest;
import com.learnhub.backend.modules.user.dtos.RegisterRequest;
import com.learnhub.backend.modules.user.dtos.userDTO;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.UserRole;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.models.userCatalogue;
import com.learnhub.backend.modules.user.repositories.userCatalogueRepository;
import com.learnhub.backend.modules.user.repositories.userRepository;
import com.learnhub.backend.modules.user.services.AuthSessionService;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;
import com.learnhub.backend.services.BaseServices;

@Service
public class UserServices extends BaseServices implements UserServicesInterfaces {
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    private final userRepository users;
    private final userCatalogueRepository catalogues;
    private final PasswordEncoder passwordEncoder;
    private final AuthSessionService sessions;
    private final FirebaseProperties firebaseProperties;
    private final InstructorServices instructorServices;

    public UserServices(
            userRepository users,
            userCatalogueRepository catalogues,
            PasswordEncoder passwordEncoder,
            AuthSessionService sessions,
            FirebaseProperties firebaseProperties,
            InstructorServices instructorServices) {
        this.users = users;
        this.catalogues = catalogues;
        this.passwordEncoder = passwordEncoder;
        this.sessions = sessions;
        this.firebaseProperties = firebaseProperties;
        this.instructorServices = instructorServices;
    }

    @Override
    @Transactional
    public LoginReponse login(LoginRequest request) {
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();
        if (email == null || email.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập email", "email");
        }
        if (!email.matches(EMAIL_PATTERN)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Email không hợp lệ", "email");
        }
        if (password == null || password.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mật khẩu", "password");
        }

        user account = users.findByEmail(email)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng"));

        if (account.getDeletedAt() != null || !"ACTIVE".equalsIgnoreCase(account.getStatus())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Tài khoản không khả dụng");
        }
        applyRole(account, UserRole.from(account.getRole()));

        if (!passwordEncoder.matches(password, account.getPassword())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng");
        }

        account.setLastLoginAt(LocalDateTime.now());
        users.save(account);
        return toAuthResponse(account);
    }

    @Override
    @Transactional
    public LoginReponse register(RegisterRequest request) {
        String name = request.getName() == null ? "" : request.getName().trim();
        String email = normalizeEmail(request.getEmail());
        String password = request.getPassword();
        String confirmPassword = request.getConfirmPassword();

        if (name.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập họ và tên", "name");
        }
        if (email == null || email.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập email", "email");
        }
        if (!email.matches(EMAIL_PATTERN)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Email không hợp lệ", "email");
        }
        if (password == null || password.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập mật khẩu", "password");
        }
        if (password.length() < 8) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có ít nhất 8 ký tự", "password");
        }
        if (confirmPassword == null || confirmPassword.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng xác nhận mật khẩu", "confirmPassword");
        }
        if (!password.equals(confirmPassword)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Xác nhận mật khẩu không khớp", "confirmPassword");
        }
        if (users.existsByEmail(email)) {
            throw new AuthException(HttpStatus.CONFLICT, "Email đã được sử dụng", "email");
        }

        UserRole role = UserRole.fromPublic(request.getRole());
        userCatalogue catalogue = requireCatalogue(role);

        user account = new user();
        account.setFirebaseUid("local-" + UUID.randomUUID());
        account.setUserCatalogue(catalogue);
        account.setRole(role.name());
        account.setUsername(uniqueUsername(email));
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(password));
        account.setPhone(uniquePhone());
        account.setAddress("Chưa cập nhật");
        account.setBio("");
        account.setImages("default-" + UUID.randomUUID() + ".png");
        account.setFullName(name);
        account.setStatus("ACTIVE");
        account.setEmailVerified(false);
        users.save(account);
        instructorServices.upsertIfPresent(account, onboardingFrom(
                request.getTeachingFormat(),
                request.getRecordingExperience(),
                request.getAudienceSize()));
        return toAuthResponse(account);
    }

    @Override
    @Transactional
    public LoginReponse loginWithGoogle(GoogleAuthRequest request) {
        if (request == null || request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Đăng nhập Google không hợp lệ");
        }
        if (FirebaseApp.getApps().isEmpty()) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình Firebase");
        }
        FirebaseToken decoded;
        try {
            decoded = FirebaseAuth.getInstance().verifyIdToken(request.getIdToken().trim());
        } catch (FirebaseAuthException exception) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Đăng nhập Google không hợp lệ");
        }
        String uid = decoded.getUid();
        String email = normalizeEmail(decoded.getEmail());
        if (email == null || email.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Tài khoản Google không có email");
        }
        String name = decoded.getName() == null ? "" : decoded.getName().trim();
        if (name.isBlank()) {
            name = email.split("@")[0];
        }

        user account = users.findByFirebaseUid(uid).or(() -> users.findByEmail(email)).orElse(null);
        if (account != null) {
            if (account.getDeletedAt() != null || !"ACTIVE".equalsIgnoreCase(account.getStatus())) {
                throw new AuthException(HttpStatus.UNAUTHORIZED, "Tài khoản không khả dụng");
            }
            account.setFirebaseUid(uid);
            if (account.getFullName() == null || account.getFullName().isBlank()) {
                account.setFullName(name);
            }
            if (Boolean.TRUE.equals(decoded.isEmailVerified())) {
                account.setEmailVerified(true);
            }
            applyRole(account, resolveRole(account));
            account.setLastLoginAt(LocalDateTime.now());
            users.save(account);
            instructorServices.upsertIfPresent(account, onboardingFrom(
                    request.getTeachingFormat(),
                    request.getRecordingExperience(),
                    request.getAudienceSize()));
            return toAuthResponse(account);
        }

        UserRole role = UserRole.fromPublic(request.getRole());
        userCatalogue catalogue = requireCatalogue(role);
        account = new user();
        account.setFirebaseUid(uid);
        account.setUserCatalogue(catalogue);
        account.setRole(role.name());
        account.setUsername(uniqueUsername(email));
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        account.setPhone(uniquePhone());
        account.setAddress("Chưa cập nhật");
        account.setBio("");
        account.setImages("google-" + uid + ".png");
        account.setFullName(name);
        account.setStatus("ACTIVE");
        account.setEmailVerified(Boolean.TRUE.equals(decoded.isEmailVerified()));
        account.setLastLoginAt(LocalDateTime.now());
        users.save(account);
        instructorServices.upsertIfPresent(account, onboardingFrom(
                request.getTeachingFormat(),
                request.getRecordingExperience(),
                request.getAudienceSize()));
        return toAuthResponse(account);
    }

    @Override
    @Transactional(readOnly = true)
    public FirebaseClientConfig firebaseClientConfig() {
        return new FirebaseClientConfig(
                firebaseProperties.getApiKey(),
                firebaseProperties.getAuthDomain(),
                firebaseProperties.getProjectId(),
                firebaseProperties.getStorageBucket(),
                firebaseProperties.getMessagingSenderId(),
                firebaseProperties.getAppId(),
                firebaseProperties.getMeasurementId());
    }

    @Override
    @Transactional(readOnly = true)
    public userDTO me(String authorization) {
        return toUserDto(requireAccount(authorization));
    }

    @Override
    @Transactional(readOnly = true)
    public userDTO requireAdmin(String authorization) {
        user account = requireAccount(authorization);
        if (resolveRole(account) != UserRole.ADMIN) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập trang quản trị");
        }
        return toUserDto(account);
    }

    private LoginReponse toAuthResponse(user account) {
        String token = UUID.randomUUID().toString();
        sessions.save(token, account.getId());
        return new LoginReponse(token, toUserDto(account));
    }

    private userDTO toUserDto(user account) {
        return new userDTO(
                account.getId(),
                account.getEmail(),
                account.getFullName(),
                resolveRole(account).name());
    }

    private user requireAccount(String authorization) {
        String token = extractToken(authorization);
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

    private String extractToken(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }
        String token = authorization.substring(7).trim();
        if (token.isBlank()) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ");
        }
        return token;
    }

    private void applyRole(user account, UserRole role) {
        account.setRole(role.name());
        if (account.getUserCatalogue() == null
                || !role.getCanonical().equalsIgnoreCase(account.getUserCatalogue().getCanonical())) {
            account.setUserCatalogue(requireCatalogue(role));
        }
    }

    private UserRole resolveRole(user account) {
        UserRole fromColumn = UserRole.from(account.getRole());
        if (fromColumn == UserRole.ADMIN) {
            return UserRole.ADMIN;
        }
        if (account.getUserCatalogue() != null && account.getUserCatalogue().getCanonical() != null) {
            return UserRole.from(account.getUserCatalogue().getCanonical());
        }
        return fromColumn;
    }

    private userCatalogue requireCatalogue(UserRole role) {
        return catalogues.findByCanonical(role.getCanonical())
                .orElseThrow(() -> new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Chưa cấu hình quyền người dùng"));
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }

    private String uniqueUsername(String email) {
        String base = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (base.isBlank()) {
            base = "user";
        }
        String username = base;
        int suffix = 0;
        while (users.existsByUsername(username)) {
            suffix += 1;
            username = base + suffix;
        }
        return username;
    }

    private InstructorOnboardingRequest onboardingFrom(
            String teachingFormat,
            String recordingExperience,
            String audienceSize) {
        InstructorOnboardingRequest request = new InstructorOnboardingRequest();
        request.setTeachingFormat(teachingFormat);
        request.setRecordingExperience(recordingExperience);
        request.setAudienceSize(audienceSize);
        return request;
    }

    private String uniquePhone() {
        String phone;
        do {
            phone = "09" + String.format("%08d", ThreadLocalRandom.current().nextInt(100_000_000));
        } while (users.existsByPhone(phone));
        return phone;
    }
}
