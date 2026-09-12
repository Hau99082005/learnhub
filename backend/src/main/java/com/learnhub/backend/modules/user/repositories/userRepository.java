package com.learnhub.backend.modules.user.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.user.models.user;

public interface userRepository extends JpaRepository<user, Long> {
    Optional<user> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPhone(String phone);
}
