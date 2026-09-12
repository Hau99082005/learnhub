CREATE TABLE IF NOT EXISTS user_catalogues (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    canonical VARCHAR(50) NOT NULL,
    publish TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_user_catalogues_canonical (canonical)
);
