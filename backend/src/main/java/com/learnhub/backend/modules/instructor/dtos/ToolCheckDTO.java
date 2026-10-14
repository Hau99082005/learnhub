package com.learnhub.backend.modules.instructor.dtos;

public class ToolCheckDTO {
    private final String key;
    private final String label;
    private final String hint;
    private final boolean checked;

    public ToolCheckDTO(String key, String label, String hint, boolean checked) {
        this.key = key;
        this.label = label;
        this.hint = hint;
        this.checked = checked;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public String getHint() {
        return hint;
    }

    public boolean isChecked() {
        return checked;
    }
}
