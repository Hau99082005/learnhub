package com.learnhub.backend.modules.user.services;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

@Service
public class AuthSessionService {
    private final Map<String, Long> sessions = new ConcurrentHashMap<>();

    public void save(String token, Long userId) {
        sessions.put(token, userId);
    }

    public Long findUserId(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        return sessions.get(token);
    }

    public void remove(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }
}
