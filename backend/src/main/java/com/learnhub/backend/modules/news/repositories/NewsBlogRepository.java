package com.learnhub.backend.modules.news.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.news.models.NewsBlog;

public interface NewsBlogRepository extends JpaRepository<NewsBlog, Long> {
    List<NewsBlog> findByIsActiveTrueAndPublishedAtLessThanEqualOrderByPublishedAtDesc(
            LocalDateTime publishedAt);

    List<NewsBlog> findAllByOrderByPublishedAtDesc();

    Optional<NewsBlog> findBySlugAndIsActiveTrueAndPublishedAtLessThanEqual(
            String slug,
            LocalDateTime publishedAt);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
