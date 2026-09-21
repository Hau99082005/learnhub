package com.learnhub.backend.modules.course.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.course.models.MediaAsset;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {
}
