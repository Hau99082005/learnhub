package com.learnhub.backend.modules.category.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.learnhub.backend.modules.category.models.Category;

public interface categoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByStatusTrueOrderByIdAsc();

    List<Category> findAllByOrderByIdAsc();

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
