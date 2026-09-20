package com.learnhub.backend.modules.course.dtos;

public class VideoReadyDTO {
    private final String previewVideo;
    private final int durationSeconds;
    private final long bytes;
    private final String node;

    public VideoReadyDTO(String previewVideo, int durationSeconds, long bytes, String node) {
        this.previewVideo = previewVideo;
        this.durationSeconds = durationSeconds;
        this.bytes = bytes;
        this.node = node;
    }

    public String getPreviewVideo() {
        return previewVideo;
    }

    public int getDurationSeconds() {
        return durationSeconds;
    }

    public long getBytes() {
        return bytes;
    }

    public String getNode() {
        return node;
    }
}
