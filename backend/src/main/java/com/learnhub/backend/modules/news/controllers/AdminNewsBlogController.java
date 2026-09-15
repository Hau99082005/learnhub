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

import com.learnhub.backend.modules.news.dtos.NewsBlogDTO;
import com.learnhub.backend.modules.news.dtos.NewsBlogRequest;
import com.learnhub.backend.modules.news.services.NewsServices;

@RestController
@RequestMapping("/api/admin/newsblogs")
public class AdminNewsBlogController {
    private final NewsServices newsServices;

    public AdminNewsBlogController(NewsServices newsServices) {
        this.newsServices = newsServices;
    }

    @GetMapping
    public ResponseEntity<List<NewsBlogDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(newsServices.listAllBlogs(authorization));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NewsBlogDTO> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String excerpt,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String publishedAt,
            @RequestParam("image") MultipartFile image) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(newsServices.createBlog(authorization, toRequest(title, excerpt, isActive, publishedAt), image));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<NewsBlogDTO> update(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String excerpt,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String publishedAt,
            @RequestParam(value = "image", required = false) MultipartFile image) {
        return ResponseEntity.ok(
                newsServices.updateBlog(authorization, id, toRequest(title, excerpt, isActive, publishedAt), image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        newsServices.deleteBlog(authorization, id);
        return ResponseEntity.noContent().build();
    }

    private NewsBlogRequest toRequest(String title, String excerpt, Boolean isActive, String publishedAt) {
        NewsBlogRequest request = new NewsBlogRequest();
        request.setTitle(title);
        request.setExcerpt(excerpt);
        request.setIsActive(isActive);
        request.setPublishedAt(publishedAt);
        return request;
    }
}
