SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'category_id');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN category_id BIGINT NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'images');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN images VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'preview_video');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN preview_video VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'slug');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN slug VARCHAR(255) NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'subtitle');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN subtitle VARCHAR(500) NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'description');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN description TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'language');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN language VARCHAR(10) NOT NULL DEFAULT ''vi''', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'level');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN level VARCHAR(20) NOT NULL DEFAULT ''ALL''', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'price');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN price DECIMAL(12,2) NOT NULL DEFAULT 0.00', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'compare_at_price');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN compare_at_price DECIMAL(12,2) NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'currency');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN currency CHAR(3) NOT NULL DEFAULT ''VND''', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'is_free');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN is_free TINYINT(1) NOT NULL DEFAULT 1', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'issues_certificate');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN issues_certificate TINYINT(1) NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'duration_seconds');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN duration_seconds INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'enrolled_count');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN enrolled_count INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'rating_avg');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'rating_count');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN rating_count INT NOT NULL DEFAULT 0', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'what_you_will_learn');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN what_you_will_learn TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'requirements');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN requirements TEXT NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'published_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN published_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'deleted_at');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD COLUMN deleted_at DATETIME NULL', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

UPDATE courses
SET slug = CONCAT('khoa-hoc-', id)
WHERE slug IS NULL OR slug = '';

SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND INDEX_NAME = 'uk_courses_slug');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD UNIQUE KEY uk_courses_slug (slug)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND INDEX_NAME = 'idx_courses_public');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD KEY idx_courses_public (status, deleted_at, published_at)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND CONSTRAINT_NAME = 'fk_courses_thumbnail');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE courses DROP FOREIGN KEY fk_courses_thumbnail', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND CONSTRAINT_NAME = 'fk_courses_preview_video');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE courses DROP FOREIGN KEY fk_courses_preview_video', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND INDEX_NAME = 'fk_courses_thumbnail');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE courses DROP INDEX fk_courses_thumbnail', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND INDEX_NAME = 'fk_courses_preview_video');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE courses DROP INDEX fk_courses_preview_video', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'thumbnail_id');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE courses DROP COLUMN thumbnail_id', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND COLUMN_NAME = 'preview_video_id');
SET @sqlstmt := IF(@exist > 0, 'ALTER TABLE courses DROP COLUMN preview_video_id', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses' AND CONSTRAINT_NAME = 'fk_courses_category');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE courses ADD CONSTRAINT fk_courses_category FOREIGN KEY (category_id) REFERENCES categories (id)', 'SELECT 1');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
