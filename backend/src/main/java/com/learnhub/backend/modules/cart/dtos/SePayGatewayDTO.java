package com.learnhub.backend.modules.cart.dtos;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class SePayGatewayDTO {
    private final String action;
    private final List<Map<String, String>> fields;

    public SePayGatewayDTO(String action, LinkedHashMap<String, String> fields) {
        this.action = action;
        List<Map<String, String>> rows = new ArrayList<>();
        if (fields != null) {
            fields.forEach((name, value) -> {
                Map<String, String> row = new LinkedHashMap<>();
                row.put("name", name);
                row.put("value", value == null ? "" : value);
                rows.add(row);
            });
        }
        this.fields = rows;
    }

    public String getAction() {
        return action;
    }

    public List<Map<String, String>> getFields() {
        return fields;
    }
}
