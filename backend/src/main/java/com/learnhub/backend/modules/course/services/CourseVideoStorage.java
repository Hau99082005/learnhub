package com.learnhub.backend.modules.course.services;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.learnhub.backend.modules.course.dtos.VideoInitRequest;
import com.learnhub.backend.modules.course.dtos.VideoReadyDTO;
import com.learnhub.backend.modules.course.dtos.VideoSessionDTO;
import com.learnhub.backend.modules.user.exceptions.AuthException;

@Service
public class CourseVideoStorage {
    private static final Set<String> ALLOWED = Set.of(
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-matroska",
            "video/x-msvideo");
    private static final long SESSION_TTL_SECONDS = 6 * 60 * 60;

    private final int chunkSize;
    private final long maxSize;
    private final String ffmpeg;
    private final String ffprobe;
    private final List<VideoNode> nodes;
    private final Path tempRoot;
    private final Map<String, UploadSession> sessions = new ConcurrentHashMap<>();

    public CourseVideoStorage(
            @Value("${learnhub.video.chunk-size-bytes:8388608}") int chunkSize,
            @Value("${learnhub.video.max-size-bytes:536870912}") long maxSize,
            @Value("${learnhub.video.ffmpeg:ffmpeg}") String ffmpeg,
            @Value("${learnhub.video.ffprobe:ffprobe}") String ffprobe,
            @Value("${learnhub.video.nodes:}") String nodeConfig) {
        this.chunkSize = chunkSize;
        this.maxSize = maxSize;
        this.ffmpeg = ffmpeg;
        this.ffprobe = ffprobe;
        this.nodes = resolveNodes(nodeConfig);
        this.tempRoot = Paths.get(System.getProperty("user.dir"), "uploads", "video-tmp")
                .toAbsolutePath()
                .normalize();
        for (VideoNode node : nodes) {
            try {
                Files.createDirectories(node.root);
            } catch (IOException ignored) {
            }
        }
        try {
            Files.createDirectories(tempRoot);
        } catch (IOException ignored) {
        }
    }

    public VideoSessionDTO init(VideoInitRequest request) {
        if (request == null || request.getSize() == null || request.getSize() <= 0) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Dung lượng video không hợp lệ", "video");
        }
        if (request.getSize() > maxSize) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Video tối đa 512MB", "video");
        }
        String contentType = request.getContentType() == null ? "" : request.getContentType().toLowerCase();
        if (!ALLOWED.contains(contentType) && !looksLikeVideo(request.getFilename())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Video phải là MP4, WEBM, MOV hoặc MKV", "video");
        }
        int total = request.getTotalChunks() == null || request.getTotalChunks() < 1
                ? (int) Math.ceil(request.getSize() / (double) chunkSize)
                : request.getTotalChunks();
        VideoNode node = pickNode();
        String sessionId = UUID.randomUUID().toString();
        Path work = tempRoot.resolve(sessionId);
        try {
            Files.createDirectories(work);
        } catch (IOException ignored) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo phiên tải video");
        }
        sessions.put(sessionId, new UploadSession(node.name, total, Instant.now(), work));
        return new VideoSessionDTO(sessionId, chunkSize, node.name, total);
    }

    public void saveChunk(String sessionId, int index, MultipartFile chunk) {
        UploadSession session = requireSession(sessionId);
        if (index < 0 || index >= session.totalChunks) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mảnh video không hợp lệ", "video");
        }
        if (chunk == null || chunk.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mảnh video trống", "video");
        }
        if (chunk.getSize() > chunkSize + 1024) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Mảnh video vượt kích thước cho phép", "video");
        }
        Path part = session.work.resolve(String.format("%05d.part", index));
        try (InputStream in = chunk.getInputStream()) {
            Files.copy(in, part, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ignored) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu mảnh video");
        }
    }

    public VideoReadyDTO complete(String sessionId) {
        UploadSession session = requireSession(sessionId);
        Path assembled = session.work.resolve("source.bin");
        try {
            assemble(session, assembled);
            VideoNode node = nodeByName(session.node);
            String filename = UUID.randomUUID() + ".mp4";
            Path output = node.root.resolve(filename);
            transcode(assembled, output);
            int duration = probeDuration(output);
            long bytes = Files.size(output);
            cleanup(session);
            sessions.remove(sessionId);
            return new VideoReadyDTO("/api/media/videos/" + node.name + "/" + filename, duration, bytes, node.name);
        } catch (AuthException exception) {
            throw exception;
        } catch (IOException ignored) {
            throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể ghép video");
        }
    }

    public void abort(String sessionId) {
        UploadSession session = sessions.remove(sessionId);
        if (session != null) {
            cleanup(session);
        }
    }

    public void deleteIfOwned(String videoUrl) {
        Path file = resolvePublished(videoUrl);
        if (file == null) {
            return;
        }
        try {
            Files.deleteIfExists(file);
        } catch (IOException ignored) {
        }
    }

    public Path resolvePublished(String videoUrl) {
        if (videoUrl == null || !videoUrl.startsWith("/api/media/videos/")) {
            return null;
        }
        String rest = videoUrl.substring("/api/media/videos/".length());
        int slash = rest.indexOf('/');
        if (slash <= 0) {
            return null;
        }
        return resolvePublished(rest.substring(0, slash), rest.substring(slash + 1));
    }

    public Path resolvePublished(String nodeName, String filename) {
        if (nodeName == null || filename == null) {
            return null;
        }
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return null;
        }
        VideoNode node;
        try {
            node = nodeByName(nodeName);
        } catch (AuthException ignored) {
            return null;
        }
        Path file = node.root.resolve(filename).normalize();
        if (!file.startsWith(node.root) || !Files.isRegularFile(file)) {
            return null;
        }
        return file;
    }

    private void assemble(UploadSession session, Path assembled) throws IOException {
        try (OutputStream out = Files.newOutputStream(assembled, StandardOpenOption.CREATE,
                StandardOpenOption.TRUNCATE_EXISTING)) {
            for (int index = 0; index < session.totalChunks; index++) {
                Path part = session.work.resolve(String.format("%05d.part", index));
                if (!Files.isRegularFile(part)) {
                    throw new AuthException(HttpStatus.BAD_REQUEST, "Thiếu mảnh video " + (index + 1), "video");
                }
                Files.copy(part, out);
            }
        }
        if (Files.size(assembled) > maxSize) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Video tối đa 512MB", "video");
        }
    }

    private void transcode(Path input, Path output) {
        if (!hasBinary(ffmpeg)) {
            try {
                Files.copy(input, output, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ignored) {
                throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu video");
            }
            return;
        }
        List<String> command = List.of(
                ffmpeg,
                "-y",
                "-i",
                input.toAbsolutePath().toString(),
                "-map",
                "0:v:0",
                "-map",
                "0:a?",
                "-c:v",
                "libx264",
                "-preset",
                "veryfast",
                "-crf",
                "23",
                "-maxrate",
                "2500k",
                "-bufsize",
                "5000k",
                "-vf",
                "scale=w='min(1920,iw)':h='min(1080,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
                "-c:a",
                "aac",
                "-b:a",
                "128k",
                "-ac",
                "2",
                "-movflags",
                "+faststart",
                output.toAbsolutePath().toString());
        if (!run(command, 15 * 60)) {
            try {
                Files.copy(input, output, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException ignored) {
                throw new AuthException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể nén video");
            }
        }
    }

    private int probeDuration(Path file) {
        if (!hasBinary(ffprobe)) {
            return 0;
        }
        List<String> command = List.of(
                ffprobe,
                "-v",
                "error",
                "-show_entries",
                "format=duration",
                "-of",
                "csv=p=0",
                file.toAbsolutePath().toString());
        try {
            Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
            String raw = new String(process.getInputStream().readAllBytes()).trim();
            if (!process.waitFor(30, java.util.concurrent.TimeUnit.SECONDS)) {
                process.destroyForcibly();
                return 0;
            }
            if (raw.isBlank()) {
                return 0;
            }
            return (int) Math.round(Double.parseDouble(raw));
        } catch (IOException | InterruptedException | NumberFormatException ignored) {
            return 0;
        }
    }

    private boolean run(List<String> command, int timeoutSeconds) {
        try {
            Process process = new ProcessBuilder(command).redirectErrorStream(true).start();
            process.getInputStream().transferTo(OutputStream.nullOutputStream());
            if (!process.waitFor(timeoutSeconds, java.util.concurrent.TimeUnit.SECONDS)) {
                process.destroyForcibly();
                return false;
            }
            return process.exitValue() == 0;
        } catch (IOException | InterruptedException ignored) {
            return false;
        }
    }

    private boolean hasBinary(String binary) {
        try {
            Process process = new ProcessBuilder(binary, "-version").redirectErrorStream(true).start();
            process.getInputStream().transferTo(OutputStream.nullOutputStream());
            return process.waitFor(8, java.util.concurrent.TimeUnit.SECONDS) && process.exitValue() == 0;
        } catch (IOException | InterruptedException ignored) {
            return false;
        }
    }

    private UploadSession requireSession(String sessionId) {
        purgeExpired();
        UploadSession session = sessions.get(sessionId);
        if (session == null) {
            throw new AuthException(HttpStatus.NOT_FOUND, "Phiên tải video đã hết hạn");
        }
        return session;
    }

    private void purgeExpired() {
        Instant limit = Instant.now().minusSeconds(SESSION_TTL_SECONDS);
        sessions.entrySet().removeIf(entry -> {
            if (entry.getValue().createdAt.isBefore(limit)) {
                cleanup(entry.getValue());
                return true;
            }
            return false;
        });
    }

    private void cleanup(UploadSession session) {
        if (session == null || session.work == null) {
            return;
        }
        try (DirectoryStream<Path> stream = Files.newDirectoryStream(session.work)) {
            for (Path path : stream) {
                Files.deleteIfExists(path);
            }
        } catch (IOException ignored) {
        }
        try {
            Files.deleteIfExists(session.work);
        } catch (IOException ignored) {
        }
    }

    private VideoNode pickNode() {
        return nodes.stream()
                .min(Comparator.comparingLong(this::usedBytes))
                .orElse(nodes.get(0));
    }

    private long usedBytes(VideoNode node) {
        try (var walk = Files.walk(node.root)) {
            return walk
                    .filter(Files::isRegularFile)
                    .mapToLong(path -> {
                        try {
                            return Files.size(path);
                        } catch (IOException ignored) {
                            return 0L;
                        }
                    })
                    .sum();
        } catch (IOException ignored) {
            return Long.MAX_VALUE;
        }
    }

    private VideoNode nodeByName(String name) {
        return nodes.stream()
                .filter(node -> node.name.equals(name))
                .findFirst()
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "Node video không hợp lệ"));
    }

    private List<VideoNode> resolveNodes(String config) {
        List<VideoNode> resolved = new ArrayList<>();
        if (config != null && !config.isBlank()) {
            String[] parts = config.split(",");
            int index = 0;
            for (String part : parts) {
                String trimmed = part.trim();
                if (trimmed.isEmpty()) {
                    continue;
                }
                resolved.add(new VideoNode("n" + index, Paths.get(trimmed).toAbsolutePath().normalize()));
                index += 1;
            }
        }
        if (resolved.isEmpty()) {
            Path base = Paths.get(System.getProperty("user.dir"), "uploads", "videos").toAbsolutePath().normalize();
            resolved.add(new VideoNode("n0", base.resolve("n0")));
            resolved.add(new VideoNode("n1", base.resolve("n1")));
        }
        return List.copyOf(resolved);
    }

    private boolean looksLikeVideo(String filename) {
        if (filename == null) {
            return false;
        }
        String lower = filename.toLowerCase();
        return lower.endsWith(".mp4")
                || lower.endsWith(".webm")
                || lower.endsWith(".mov")
                || lower.endsWith(".mkv")
                || lower.endsWith(".avi");
    }

    private record VideoNode(String name, Path root) {
    }

    private record UploadSession(
            String node,
            int totalChunks,
            Instant createdAt,
            Path work) {
    }
}
