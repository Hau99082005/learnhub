package com.learnhub.backend.modules.notify.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.learnhub.backend.modules.notify.dtos.InboxCountDTO;
import com.learnhub.backend.modules.notify.dtos.InboxItemDTO;
import com.learnhub.backend.modules.notify.services.InboxService;

@RestController
@RequestMapping("/api/inbox")
public class InboxController {
    private final InboxService inbox;

    public InboxController(InboxService inbox) {
        this.inbox = inbox;
    }

    @GetMapping
    public ResponseEntity<List<InboxItemDTO>> list(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(inbox.list(authorization));
    }

    @GetMapping("/unread")
    public ResponseEntity<InboxCountDTO> unread(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(inbox.unread(authorization));
    }

    @PostMapping("/read-all")
    public ResponseEntity<InboxCountDTO> readAll(
            @RequestHeader(value = "Authorization", required = false) String authorization) {
        return ResponseEntity.ok(inbox.markAllRead(authorization));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<InboxItemDTO> read(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long id) {
        return ResponseEntity.ok(inbox.markRead(authorization, id));
    }
}
