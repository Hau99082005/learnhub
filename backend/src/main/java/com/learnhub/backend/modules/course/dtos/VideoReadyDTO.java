package com.learnhub.backend.modules.course.dtos;

public class VideoReadyDTO {
    private final String previewVideo;
    private final int durationSeconds;
    private final long bytes;
    private final String node;
    private final String status;
    private final String message;

    public VideoReadyDTO(String previewVideo, int durationSeconds, long bytes, String node) {
        this(previewVideo, durationSeconds, bytes, node, "READY", null);
    }

    public VideoReadyDTO(
            String previewVideo,
            int durationSeconds,
            long bytes,
            String node,
            String status,
            String message) {
        this.previewVideo = previewVideo;
        this.durationSeconds = durationSeconds;
        this.bytes = bytes;
        this.node = node;
        this.status = status;
        this.message = message;
    }

    public static VideoReadyDTO processing() {
        return new VideoReadyDTO(null, 0, 0, null, "PROCESSING", "Đang xử lý video trên máy chủ");
    }

    public static VideoReadyDTO failed(String message) {
        return new VideoReadyDTO(null, 0, 0, null, "FAILED", message);
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

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
