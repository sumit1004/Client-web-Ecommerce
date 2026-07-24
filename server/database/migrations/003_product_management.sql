-- 003_product_management.sql
-- Upgrade products, product_images, and product_variants tables to support UUIDs and new fields

-- 1. Drop existing foreign keys that reference products
ALTER TABLE product_images DROP FOREIGN KEY fk_images_product;
ALTER TABLE product_variants DROP FOREIGN KEY fk_variants_product;
ALTER TABLE product_collections DROP FOREIGN KEY fk_pc_product;

-- 2. TRUNCATE block removed to prevent wiping data

-- 3. Alter products table
ALTER TABLE products
  MODIFY id VARCHAR(36) NOT NULL,
  ADD COLUMN cost_price DECIMAL(10,2) NULL AFTER sale_price,
  ADD COLUMN gender VARCHAR(50) NULL AFTER brand,
  ADD COLUMN age_group VARCHAR(50) NULL AFTER gender,
  ADD COLUMN color VARCHAR(50) NULL AFTER fabric,
  ADD COLUMN size VARCHAR(50) NULL AFTER color,
  ADD COLUMN weight DECIMAL(10,2) NULL AFTER size,
  ADD COLUMN show_on_homepage BOOLEAN NOT NULL DEFAULT FALSE AFTER trending,
  ADD COLUMN created_by VARCHAR(36) NULL,
  ADD COLUMN updated_by VARCHAR(36) NULL,
  ADD CONSTRAINT fk_products_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_products_updated_by FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL;

-- 4. Alter product_images table
ALTER TABLE product_images
  MODIFY id VARCHAR(36) NOT NULL,
  MODIFY product_id VARCHAR(36) NOT NULL;

-- 5. Alter product_variants table
ALTER TABLE product_variants
  MODIFY id VARCHAR(36) NOT NULL,
  MODIFY product_id VARCHAR(36) NOT NULL;

-- 6. Alter product_collections table
ALTER TABLE product_collections
  MODIFY product_id VARCHAR(36) NOT NULL;

-- 7. Re-add original foreign keys
ALTER TABLE product_images
  ADD CONSTRAINT fk_images_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_variants
  ADD CONSTRAINT fk_variants_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE product_collections
  ADD CONSTRAINT fk_pc_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
