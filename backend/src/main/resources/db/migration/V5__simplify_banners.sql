SET @idx := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'banners'
      AND index_name = 'idx_banners_active_sort'
);
SET @sql := IF(@idx > 0, 'ALTER TABLE banners DROP INDEX idx_banners_active_sort', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'banners'
      AND column_name IN ('subtitle', 'link_url', 'button_text', 'sort_order')
);
SET @sql := IF(
    @col > 0,
    'ALTER TABLE banners DROP COLUMN subtitle, DROP COLUMN link_url, DROP COLUMN button_text, DROP COLUMN sort_order',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'banners'
      AND index_name = 'idx_banners_active'
);
SET @sql := IF(@idx = 0, 'CREATE INDEX idx_banners_active ON banners (is_active)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
