package com.learnhub.backend.modules.news.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.news.models.News;

public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findByIsActiveTrueOrderByCreatedAtDesc();

    List<News> findAllByOrderByCreatedAtDesc();
}
