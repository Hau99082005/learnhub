package com.learnhub.backend.modules.course.dtos;

public class VideoSessionDTO {
    private final String sessionId;
    private final int chunkSize;
    private final String node;
    private final int totalChunks;

    public VideoSessionDTO(String sessionId, int chunkSize, String node, int totalChunks) {
        this.sessionId = sessionId;
        this.chunkSize = chunkSize;
        this.node = node;
        this.totalChunks = totalChunks;
    }

    public String getSessionId() {
        return sessionId;
    }

    public int getChunkSize() {
        return chunkSize;
    }

    public String getNode() {
        return node;
    }

    public int getTotalChunks() {
        return totalChunks;
    }
}
