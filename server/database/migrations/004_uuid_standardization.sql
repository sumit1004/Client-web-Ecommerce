-- 004_uuid_standardization.sql
-- Fix architecture inconsistencies where UUID references were mixed with INTEGER columns

-- 1. product_collections (Drop FKs before altering collections.id)
ALTER TABLE product_collections DROP FOREIGN KEY fk_pc_collection;

-- 2. collections
ALTER TABLE collections MODIFY id BIGINT NOT NULL;
ALTER TABLE collections MODIFY id VARCHAR(36) NOT NULL;
ALTER TABLE collections ADD COLUMN created_by VARCHAR(36) NULL;
ALTER TABLE collections ADD COLUMN updated_by VARCHAR(36) NULL;
ALTER TABLE collections ADD CONSTRAINT fk_collections_created_by FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL;
ALTER TABLE collections ADD CONSTRAINT fk_collections_updated_by FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL;

-- 3. product_collections (Re-add FK)
ALTER TABLE product_collections MODIFY collection_id VARCHAR(36) NOT NULL;
ALTER TABLE product_collections ADD CONSTRAINT fk_pc_collection FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;

-- 4. media_library
ALTER TABLE media_library MODIFY id BIGINT NOT NULL;
ALTER TABLE media_library MODIFY id VARCHAR(36) NOT NULL;
ALTER TABLE media_library MODIFY uploaded_by VARCHAR(36) NULL;


ALTER TABLE media_library ADD CONSTRAINT fk_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES admins(id) ON DELETE SET NULL;

-- 5. contact_messages
ALTER TABLE contact_messages MODIFY id BIGINT NOT NULL;
ALTER TABLE contact_messages MODIFY id VARCHAR(36) NOT NULL;
ALTER TABLE contact_messages ADD COLUMN assigned_to VARCHAR(36) NULL;
ALTER TABLE contact_messages ADD CONSTRAINT fk_contact_assigned_to FOREIGN KEY (assigned_to) REFERENCES admins(id) ON DELETE SET NULL;

-- 6. activity_logs
ALTER TABLE activity_logs MODIFY id BIGINT NOT NULL;
ALTER TABLE activity_logs MODIFY id VARCHAR(36) NOT NULL;
ALTER TABLE activity_logs ADD COLUMN user_id VARCHAR(36) NULL;

-- 7. pending_images
ALTER TABLE pending_images MODIFY id BIGINT NOT NULL;
ALTER TABLE pending_images MODIFY id VARCHAR(36) NOT NULL;

-- 8. failed_imports
ALTER TABLE failed_imports MODIFY id BIGINT NOT NULL;
ALTER TABLE failed_imports MODIFY id VARCHAR(36) NOT NULL;

-- 9. bulk_import_history
ALTER TABLE bulk_import_history MODIFY id BIGINT NOT NULL;
ALTER TABLE bulk_import_history MODIFY id VARCHAR(36) NOT NULL;

-- 10. settings
ALTER TABLE settings MODIFY id BIGINT NOT NULL;
ALTER TABLE settings MODIFY id VARCHAR(36) NOT NULL;
