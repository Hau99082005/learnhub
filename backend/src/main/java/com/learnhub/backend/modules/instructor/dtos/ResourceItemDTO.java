package com.learnhub.backend.modules.instructor.dtos;

public class ResourceItemDTO {
    private final String key;
    private final String title;
    private final String summary;
    private final String body;
    private final String href;
    private final String hrefLabel;
    private final boolean checked;

    public ResourceItemDTO(
            String key,
            String title,
            String summary,
            String body,
            String href,
            String hrefLabel,
            boolean checked) {
        this.key = key;
        this.title = title;
        this.summary = summary;
        this.body = body;
        this.href = href;
        this.hrefLabel = hrefLabel;
        this.checked = checked;
    }

    public String getKey() {
        return key;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public String getBody() {
        return body;
    }

    public String getHref() {
        return href;
    }

    public String getHrefLabel() {
        return hrefLabel;
    }

    public boolean isChecked() {
        return checked;
    }
}
