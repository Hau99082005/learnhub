package com.learnhub.backend.modules.user.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.user.models.userCatalogue;

public interface userCatalogueRepository extends JpaRepository<userCatalogue, Long> {
    Optional<userCatalogue> findByCanonical(String canonical);

    boolean existsByCanonical(String canonical);
}
