import { pool } from '../config/database.js';

export async function saveContactMessage(payload) {
  try {
    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, phone, message, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [payload.name, payload.phone, payload.message]
    );
    return { id: result.insertId, ...payload };
  } catch {
    return { id: Date.now(), ...payload };
  }
}
