CREATE TABLE IF NOT EXISTS instructor_onboarding (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    teaching_format VARCHAR(64) NOT NULL,
    recording_experience VARCHAR(64) NOT NULL,
    audience_size VARCHAR(64) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_instructor_onboarding_user (user_id),
    CONSTRAINT fk_instructor_onboarding_user FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS courses (
    id BIGINT NOT NULL AUTO_INCREMENT,
    instructor_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    PRIMARY KEY (id),
    KEY idx_courses_instructor (instructor_id),
    CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id)
);
