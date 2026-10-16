package com.learnhub.backend.modules.ai.services;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.learnhub.backend.config.GeminiProperties;
import com.learnhub.backend.modules.ai.dtos.AiChatMessage;
import com.learnhub.backend.modules.ai.dtos.AiChatReplyDTO;
import com.learnhub.backend.modules.ai.dtos.AiChatRequest;
import com.learnhub.backend.modules.ai.dtos.AiCourseCardDTO;
import com.learnhub.backend.modules.ai.repositories.AiKnowledgeRepository;
import com.learnhub.backend.modules.user.exceptions.AuthException;
import com.learnhub.backend.modules.user.models.user;
import com.learnhub.backend.modules.user.services.interfaces.UserServicesInterfaces;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
public class AiChatService {
    private static final Logger log = LoggerFactory.getLogger(AiChatService.class);
    private static final int MAX_HISTORY = 8;
    private static final int MAX_CHARS = 1200;
    private static final List<String> MODELS = List.of(
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-2.5-flash-lite");

    private final GeminiProperties geminiProperties;
    private final AiKnowledgeRepository knowledge;
    private final UserServicesInterfaces userServices;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;

    public AiChatService(
            GeminiProperties geminiProperties,
            AiKnowledgeRepository knowledge,
            UserServicesInterfaces userServices) {
        this.geminiProperties = geminiProperties;
        this.knowledge = knowledge;
        this.userServices = userServices;
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(Duration.ofSeconds(40));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @Transactional(readOnly = true)
    public AiChatReplyDTO reply(String authorization, AiChatRequest request) {
        List<AiChatMessage> history = sanitize(request == null ? null : request.getMessages());
        if (history.isEmpty()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập câu hỏi");
        }
        String question = lastUserText(history);
        if (question.isBlank()) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Vui lòng nhập câu hỏi");
        }
        Long userId = currentUserId(authorization);
        List<AiCourseCardDTO> catalog = toPublishedCards(queryRows(() -> knowledge.listPublishedCourses()));
        List<AiCourseCardDTO> mine = userId == null
                ? List.of()
                : toLearnerCards(queryRows(() -> knowledge.listLearnerCourses(userId)));
        String facts = loadFacts(userId, catalog, mine);
        String key = geminiProperties.getApiKey();
        String generated = "";
        if (key != null && !key.isBlank()) {
            generated = callGemini(key, question, history, facts);
        }
        String answer = generated == null || generated.isBlank()
                ? localAnswer(question, facts, userId != null)
                : cleanReply(generated);
        return new AiChatReplyDTO(answer, pickCourses(question, answer, catalog, mine));
    }

    private Long currentUserId(String authorization) {
        if (authorization == null || authorization.isBlank()) {
            return null;
        }
        try {
            user account = userServices.requireAccount(authorization);
            return account == null ? null : account.getId();
        } catch (RuntimeException exception) {
            return null;
        }
    }

    private String loadFacts(Long userId, List<AiCourseCardDTO> catalog, List<AiCourseCardDTO> mine) {
        StringBuilder text = new StringBuilder();
        text.append("KHÓA HỌC ĐANG MỞ:\n");
        if (catalog.isEmpty()) {
            text.append("- Chưa có khóa học xuất bản\n");
        } else {
            for (AiCourseCardDTO course : catalog) {
                text.append("- ")
                        .append(course.getTitle())
                        .append(" | ")
                        .append(course.getLevel())
                        .append(" | ")
                        .append(course.isFree() ? "Miễn phí" : String.valueOf(course.getPrice()))
                        .append(" | ")
                        .append(course.getCategory())
                        .append(" | GV ")
                        .append(course.getInstructor())
                        .append(" | /khoa-hoc/")
                        .append(course.getSlug())
                        .append('\n');
            }
        }
        if (userId == null) {
            text.append("Học viên chưa đăng nhập.\n");
            return text.toString();
        }
        text.append("KHÓA ĐANG HỌC:\n");
        if (mine.isEmpty()) {
            text.append("- Chưa ghi danh khóa nào\n");
        } else {
            for (AiCourseCardDTO course : mine) {
                text.append("- ")
                        .append(course.getTitle())
                        .append(" | /khoa-hoc/")
                        .append(course.getSlug())
                        .append('\n');
            }
        }
        text.append("ĐƠN HÀNG:\n");
        List<Object[]> orders = queryRows(() -> knowledge.listUserOrders(userId));
        if (orders.isEmpty()) {
            text.append("- Chưa có đơn\n");
        } else {
            for (Object[] row : orders) {
                text.append("- ")
                        .append(cell(row, 0))
                        .append(" | ")
                        .append(statusLabel(cell(row, 1)))
                        .append(" | ")
                        .append(cell(row, 2))
                        .append(" ")
                        .append(cell(row, 3))
                        .append(" | ")
                        .append(cell(row, 5))
                        .append('\n');
            }
        }
        text.append("CHỨNG CHỈ:\n");
        List<Object[]> certs = queryRows(() -> knowledge.listLearnerCertificates(userId));
        if (certs.isEmpty()) {
            text.append("- Chưa có chứng chỉ\n");
        } else {
            for (Object[] row : certs) {
                text.append("- ")
                        .append(cell(row, 0))
                        .append(" | ")
                        .append(cell(row, 1))
                        .append(" | xem ")
                        .append(cell(row, 2))
                        .append("% | mã ")
                        .append(cell(row, 3))
                        .append('\n');
            }
        }
        return text.toString();
    }

    private String callGemini(String key, String question, List<AiChatMessage> history, String facts) {
        String payload = buildPayload(question, history, facts);
        List<String> models = new ArrayList<>();
        String preferred = geminiProperties.getModel();
        if (preferred != null && !preferred.isBlank()) {
            models.add(preferred.trim());
        }
        for (String model : MODELS) {
            if (!models.contains(model)) {
                models.add(model);
            }
        }
        for (String model : models) {
            try {
                String body = restClient.post()
                        .uri(geminiProperties.getApiUrl() + "/" + model + ":generateContent")
                        .header("x-goog-api-key", key)
                        .header("Accept", "application/json")
                        .header("Content-Type", "application/json")
                        .body(payload)
                        .retrieve()
                        .body(String.class);
                String text = extractText(body == null ? "{}" : body);
                if (!text.isBlank()) {
                    return text;
                }
            } catch (RestClientResponseException exception) {
                log.warn("Gemini HTTP {} model {}", exception.getStatusCode().value(), model);
            } catch (RuntimeException exception) {
                log.warn("Gemini error model {}", model);
            }
        }
        return "";
    }

    private String buildPayload(String question, List<AiChatMessage> history, String facts) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là trợ lý robot LearnHub, xưng mình, gọi người học là bạn. ");
        prompt.append("Trả lời tiếng Việt tự nhiên, liền mạch, 2 đến 4 câu, xuống dòng khi cần. ");
        prompt.append("Chỉ dùng dữ liệu dưới đây, không bịa khóa học hay giá. ");
        prompt.append("Không dùng markdown, không dùng dấu * hoặc `. Không liệt kê dài tên khóa. ");
        prompt.append("Hệ thống sẽ hiện thẻ khóa học kèm ảnh, chỉ viết lời giới thiệu rồi mời bấm thẻ. ");
        prompt.append("Nêu bước tiếp theo rõ ràng khi phù hợp.\n");
        prompt.append("Thanh toán: /thanh-toan chuyển khoản SePay, mở khóa ngay khi thành công. ");
        prompt.append("Chứng chỉ: xem video đủ 50% trở lên, điểm theo % xem, trang /hoc-tap.\n\n");
        prompt.append(facts);
        prompt.append("\nLịch sử:\n");
        for (AiChatMessage row : history) {
            if (row.getContent().equals(question) && "user".equals(row.getRole())) {
                continue;
            }
            prompt.append("user".equals(row.getRole()) ? "Học viên: " : "Trợ lý: ");
            prompt.append(row.getContent()).append('\n');
        }
        prompt.append("\nCâu hỏi hiện tại: ").append(question);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("contents", List.of(Map.of(
                "role",
                "user",
                "parts",
                List.of(Map.of("text", prompt.toString())))));
        body.put("generationConfig", Map.of(
                "temperature", 0.55,
                "maxOutputTokens", 800));
        return objectMapper.writeValueAsString(body);
    }

    private String localAnswer(String question, String facts, boolean signedIn) {
        String ask = question.toLowerCase(Locale.ROOT);
        if (ask.contains("chứng chỉ") || ask.contains("chung chi") || ask.contains("bằng")) {
            return "Bạn nhận chứng chỉ khi xem từ 50% video trở lên. Điểm được tính theo phần trăm xem: 50 Trung bình, 65 Khá, 80 Giỏi, 90 Xuất sắc.\nVào /hoc-tap để xem chứng chỉ."
                    + (facts.contains("CHỨNG CHỈ:\n- Chưa") || !signedIn
                            ? " Đăng nhập giúp mình đối chiếu chứng chỉ của bạn nhé."
                            : "");
        }
        if (ask.contains("thanh toán") || ask.contains("thanh toan") || ask.contains("sepay") || ask.contains("chuyển khoản")) {
            return "Bạn vào /gio-hang rồi sang /thanh-toan, chọn chuyển khoản ngân hàng.\nKhóa học sẽ mở ngay khi giao dịch thành công.";
        }
        if (ask.contains("đơn") || ask.contains("mua") || ask.contains("order")) {
            if (!signedIn) {
                return "Bạn đăng nhập rồi mình sẽ xem giúp đơn hàng của bạn. Thanh toán tại /thanh-toan.";
            }
            return "Đây là đơn hàng gần đây của bạn:\n" + section(facts, "ĐƠN HÀNG:");
        }
        if (ask.contains("tôi đang học") || ask.contains("khóa của tôi") || ask.contains("hoc tap") || ask.contains("học tập") || ask.contains("tiến độ")) {
            if (!signedIn) {
                return "Bạn đăng nhập rồi mình sẽ hiện các khóa đang học. Trang học tập nằm ở /hoc-tap.";
            }
            return "Mình lấy các khóa bạn đang học đây. Bấm vào thẻ để xem chi tiết hoặc học tiếp.";
        }
        if (ask.contains("miễn phí") || ask.contains("mien phi")) {
            return "Mình lọc các khóa đang mở cho bạn. Khóa miễn phí sẽ ghi rõ trên thẻ, bấm vào để xem chi tiết.";
        }
        if (ask.contains("learnhub") || ask.contains("dùng để") || ask.contains("là gì")) {
            return "LearnHub là nền tảng học trực tuyến: chọn khóa, thanh toán, học video và nhận chứng chỉ khi xem đủ tiến độ.";
        }
        return "Mình gợi ý một số khóa phù hợp bên dưới. Bấm vào thẻ để xem chi tiết khóa học.";
    }

    private String section(String facts, String title) {
        int start = facts.indexOf(title);
        if (start < 0) {
            return facts;
        }
        int from = start + title.length();
        int end = facts.length();
        String[] heads = {"KHÓA HỌC ĐANG MỞ:", "KHÓA ĐANG HỌC:", "ĐƠN HÀNG:", "CHỨNG CHỈ:"};
        for (String head : heads) {
            if (head.equals(title)) {
                continue;
            }
            int at = facts.indexOf(head, from);
            if (at > 0 && at < end) {
                end = at;
            }
        }
        String body = facts.substring(from, end).trim();
        return body.isBlank() ? "- Chưa có dữ liệu" : body;
    }

    private List<AiChatMessage> sanitize(List<AiChatMessage> rows) {
        List<AiChatMessage> clean = new ArrayList<>();
        if (rows == null) {
            return clean;
        }
        for (AiChatMessage row : rows) {
            if (row == null) {
                continue;
            }
            String content = row.getContent() == null ? "" : row.getContent().trim();
            if (content.isBlank()) {
                continue;
            }
            if (content.length() > MAX_CHARS) {
                content = content.substring(0, MAX_CHARS);
            }
            String role = row.getRole() == null ? "user" : row.getRole().trim().toLowerCase(Locale.ROOT);
            if (!"user".equals(role)) {
                role = "assistant";
            }
            AiChatMessage item = new AiChatMessage();
            item.setRole(role);
            item.setContent(content);
            clean.add(item);
        }
        if (clean.size() > MAX_HISTORY) {
            return List.copyOf(clean.subList(clean.size() - MAX_HISTORY, clean.size()));
        }
        return List.copyOf(clean);
    }

    private List<Object[]> queryRows(java.util.function.Supplier<List<Object[]>> query) {
        try {
            List<Object[]> rows = query.get();
            return rows == null ? List.of() : rows;
        } catch (RuntimeException exception) {
            log.warn("AI knowledge query failed");
            return List.of();
        }
    }

    private List<AiCourseCardDTO> pickCourses(
            String question,
            String answer,
            List<AiCourseCardDTO> catalog,
            List<AiCourseCardDTO> mine) {
        String hay = ((question == null ? "" : question) + " " + (answer == null ? "" : answer))
                .toLowerCase(Locale.ROOT);
        String ask = question == null ? "" : question.toLowerCase(Locale.ROOT);
        if (ask.contains("đơn") || ask.contains("thanh toán") || ask.contains("thanh toan") || ask.contains("sepay")) {
            return List.of();
        }
        if (ask.contains("đang học") || ask.contains("khóa của tôi") || ask.contains("học tập") || ask.contains("hoc tap")) {
            return mine.isEmpty() ? List.of() : List.copyOf(mine.subList(0, Math.min(6, mine.size())));
        }
        List<AiCourseCardDTO> matched = new ArrayList<>();
        for (AiCourseCardDTO course : catalog) {
            String slug = course.getSlug() == null ? "" : course.getSlug().toLowerCase(Locale.ROOT);
            String title = course.getTitle() == null ? "" : course.getTitle().toLowerCase(Locale.ROOT);
            if ((!slug.isBlank() && hay.contains(slug)) || (!title.isBlank() && hay.contains(title))) {
                matched.add(course);
            }
        }
        if (!matched.isEmpty()) {
            return List.copyOf(matched.subList(0, Math.min(6, matched.size())));
        }
        boolean beginner = ask.contains("người mới") || ask.contains("co ban") || ask.contains("cơ bản") || ask.contains("beginner");
        boolean wantFree = ask.contains("miễn phí") || ask.contains("mien phi");
        boolean courseAsk = beginner
                || wantFree
                || ask.contains("khóa")
                || ask.contains("khoa")
                || ask.contains("course")
                || ask.contains("phù hợp")
                || ask.contains("gợi ý")
                || ask.contains("backend")
                || ask.contains("đang mở");
        if (!courseAsk) {
            return List.of();
        }
        for (AiCourseCardDTO course : catalog) {
            String level = course.getLevel() == null ? "" : course.getLevel();
            String haystack = ((course.getTitle() == null ? "" : course.getTitle())
                    + " "
                    + (course.getCategory() == null ? "" : course.getCategory())
                    + " "
                    + (course.getSlug() == null ? "" : course.getSlug())).toLowerCase(Locale.ROOT);
            if (beginner && !level.contains("Cơ bản") && !level.contains("Mọi cấp")) {
                continue;
            }
            if (wantFree && !course.isFree()) {
                continue;
            }
            if (ask.contains("backend") && !haystack.contains("backend") && !haystack.contains("spring") && !haystack.contains("java")) {
                continue;
            }
            matched.add(course);
            if (matched.size() >= 6) {
                break;
            }
        }
        if (matched.isEmpty()) {
            return List.copyOf(catalog.subList(0, Math.min(6, catalog.size())));
        }
        return List.copyOf(matched);
    }

    private List<AiCourseCardDTO> toPublishedCards(List<Object[]> rows) {
        List<AiCourseCardDTO> cards = new ArrayList<>();
        for (Object[] row : rows) {
            cards.add(new AiCourseCardDTO(
                    cell(row, 0),
                    cell(row, 1),
                    cell(row, 9),
                    cell(row, 6),
                    levelLabel(cell(row, 2)),
                    cell(row, 7),
                    money(row, 3),
                    cell(row, 4),
                    flag(row, 5)));
        }
        return cards;
    }

    private List<AiCourseCardDTO> toLearnerCards(List<Object[]> rows) {
        List<AiCourseCardDTO> cards = new ArrayList<>();
        for (Object[] row : rows) {
            cards.add(new AiCourseCardDTO(
                    cell(row, 0),
                    cell(row, 1),
                    cell(row, 4),
                    cell(row, 7),
                    "",
                    "",
                    money(row, 5),
                    cell(row, 6),
                    flag(row, 8)));
        }
        return cards;
    }

    private String cleanReply(String text) {
        return text.replace("**", "").replace("`", "").replaceAll("(?m)^\\s*-\\s*", "").trim();
    }

    private boolean flag(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) {
            return false;
        }
        if (row[index] instanceof Boolean value) {
            return value;
        }
        if (row[index] instanceof Number number) {
            return number.intValue() != 0;
        }
        String text = String.valueOf(row[index]).trim();
        return "1".equals(text) || "true".equalsIgnoreCase(text);
    }

    private BigDecimal money(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) {
            return BigDecimal.ZERO;
        }
        if (row[index] instanceof BigDecimal number) {
            return number;
        }
        try {
            return new BigDecimal(String.valueOf(row[index]).replace(",", "").trim());
        } catch (NumberFormatException exception) {
            return BigDecimal.ZERO;
        }
    }

    private String lastUserText(List<AiChatMessage> history) {
        for (int index = history.size() - 1; index >= 0; index--) {
            if ("user".equals(history.get(index).getRole())) {
                return history.get(index).getContent();
            }
        }
        return "";
    }

    private String extractText(String body) {
        JsonNode root = objectMapper.readTree(body);
        JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) {
            return "";
        }
        StringBuilder text = new StringBuilder();
        for (JsonNode part : parts) {
            String piece = part.path("text").asString("");
            if (!piece.isBlank()) {
                if (text.length() > 0) {
                    text.append('\n');
                }
                text.append(piece.trim());
            }
        }
        return text.toString().trim();
    }

    private String cell(Object[] row, int index) {
        if (row == null || index >= row.length || row[index] == null) {
            return "";
        }
        if (row[index] instanceof BigDecimal number) {
            return number.stripTrailingZeros().toPlainString();
        }
        return String.valueOf(row[index]).trim();
    }

    private String levelLabel(String level) {
        String value = level == null ? "" : level.toUpperCase(Locale.ROOT);
        if ("BEGINNER".equals(value)) {
            return "Cơ bản";
        }
        if ("INTERMEDIATE".equals(value)) {
            return "Trung cấp";
        }
        if ("ADVANCED".equals(value)) {
            return "Nâng cao";
        }
        return "Mọi cấp độ";
    }

    private String statusLabel(String status) {
        String value = status == null ? "" : status.toUpperCase(Locale.ROOT);
        if ("PAID".equals(value)) {
            return "Đã thanh toán";
        }
        if ("PENDING".equals(value)) {
            return "Chờ thanh toán";
        }
        if ("CANCELLED".equals(value) || "CANCELED".equals(value)) {
            return "Đã hủy";
        }
        if ("FAILED".equals(value)) {
            return "Thất bại";
        }
        if ("REFUNDED".equals(value)) {
            return "Hoàn tiền";
        }
        return status == null ? "" : status;
    }
}
