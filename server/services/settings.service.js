import { pool } from '../config/database.js';

export const settingsService = {
  getSettingsByGroup: async (groupKey) => {
    const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [groupKey]);
    return rows.length > 0 ? rows[0].setting_value : {};
  },

  getAllSettings: async () => {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
    const allSettings = {};
    for (const row of rows) {
      allSettings[row.setting_key] = row.setting_value;
    }
    return allSettings;
  },

  updateSettings: async (groupKey, newValues, adminId) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [existing] = await connection.query('SELECT id, setting_value FROM settings WHERE setting_key = ?', [groupKey]);
      
      let mergedValues = newValues;
      if (groupKey === 'business' && mergedValues.whatsapp) {
        mergedValues.whatsapp = mergedValues.whatsapp.replace(/\D/g, '');
      }
      if (existing.length > 0) {
        // Merge with existing JSON to avoid overwriting unrelated fields in the same group if partial update
        mergedValues = { ...existing[0].setting_value, ...newValues };
        await connection.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [JSON.stringify(mergedValues), groupKey]);
      } else {
        await connection.query('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [groupKey, JSON.stringify(mergedValues)]);
      }

      await connection.query('INSERT INTO activity_logs (id, admin_id, action, metadata) VALUES (UUID(), ?, ?, ?)', [
        adminId, 'update_settings', JSON.stringify({ group: groupKey })
      ]);

      await connection.commit();
      return mergedValues;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};
