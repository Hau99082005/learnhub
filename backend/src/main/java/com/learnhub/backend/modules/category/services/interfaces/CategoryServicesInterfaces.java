package com.learnhub.backend.modules.category.services.interfaces;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.category.dtos.CategoryRequest;
import com.learnhub.backend.modules.category.dtos.categoryDTO;

public interface CategoryServicesInterfaces {
    List<categoryDTO> listActive();

    List<categoryDTO> listAll(String authorization);

    categoryDTO findById(String authorization, Long id);

    categoryDTO create(String authorization, CategoryRequest request, MultipartFile image);

    categoryDTO update(String authorization, Long id, CategoryRequest request, MultipartFile image);

    void delete(String authorization, Long id);
}
