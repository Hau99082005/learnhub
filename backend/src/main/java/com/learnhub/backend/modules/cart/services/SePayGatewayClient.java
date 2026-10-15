package com.learnhub.backend.modules.cart.services;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Optional;
import java.util.Set;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.learnhub.backend.config.SePayProperties;
import com.learnhub.backend.modules.cart.dtos.SePayGatewayDTO;
import com.learnhub.backend.modules.cart.models.ShopOrder;
import com.learnhub.backend.modules.instructor.support.VnBanks;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class SePayGatewayClient {
    private static final Logger log = LoggerFactory.getLogger(SePayGatewayClient.class);
    private static final Set<String> SIGNABLE = Set.of(
            "merchant",
            "env",
            "operation",
            "payment_method",
            "order_amount",
            "currency",
            "order_invoice_number",
            "order_description",
            "customer_id",
            "agreement_id",
            "agreement_name",
            "agreement_type",
            "agreement_payment_frequency",
            "agreement_amount_per_payment",
            "success_url",
            "error_url",
            "cancel_url");

    private final SePayProperties sePayProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestClient restClient;
    private volatile String lastMessage = "";

    public SePayGatewayClient(SePayProperties sePayProperties) {
        this.sePayProperties = sePayProperties;
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory();
        factory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    public String lastMessage() {
        return lastMessage;
    }

    public SePayGatewayDTO checkoutForm(ShopOrder order) {
        return checkoutForm(order, CheckoutExtras.empty());
    }

    public SePayGatewayDTO checkoutForm(ShopOrder order, String customData) {
        return checkoutForm(order, new CheckoutExtras(customData, "", "", "", ""));
    }

    public SePayGatewayDTO checkoutForm(ShopOrder order, CheckoutExtras extras) {
        String merchant = trim(sePayProperties.getMerchantId());
        String secret = trim(sePayProperties.getIpnSecret());
        if (merchant.isBlank() || secret.isBlank()) {
            return null;
        }
        CheckoutExtras hint = extras == null ? CheckoutExtras.empty() : extras;
        String amount = order.getTotalAmount() == null
                ? "0"
                : order.getTotalAmount().setScale(0, RoundingMode.DOWN).toPlainString();
        String invoice = order.getOrderCode();
        String base = trim(sePayProperties.getFrontendBaseUrl());
        LinkedHashMap<String, String> fields = new LinkedHashMap<>();
        fields.put("merchant", merchant);
        fields.put("currency", "VND");
        fields.put("order_amount", amount);
        fields.put("operation", "PURCHASE");
        fields.put("order_description", "Thanh toan " + invoice);
        fields.put("payment_method", "BANK_TRANSFER");
        fields.put("order_invoice_number", invoice);
        if (!trim(hint.customerId()).isBlank()) {
            fields.put("customer_id", trim(hint.customerId()));
        }
        if (!base.isBlank()) {
            String returnUrl = base + "/thanh-toan/" + invoice;
            fields.put("success_url", returnUrl + "?payment=success");
            fields.put("error_url", returnUrl + "?payment=error");
            fields.put("cancel_url", returnUrl + "?payment=cancel");
        }
        if (!trim(hint.customData()).isBlank()) {
            fields.put("custom_data", trim(hint.customData()));
        }
        if (!trim(hint.accountNumber()).isBlank()) {
            fields.put("account_number", trim(hint.accountNumber()));
            fields.put("acc", trim(hint.accountNumber()));
        }
        if (!trim(hint.bank()).isBlank()) {
            String bank = trim(hint.bank());
            fields.put("bank", bank);
            fields.put("bank_code", VnBanks.sepayShortName(bank));
            fields.put("bank_short_name", VnBanks.sepayShortName(bank));
        }
        if (!trim(hint.bankAccountId()).isBlank()) {
            fields.put("bank_account_id", trim(hint.bankAccountId()));
        }
        fields.put("signature", sign(fields, secret));
        return new SePayGatewayDTO(sePayProperties.getCheckoutUrl(), fields);
    }

    public record CheckoutExtras(
            String customData,
            String customerId,
            String accountNumber,
            String bank,
            String bankAccountId) {
        public static CheckoutExtras empty() {
            return new CheckoutExtras("", "", "", "", "");
        }
    }

    public Optional<String> findCaptured(String invoiceNumber, BigDecimal amount) {
        String merchant = trim(sePayProperties.getMerchantId());
        String secret = trim(sePayProperties.getIpnSecret());
        if (merchant.isBlank() || secret.isBlank() || invoiceNumber == null || invoiceNumber.isBlank()) {
            return Optional.empty();
        }
        String invoice = invoiceNumber.trim();
        String basic = Base64.getEncoder().encodeToString(
                (merchant + ":" + secret).getBytes(StandardCharsets.UTF_8));
        String[] paths = {
                "/v1/order/detail/" + invoice,
                "/v1/order?q=" + invoice + "&per_page=20",
                "/v1/order?q=" + invoice + "&order_status=CAPTURED&per_page=20",
                "/v1/order?order_status=CAPTURED&per_page=50"
        };
        String lastFail = "";
        for (String path : paths) {
            Optional<String> hit = readCaptured(basic, path, invoice, amount);
            if (hit.isPresent()) {
                return hit;
            }
            if (!lastMessage.isBlank()) {
                lastFail = lastMessage;
            }
        }
        lastMessage = lastFail.isBlank() ? "SePay PG chưa khớp đơn " + invoice : lastFail;
        return Optional.empty();
    }

    private Optional<String> readCaptured(String basic, String path, String invoice, BigDecimal amount) {
        String uri = trim(sePayProperties.getPgApiUrl()) + path;
        try {
            String body = restClient.get()
                    .uri(uri)
                    .header("Authorization", "Basic " + basic)
                    .retrieve()
                    .body(String.class);
            JsonNode root = objectMapper.readTree(body == null ? "{}" : body);
            JsonNode data = root.path("data");
            if (data.isObject() && !data.isEmpty()) {
                return matchRow(data, invoice, amount);
            }
            if (data.isArray()) {
                for (JsonNode row : data) {
                    Optional<String> hit = matchRow(row, invoice, amount);
                    if (hit.isPresent()) {
                        return hit;
                    }
                }
            }
            lastMessage = "SePay PG chưa khớp đơn " + invoice;
            return Optional.empty();
        } catch (RestClientResponseException exception) {
            lastMessage = "SePay PG HTTP " + exception.getStatusCode().value();
            log.warn("SePay PG {} failed: {}", path, exception.getStatusCode().value());
            return Optional.empty();
        } catch (RuntimeException exception) {
            lastMessage = "SePay PG lỗi kết nối";
            log.warn("SePay PG {} error", path, exception);
            return Optional.empty();
        }
    }

    private Optional<String> matchRow(JsonNode row, String invoice, BigDecimal amount) {
        if (row == null || row.isMissingNode() || row.isNull()) {
            return Optional.empty();
        }
        String rowInvoice = firstNonBlank(
                text(row, "order_invoice_number"),
                text(row, "order_id"),
                text(row, "id"));
        if (!invoice.equalsIgnoreCase(rowInvoice)
                && !rowInvoice.toUpperCase().contains(invoice.toUpperCase())
                && !invoice.equalsIgnoreCase(text(row, "order_invoice_number"))) {
            return Optional.empty();
        }
        if (!isPaidStatus(text(row, "order_status"), text(row, "authentication_status"))) {
            return Optional.empty();
        }
        BigDecimal due = amount == null ? BigDecimal.ZERO : amount.setScale(0, RoundingMode.DOWN);
        BigDecimal paid = decimal(row, "order_amount");
        if (due.compareTo(BigDecimal.ZERO) > 0 && paid.compareTo(BigDecimal.ZERO) > 0 && paid.compareTo(due) < 0) {
            return Optional.empty();
        }
        String txn = firstNonBlank(text(row, "order_id"), text(row, "id"), invoice);
        lastMessage = "SePay PG đã thanh toán";
        return Optional.of("SEPAY-" + txn);
    }

    private boolean isPaidStatus(String orderStatus, String authStatus) {
        String status = (orderStatus == null ? "" : orderStatus).trim().toUpperCase();
        String auth = (authStatus == null ? "" : authStatus).trim().toUpperCase();
        return status.equals("CAPTURED")
                || status.equals("PAID")
                || status.equals("SUCCEEDED")
                || status.equals("SUCCESS")
                || status.equals("COMPLETED")
                || status.equals("APPROVED")
                || auth.equals("AUTHENTICATION_SUCCESSFUL")
                || auth.contains("SUCCESS");
    }

    private String sign(LinkedHashMap<String, String> fields, String secret) {
        StringBuilder signed = new StringBuilder();
        for (String field : fields.keySet()) {
            if (!SIGNABLE.contains(field)) {
                continue;
            }
            String value = fields.get(field);
            if (value == null) {
                continue;
            }
            if (!signed.isEmpty()) {
                signed.append(',');
            }
            signed.append(field).append('=').append(value);
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return Base64.getEncoder().encodeToString(mac.doFinal(signed.toString().getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Không tạo được chữ ký SePay", exception);
        }
    }

    private String text(JsonNode node, String field) {
        if (node == null || node.isMissingNode() || node.isNull()) {
            return "";
        }
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return "";
        }
        String text = value.asString();
        return text == null ? "" : text.trim();
    }

    private BigDecimal decimal(JsonNode node, String field) {
        String raw = text(node, field);
        if (raw.isBlank()) {
            return BigDecimal.ZERO;
        }
        try {
            return new BigDecimal(raw.replace(",", "")).setScale(0, RoundingMode.DOWN);
        } catch (NumberFormatException exception) {
            return BigDecimal.ZERO;
        }
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return "";
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return "";
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
