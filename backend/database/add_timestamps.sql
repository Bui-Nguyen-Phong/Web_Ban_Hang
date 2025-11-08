-- Script to add ONLY created_at and updated_at columns
-- Run this if seller_id and description already exist

USE shop;

-- Check if columns already exist before adding
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'shop' 
                   AND TABLE_NAME = 'products' 
                   AND COLUMN_NAME = 'created_at');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER image_url',
    'SELECT "Column created_at already exists" AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = 'shop' 
                   AND TABLE_NAME = 'products' 
                   AND COLUMN_NAME = 'updated_at');

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE products ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at',
    'SELECT "Column updated_at already exists" AS msg');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Display final structure
SELECT 'Products table updated successfully!' AS Status;
DESCRIBE products;
