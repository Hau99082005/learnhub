package com.learnhub.backend.modules.instructor.dtos;

public class PublishItemDTO {
    private final String key;
    private final String label;
    private final boolean done;
    private final boolean required;
    private final String href;

    public PublishItemDTO(String key, String label, boolean done, boolean required, String href) {
        this.key = key;
        this.label = label;
        this.done = done;
        this.required = required;
        this.href = href;
    }

    public String getKey() {
        return key;
    }

    public String getLabel() {
        return label;
    }

    public boolean isDone() {
        return done;
    }

    public boolean isRequired() {
        return required;
    }

    public String getHref() {
        return href;
    }
}
