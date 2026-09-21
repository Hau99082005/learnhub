package com.learnhub.backend.modules.course.support;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.channels.SeekableByteChannel;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

public final class Mp4Duration {
    private Mp4Duration() {
    }

    public static int seconds(Path file) {
        try (SeekableByteChannel channel = Files.newByteChannel(file, StandardOpenOption.READ)) {
            return scan(channel, 0L, channel.size());
        } catch (Exception ignored) {
            return 0;
        }
    }

    private static int scan(SeekableByteChannel channel, long start, long end) throws Exception {
        long cursor = start;
        ByteBuffer header = ByteBuffer.allocate(16).order(ByteOrder.BIG_ENDIAN);
        while (cursor + 8 <= end) {
            channel.position(cursor);
            header.clear();
            header.limit(8);
            if (channel.read(header) < 8) {
                return 0;
            }
            header.flip();
            long size = Integer.toUnsignedLong(header.getInt());
            int type = header.getInt();
            int headerSize = 8;
            if (size == 1) {
                header.clear();
                header.limit(8);
                if (channel.read(header) < 8) {
                    return 0;
                }
                header.flip();
                size = header.getLong();
                headerSize = 16;
            } else if (size == 0) {
                size = end - cursor;
            }
            if (size < headerSize) {
                return 0;
            }
            long next = cursor + size;
            if (type == fourcc("moov")) {
                int nested = scan(channel, cursor + headerSize, next);
                if (nested > 0) {
                    return nested;
                }
            } else if (type == fourcc("mvhd")) {
                return fromMvhd(channel, cursor + headerSize);
            }
            cursor = next;
        }
        return 0;
    }

    private static int fromMvhd(SeekableByteChannel channel, long offset) throws Exception {
        ByteBuffer buffer = ByteBuffer.allocate(32).order(ByteOrder.BIG_ENDIAN);
        channel.position(offset);
        int read = channel.read(buffer);
        if (read < 20) {
            return 0;
        }
        buffer.flip();
        int version = Byte.toUnsignedInt(buffer.get());
        long timescale;
        long duration;
        if (version == 1) {
            if (read < 32) {
                return 0;
            }
            buffer.position(20);
            timescale = Integer.toUnsignedLong(buffer.getInt());
            duration = buffer.getLong();
        } else {
            buffer.position(12);
            timescale = Integer.toUnsignedLong(buffer.getInt());
            duration = Integer.toUnsignedLong(buffer.getInt());
        }
        if (timescale <= 0 || duration <= 0) {
            return 0;
        }
        return (int) Math.round(duration / (double) timescale);
    }

    private static int fourcc(String value) {
        return (value.charAt(0) << 24) | (value.charAt(1) << 16) | (value.charAt(2) << 8) | value.charAt(3);
    }
}
