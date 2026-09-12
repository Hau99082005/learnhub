package com.learnhub.backend.modules.banner.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.banner.models.banner;

public interface bannerRepository extends JpaRepository<banner, Long> {
    List<banner> findByIsActiveTrueOrderByIdAsc();

    List<banner> findAllByOrderByIdAsc();
}
