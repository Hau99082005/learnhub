package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.learnhub.backend.config.SePayProperties;
import com.learnhub.backend.modules.instructor.support.VnBanks;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class SePayTransactionClient {
    private static final Logger log = LoggerFactory.getLogger(SePayTransactionClient.class);
    private static final Pattern ORDER_TOKEN = Pattern.compile("(?:GV\\d+|LH)[0-9A-Z]{4,}", Pattern.CASE_INSENSITIVE);

    private final SePayProperties sePayProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;
    private final Object lock = new Object();
    private List<Hit> cache = List.of();
    private long cacheAt = 0;
    private long blockedUntil = 0;
    private List<LinkedAccount> bankCache = List.of();
    private long bankCacheAt = 0;
    private volatile String lastMessage = "Chưa gọi SePay";

    public SePayTransactionClient(SePayProperties sePayProperties) {
        this.sePayProperties = sePayProperties;
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    public String lastMessage() {
        return lastMessage;
    }

    public void invalidateBankCache() {
        synchronized (lock) {
            bankCache = List.of();
            bankCacheAt = 0;
        }
    }

    public Optional<LinkedAccount> findLinkedAccount(String accountNumber) {
        String expected = digits(accountNumber);
        if (expected.isEmpty()) {
            return Optional.empty();
        }
        for (LinkedAccount row : listLinkedAccounts()) {
            if (expected.equals(digits(row.accountNumber()))) {
                return Optional.of(row);
            }
        }
        return Optional.empty();
    }

    public Optional<LinkedAccount> ensureLinkedAccount(String bankCode, String accountNumber, String accountName, String label) {
        Optional<LinkedAccount> existing = findLinkedAccount(accountNumber);
        if (existing.isPresent()) {
            return existing;
        }
        String token = sePayProperties.getApiToken() == null ? "" : sePayProperties.getApiToken().trim();
        String number = digits(accountNumber);
        if (token.isBlank() || number.isEmpty()) {
            return Optional.empty();
        }
        String shortName = VnBanks.sepayShortName(bankCode);
        String holder = accountName == null ? "" : accountName.trim();
        String tag = label == null || label.isBlank() ? "LearnHub GV " + number : label.trim();
        Map<String, String> payload = new LinkedHashMap<>();
        payload.put("account_number", number);
        payload.put("account_holder_name", holder);
        payload.put("bank_short_name", shortName);
        payload.put("bank_code", shortName);
        payload.put("account_type", "personal");
        payload.put("label", tag);
        String json = objectMapper.writeValueAsString(payload);
        String v2 = sePayProperties.getApiBaseUrl();
        if (v2 == null || v2.isBlank()) {
            v2 = "https://userapi.sepay.vn/v2";
        }
        String root = v2.replaceAll("/$", "");
        List<String> urls = List.of(
                root + "/bank-accounts",
                "https://my.sepay.vn/userapi/bankaccounts",
                "https://my.sepay.vn/userapi/bankaccounts/add");
        for (String url : urls) {
            try {
                String body = restClient.post()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .header("Accept", "application/json")
                        .header("Content-Type", "application/json")
                        .body(json)
                        .retrieve()
                        .body(String.class);
                Optional<LinkedAccount> created = parseCreatedAccount(body == null ? "{}" : body, number);
                if (created.isPresent()) {
                    synchronized (lock) {
                        bankCache = List.of();
                        bankCacheAt = 0;
                    }
                    return created;
                }
            } catch (RestClientResponseException exception) {
                log.warn("SePay create bank HTTP {} {}", exception.getStatusCode().value(), url);
            } catch (RuntimeException exception) {
                log.warn("SePay create bank error {}", url);
            }
        }
        synchronized (lock) {
            bankCache = List.of();
            bankCacheAt = 0;
        }
        return findLinkedAccount(number);
    }

    private Optional<LinkedAccount> parseCreatedAccount(String body, String accountNumber) {
        JsonNode root = objectMapper.readTree(body);
        JsonNode data = root.path("data");
        if (data.isObject() && !data.isEmpty()) {
            String id = firstText(data, "id", "xid");
            String number = firstText(data, "account_number", "accountNumber");
            if (id.isBlank()) {
                id = firstText(root, "id", "xid");
            }
            if (number.isBlank()) {
                number = accountNumber;
            }
            if (!id.isBlank()) {
                return Optional.of(new LinkedAccount(
                        id,
                        number,
                        firstText(data, "account_holder_name", "accountHolderName"),
                        firstText(data, "bank_code", "bankCode", "bank_short_name", "bankShortName")));
            }
        }
        String id = firstText(root, "id", "xid");
        if (!id.isBlank()) {
            return Optional.of(new LinkedAccount(id, accountNumber, "", ""));
        }
        return Optional.empty();
    }

    public List<LinkedAccount> listLinkedAccounts() {
        String token = sePayProperties.getApiToken() == null ? "" : sePayProperties.getApiToken().trim();
        if (token.isBlank()) {
            return List.of();
        }
        long now = System.currentTimeMillis();
        synchronized (lock) {
            if (now - bankCacheAt < 60_000 && !bankCache.isEmpty()) {
                return bankCache;
            }
        }
        String v2 = sePayProperties.getApiBaseUrl();
        if (v2 == null || v2.isBlank()) {
            v2 = "https://userapi.sepay.vn/v2";
        }
        String root = v2.replaceAll("/$", "");
        List<String> urls = List.of(
                root + "/bank-accounts?per_page=100",
                root + "/bank-accounts?active=1&per_page=100",
                "https://my.sepay.vn/userapi/bankaccounts/list");
        for (String url : urls) {
            try {
                String body = restClient.get()
                        .uri(url)
                        .header("Authorization", "Bearer " + token)
                        .header("Accept", "application/json")
                        .retrieve()
                        .body(String.class);
                List<LinkedAccount> rows = parseLinkedAccounts(body == null ? "{}" : body);
                if (!rows.isEmpty()) {
                    synchronized (lock) {
                        bankCache = rows;
                        bankCacheAt = System.currentTimeMillis();
                    }
                    return rows;
                }
            } catch (RestClientResponseException exception) {
                log.warn("SePay bank-accounts HTTP {} {}", exception.getStatusCode().value(), url);
            } catch (RuntimeException exception) {
                log.warn("SePay bank-accounts error {}", url);
            }
        }
        synchronized (lock) {
            return bankCache;
        }
    }

    private List<LinkedAccount> parseLinkedAccounts(String body) {
        JsonNode root = objectMapper.readTree(body);
        List<LinkedAccount> rows = new ArrayList<>();
        JsonNode data = root.path("data");
        if (!data.isArray()) {
            data = root.path("bankaccounts");
        }
        if (!data.isArray()) {
            return rows;
        }
        for (JsonNode row : data) {
            if (row == null || !row.isObject()) {
                continue;
            }
            String id = firstText(row, "id", "xid");
            String number = firstText(row, "account_number", "accountNumber");
            if (id.isBlank() || number.isBlank()) {
                continue;
            }
            String active = firstText(row, "active");
            if ("0".equals(active) || "false".equalsIgnoreCase(active)) {
                continue;
            }
            rows.add(new LinkedAccount(
                    id,
                    number,
                    firstText(row, "account_holder_name", "accountHolderName"),
                    firstText(row, "bank_code", "bankCode", "bank_short_name", "bankShortName")));
        }
        return rows;
    }

    public Optional<Hit> findPaid(String orderCode, BigDecimal amount) {
        return findPaid(orderCode, amount, null);
    }

    public Optional<Hit> findPaid(String orderCode, BigDecimal amount, String accountNumber) {
        BigDecimal due = amount == null ? BigDecimal.ZERO : amount.setScale(0, RoundingMode.DOWN);
        String expected = digits(accountNumber);
        for (Hit hit : listRecentInbound()) {
            if (hit.scaled().compareTo(due) < 0) {
                continue;
            }
            if (!matchesOrder(hit.content(), orderCode)) {
                continue;
            }
            String got = digits(hit.accountNumber());
            if (!expected.isEmpty() && !got.isEmpty() && !expected.equals(got)) {
                continue;
            }
            return Optional.of(hit);
        }
        return Optional.empty();
    }

    private String digits(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D+", "");
    }

    public List<Hit> listRecentInbound() {
        String token = sePayProperties.getApiToken() == null ? "" : sePayProperties.getApiToken().trim();
        if (token.isBlank()) {
            lastMessage = "Thiếu sepay.api-token";
            return List.of();
        }
        long now = System.currentTimeMillis();
        synchronized (lock) {
            if (now < blockedUntil) {
                lastMessage = "SePay đang giới hạn request, dùng dữ liệu vừa lấy";
                return cache;
            }
            if (now - cacheAt < 5000 && !cache.isEmpty()) {
                return cache;
            }
        }
        String lastFail = "";
        for (Call call : listCalls()) {
            try {
                String body = restClient.get()
                        .uri(call.url())
                        .header("Authorization", call.header(token))
                        .header("Accept", "application/json")
                        .header("Content-Type", "application/json")
                        .retrieve()
                        .body(String.class);
                List<Hit> hits = parseHits(body == null ? "{}" : body);
                lastMessage = hits.isEmpty()
                        ? "SePay không có giao dịch vào"
                        : "Đã lấy " + hits.size() + " giao dịch từ SePay";
                synchronized (lock) {
                    cache = hits;
                    cacheAt = System.currentTimeMillis();
                }
                log.info("SePay list size={}", hits.size());
                return hits;
            } catch (RestClientResponseException exception) {
                int status = exception.getStatusCode().value();
                if (status == 429) {
                    synchronized (lock) {
                        blockedUntil = System.currentTimeMillis() + 60_000;
                    }
                    lastMessage = "SePay HTTP 429, chờ 60 giây rồi đối chiếu lại";
                    return cache;
                }
                lastFail = "SePay API HTTP " + status;
                if (status != 401 && status != 403 && status != 404) {
                    break;
                }
            } catch (Exception exception) {
                lastFail = "Không kết nối được API SePay";
            }
        }
        lastMessage = lastFail.isBlank() ? "SePay API HTTP 401" : lastFail;
        return cache;
    }

    private List<Call> listCalls() {
        String v2 = sePayProperties.getApiBaseUrl();
        if (v2 == null || v2.isBlank()) {
            v2 = "https://userapi.sepay.vn/v2";
        }
        String root = v2.replaceAll("/$", "");
        return List.of(
                new Call(root + "/transactions?transfer_type=in&per_page=50", "Bearer"),
                new Call(root + "/transactions?per_page=50", "Bearer"),
                new Call("https://my.sepay.vn/userapi/transactions/list?limit=50", "Bearer"),
                new Call("https://my.sepay.vn/userapi/transactions/list?limit=50", "Apikey"));
    }

    private List<Hit> parseHits(String body) {
        JsonNode root = objectMapper.readTree(body);
        String status = firstText(root, "status");
        if ("401".equals(status) || "403".equals(status) || "error".equalsIgnoreCase(status)) {
            lastMessage = "SePay từ chối token";
            return List.of();
        }
        List<Hit> hits = new ArrayList<>();
        for (JsonNode row : rowsOf(root)) {
            if (!inbound(row)) {
                continue;
            }
            BigDecimal paid = firstDecimal(row, "amount_in", "amountIn", "transferAmount", "amount");
            if (paid.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            String id = firstText(row, "id");
            if (id.isBlank()) {
                continue;
            }
            String content = firstText(row, "transaction_content", "transactionContent", "content", "code")
                    + " " + row.toString();
            hits.add(new Hit(id, paid, content, firstText(row, "account_number", "accountNumber")));
        }
        return hits;
    }

    private List<JsonNode> rowsOf(JsonNode root) {
        List<JsonNode> rows = new ArrayList<>();
        collectArray(root.get("transactions"), rows);
        collectArray(root.get("data"), rows);
        collectArray(root.path("data").path("transactions"), rows);
        return rows;
    }

    private void collectArray(JsonNode node, List<JsonNode> rows) {
        if (node == null || !node.isArray()) {
            return;
        }
        for (JsonNode row : node) {
            if (row != null && row.isObject()) {
                rows.add(row);
            }
        }
    }

    private boolean inbound(JsonNode row) {
        String type = firstText(row, "transfer_type", "transferType");
        if (type.isBlank()) {
            return firstDecimal(row, "amount_in", "amountIn", "transferAmount", "amount")
                    .compareTo(BigDecimal.ZERO) > 0;
        }
        return "in".equalsIgnoreCase(type) || "0".equals(type);
    }

    public static boolean matchesOrder(String blob, String orderCode) {
        if (blob == null || orderCode == null || orderCode.isBlank()) {
            return false;
        }
        String haystack = blob.toUpperCase(Locale.ROOT).replaceAll("[^0-9A-Z]", "");
        String needle = orderCode.toUpperCase(Locale.ROOT).replaceAll("[^0-9A-Z]", "");
        if (needle.isBlank()) {
            return false;
        }
        if (haystack.contains(needle)) {
            return true;
        }
        Matcher matcher = ORDER_TOKEN.matcher(blob.toUpperCase(Locale.ROOT));
        while (matcher.find()) {
            String token = matcher.group().toUpperCase(Locale.ROOT);
            if (needle.equals(token) || needle.startsWith(token) || token.startsWith(needle)) {
                return true;
            }
        }
        return false;
    }

    private String firstText(JsonNode row, String... fields) {
        for (String field : fields) {
            JsonNode value = row.path(field);
            if (!value.isMissingNode() && !value.isNull() && !value.asString("").isBlank()) {
                return value.asString();
            }
        }
        return "";
    }

    private BigDecimal firstDecimal(JsonNode row, String... fields) {
        for (String field : fields) {
            JsonNode value = row.path(field);
            if (value.isMissingNode() || value.isNull() || value.asString("").isBlank()) {
                continue;
            }
            try {
                return new BigDecimal(value.asString().replace(".", "").replace(",", "").trim());
            } catch (NumberFormatException ignored) {
                continue;
            }
        }
        return BigDecimal.ZERO;
    }

    public record LinkedAccount(String id, String accountNumber, String holderName, String bankCode) {
    }

    public record Hit(String id, BigDecimal amountIn, String content, String accountNumber) {
        public BigDecimal scaled() {
            return amountIn == null ? BigDecimal.ZERO : amountIn.setScale(0, RoundingMode.DOWN);
        }

        public String txnId() {
            return "SEPAY-" + id;
        }
    }

    private record Call(String url, String scheme) {
        private String header(String token) {
            return scheme + " " + token;
        }
    }
}
