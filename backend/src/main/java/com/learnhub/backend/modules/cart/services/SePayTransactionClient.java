package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learnhub.backend.config.SePayProperties;

@Component
public class SePayTransactionClient {
    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final SePayProperties sePayProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(3))
            .build();

    public SePayTransactionClient(SePayProperties sePayProperties) {
        this.sePayProperties = sePayProperties;
    }

    public Optional<String> findPaidTransactionId(String orderCode, BigDecimal amount) {
        String token = sePayProperties.getApiToken() == null ? "" : sePayProperties.getApiToken().trim();
        if (token.isBlank() || orderCode == null || orderCode.isBlank()) {
            return Optional.empty();
        }
        BigDecimal due = amount == null ? BigDecimal.ZERO : amount;
        String acc = sePayProperties.getAccountNumber() == null ? "" : sePayProperties.getAccountNumber().trim();
        String today = LocalDate.now(VN).toString();
        List<String> urls = new ArrayList<>();
        urls.add("https://my.sepay.vn/userapi/transactions/list?limit=50"
                + (acc.isBlank() ? "" : "&account_number=" + encode(acc))
                + "&transaction_date_min=" + encode(today));
        urls.add(v2Url(sePayProperties.getApiBaseUrl(), orderCode, acc));
        urls.add(v2Url(sePayProperties.getSandboxBaseUrl(), orderCode, acc));
        for (String url : urls) {
            if (url == null || url.isBlank()) {
                continue;
            }
            Optional<String> matched = query(url, token, orderCode, due);
            if (matched.isPresent()) {
                return matched;
            }
        }
        return Optional.empty();
    }

    private String v2Url(String baseUrl, String orderCode, String acc) {
        if (baseUrl == null || baseUrl.isBlank()) {
            return "";
        }
        String url = baseUrl.replaceAll("/$", "")
                + "/transactions?transfer_type=in&per_page=50&transaction_content="
                + encode(orderCode)
                + "&q=" + encode(orderCode);
        if (!acc.isBlank()) {
            url += "&account_number=" + encode(acc);
        }
        return url;
    }

    private Optional<String> query(String url, String token, String orderCode, BigDecimal due) {
        JsonNode root = fetch(url, token);
        if (root == null) {
            return Optional.empty();
        }
        JsonNode rows = root.path("transactions");
        if (!rows.isArray()) {
            rows = root.path("data");
        }
        if (!rows.isArray()) {
            return Optional.empty();
        }
        String needle = orderCode.toUpperCase(Locale.ROOT);
        for (JsonNode row : rows) {
            String type = firstText(row, "transfer_type", "transferType");
            if (!type.isBlank() && !"in".equalsIgnoreCase(type) && !"0".equals(type)) {
                continue;
            }
            BigDecimal paid = firstDecimal(row, "amount_in", "amountIn", "transferAmount", "transfer_amount");
            if (paid.setScale(0, RoundingMode.DOWN).compareTo(due.setScale(0, RoundingMode.DOWN)) < 0) {
                continue;
            }
            String blob = (firstText(row, "code")
                    + " "
                    + firstText(row, "transaction_content", "transactionContent", "content", "description"))
                    .toUpperCase(Locale.ROOT);
            if (!blob.contains(needle)) {
                continue;
            }
            String id = firstText(row, "id");
            if (id.isBlank()) {
                continue;
            }
            return Optional.of("SEPAY-" + id);
        }
        return Optional.empty();
    }

    private JsonNode fetch(String url, String token) {
        for (String header : List.of("Bearer " + token, "Apikey " + token)) {
            try {
                HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                        .timeout(Duration.ofSeconds(4))
                        .header("Authorization", header)
                        .header("Accept", "application/json")
                        .header("Content-Type", "application/json")
                        .GET()
                        .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() < 200 || response.statusCode() >= 300) {
                    continue;
                }
                return objectMapper.readTree(response.body() == null ? "{}" : response.body());
            } catch (Exception ignored) {
                continue;
            }
        }
        return null;
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String firstText(JsonNode row, String... fields) {
        for (String field : fields) {
            JsonNode value = row.path(field);
            if (!value.isMissingNode() && !value.isNull() && !value.asText("").isBlank()) {
                return value.asText();
            }
        }
        return "";
    }

    private BigDecimal firstDecimal(JsonNode row, String... fields) {
        for (String field : fields) {
            JsonNode value = row.path(field);
            if (value.isMissingNode() || value.isNull() || value.asText("").isBlank()) {
                continue;
            }
            try {
                return new BigDecimal(value.asText().replace(",", "").trim());
            } catch (NumberFormatException ignored) {
                continue;
            }
        }
        return BigDecimal.ZERO;
    }
}
