-- 002_category_management.sql
-- Upgrade categories table to support UUIDs and new fields

-- 1. Drop existing foreign keys to allow altering the columns
ALTER TABLE products DROP FOREIGN KEY fk_products_category;
ALTER TABLE categories DROP FOREIGN KEY fk_categories_parent;

-- 2. Alter categories table
ALTER TABLE categories
  MODIFY id VARCHAR(36) NOT NULL,
  MODIFY parent_id VARCHAR(36) NULL,
  ADD COLUMN icon VARCHAR(200) NULL AFTER banner_url,
  ADD COLUMN show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE AFTER featured,
  MODIFY status ENUM('draft', 'published', 'hidden', 'disabled') NOT NULL DEFAULT 'published',
  ADD COLUMN created_by VARCHAR(36) NULL,
  ADD COLUMN updated_by VARCHAR(36) NULL,
  ADD COLUMN deleted_at DATETIME NULL;

-- 3. Add Foreign Keys for Audit Logs
ALTER TABLE categories
  ADD CONSTRAINT fk_categories_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_categories_updated_by FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL;

-- 4. Alter products table category_id
ALTER TABLE products
  MODIFY category_id VARCHAR(36) NULL;

-- 5. Re-add original foreign keys
ALTER TABLE categories
  ADD CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL;

ALTER TABLE products
  ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
