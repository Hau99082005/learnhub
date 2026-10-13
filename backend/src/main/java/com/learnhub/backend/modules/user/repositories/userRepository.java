package com.learnhub.backend.modules.user.repositories;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.user.models.user;

public interface userRepository extends JpaRepository<user, Long> {
    long countByDeletedAtIsNull();

    long countByDeletedAtIsNullAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(
            LocalDateTime start,
            LocalDateTime end);

    Optional<user> findByEmail(String email);

    Optional<user> findByFirebaseUid(String firebaseUid);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);

    boolean existsByPhoneAndIdNot(String phone, Long id);
}
