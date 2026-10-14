package com.learnhub.backend.modules.instructor.dtos;

public class ToolCheckRequest {
    private String key;
    private Boolean checked;

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public Boolean getChecked() {
        return checked;
    }

    public void setChecked(Boolean checked) {
        this.checked = checked;
    }
}
