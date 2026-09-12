SET @fk := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND constraint_name = 'fk_categories_parent'
);
SET @sql := IF(@fk > 0, 'ALTER TABLE categories DROP FOREIGN KEY fk_categories_parent', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chk := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND constraint_name = 'categories_chk_1'
);
SET @sql := IF(@chk > 0, 'ALTER TABLE categories DROP CHECK categories_chk_1', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chk := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND constraint_name = 'categories_chk_2'
);
SET @sql := IF(@chk > 0, 'ALTER TABLE categories DROP CHECK categories_chk_2', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @chk := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND constraint_name = 'categories_chk_3'
);
SET @sql := IF(@chk > 0, 'ALTER TABLE categories DROP CHECK categories_chk_3', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND column_name = 'parent_id'
);
SET @sql := IF(@col > 0, 'ALTER TABLE categories DROP COLUMN parent_id', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND column_name = 'description'
);
SET @sql := IF(@col > 0, 'ALTER TABLE categories DROP COLUMN description', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col := (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND column_name = 'sort_order'
);
SET @sql := IF(@col > 0, 'ALTER TABLE categories DROP COLUMN sort_order', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'categories'
      AND index_name = 'name'
);
SET @sql := IF(@idx > 0, 'ALTER TABLE categories DROP INDEX name', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE categories
    MODIFY name VARCHAR(255) NOT NULL,
    MODIFY slug VARCHAR(255) NOT NULL,
    MODIFY images VARCHAR(500) NOT NULL,
    MODIFY status TINYINT(1) NOT NULL DEFAULT 1;
