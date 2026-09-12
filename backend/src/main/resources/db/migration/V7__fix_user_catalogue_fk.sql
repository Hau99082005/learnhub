UPDATE users u
LEFT JOIN user_catalogues c ON c.id = u.user_catalogue_id
SET u.user_catalogue_id = (
    SELECT id FROM (SELECT id FROM user_catalogues WHERE canonical = 'user' LIMIT 1) t
)
WHERE u.user_catalogue_id IS NOT NULL
  AND c.id IS NULL;

SET @fk := (
    SELECT COUNT(*)
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = 'users'
      AND constraint_name = 'fk_users_user_catalogue'
);
SET @sql := IF(
    @fk = 0,
    'ALTER TABLE users ADD CONSTRAINT fk_users_user_catalogue FOREIGN KEY (user_catalogue_id) REFERENCES user_catalogues (id)',
    'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
