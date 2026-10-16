package com.learnhub.backend.modules.ai.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.ai.dtos.AiChatReplyDTO;
import com.learnhub.backend.modules.ai.dtos.AiChatRequest;
import com.learnhub.backend.modules.ai.services.AiChatService;

@RestController
@RequestMapping("/api/ai")
public class AiChatController {
    private final AiChatService aiChatService;

    public AiChatController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AiChatReplyDTO> chat(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody(required = false) AiChatRequest request) {
        return ResponseEntity.ok(aiChatService.reply(authorization, request));
    }
}
