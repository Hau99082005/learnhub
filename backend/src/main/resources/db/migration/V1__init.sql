CREATE TABLE IF NOT EXISTS app_meta (
    id BIGINT NOT NULL AUTO_INCREMENT,
    meta_key VARCHAR(64) NOT NULL,
    meta_value VARCHAR(255) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_app_meta_key (meta_key)
);
