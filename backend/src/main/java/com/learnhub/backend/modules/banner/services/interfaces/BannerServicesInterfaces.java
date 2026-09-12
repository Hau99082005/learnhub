package com.learnhub.backend.modules.banner.services.interfaces;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.banner.dtos.BannerRequest;
import com.learnhub.backend.modules.banner.dtos.bannerDTO;

public interface BannerServicesInterfaces {
    List<bannerDTO> listActive();

    List<bannerDTO> listAll(String authorization);

    bannerDTO findById(String authorization, Long id);

    bannerDTO create(String authorization, BannerRequest request, MultipartFile image);

    bannerDTO update(String authorization, Long id, BannerRequest request, MultipartFile image);

    void delete(String authorization, Long id);
}
