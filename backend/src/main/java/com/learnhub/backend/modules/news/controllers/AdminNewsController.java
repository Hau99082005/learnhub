package com.learnhub.backend.modules.news.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.news.dtos.NewsDTO;
import com.learnhub.backend.modules.news.dtos.NewsRequest;
import com.learnhub.backend.modules.news.services.NewsServices;

@RestController
@RequestMapping("/api/admin/news")
public class AdminNewsController {
    private final NewsServices newsServices;

    public AdminNewsController(NewsServices newsServices) {
        this.newsServices = newsServices;
    }

    @GetMapping
    public ResponseEntity<List<NewsDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(newsServices.listAllNews(authorization));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NewsDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(newsServices.createNews(authorization, toRequest(title, isActive), image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NewsDTO> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(newsServices.updateNews(authorization, id, toRequest(title, isActive), image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        newsServices.deleteNews(authorization, id);
        return ResponseEntity.noContent().build();
    }

    private NewsRequest toRequest(String title, Boolean isActive) {
        NewsRequest request = new NewsRequest();
        request.setTitle(title);
        request.setIsActive(isActive);
        return request;
    }
}
