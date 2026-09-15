package com.learnhub.backend.modules.news.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.news.dtos.NewsBlogDTO;
import com.learnhub.backend.modules.news.dtos.NewsDTO;
import com.learnhub.backend.modules.news.services.NewsServices;

@RestController
@RequestMapping("/api")
public class NewsPublicController {
    private final NewsServices newsServices;

    public NewsPublicController(NewsServices newsServices) {
        this.newsServices = newsServices;
    }

    @GetMapping("/news")
    public ResponseEntity<List<NewsDTO>> news() {
        return ResponseEntity.ok(newsServices.listActiveNews());
    }

    @GetMapping("/newsblogs")
    public ResponseEntity<List<NewsBlogDTO>> blogs() {
        return ResponseEntity.ok(newsServices.listPublishedBlogs());
    }

    @GetMapping("/newsblogs/{slug}")
    public ResponseEntity<NewsBlogDTO> blog(@PathVariable String slug) {
        return ResponseEntity.ok(newsServices.findPublishedBlog(slug));
    }
}
