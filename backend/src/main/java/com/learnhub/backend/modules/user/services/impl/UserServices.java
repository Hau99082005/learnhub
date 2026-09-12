package com.learnhub.backend.modules.user.services.impl;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;
import com.learnhub.backend.services.BaseServices;

@Service
public class UserServices extends BaseServices implements UserServicesInterfaces {
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    private final userRepository users;
    private final userCatalogueRepository catalogues;
    private final PasswordEncoder passwordEncoder;

    public UserServices(userRepository users, userCatalogueRepository catalogues, PasswordEncoder passwordEncoder) {
        this.users = users;
        this.catalogues = catalogues;
        this.passwordEncoder = passwordEncoder;
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
        return toAuthResponse(account);
    }

    private LoginReponse toAuthResponse(user account) {
        UserRole role = resolveRole(account);
        return new LoginReponse(
                UUID.randomUUID().toString(),
                new userDTO(
                        account.getId(),
                        account.getEmail(),
                        account.getFullName(),
                        role.name()));
    }

    private void applyRole(user account, UserRole role) {
        account.setRole(role.name());
        if (account.getUserCatalogue() == null
                || !role.getCanonical().equalsIgnoreCase(account.getUserCatalogue().getCanonical())) {
            account.setUserCatalogue(requireCatalogue(role));
        }
    }

    private UserRole resolveRole(user account) {
        if (account.getUserCatalogue() != null && account.getUserCatalogue().getCanonical() != null) {
            return UserRole.from(account.getUserCatalogue().getCanonical());
        }
        return UserRole.from(account.getRole());
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

    private String uniquePhone() {
        String phone;
        do {
            phone = "09" + String.format("%08d", ThreadLocalRandom.current().nextInt(100_000_000));
        } while (users.existsByPhone(phone));
        return phone;
    }
}
