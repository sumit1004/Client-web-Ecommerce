import { pool } from '../config/database.js';

export async function saveContactMessage(payload) {
  const [result] = await pool.query(
    'INSERT INTO contact_messages (name, phone, message, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [payload.name, payload.phone, payload.message]
  );
  return { id: result.insertId, ...payload };
}

export async function getContactMessages(page = 1, limit = 20, status = '') {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM contact_messages';
  let params = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const [rows] = await pool.query(query, params);
  
  let countQuery = 'SELECT COUNT(*) as total FROM contact_messages';
  let countParams = [];
  if (status) {
    countQuery += ' WHERE status = ?';
    countParams.push(status);
  }
  const [countRows] = await pool.query(countQuery, countParams);

  return {
    messages: rows,
    total: countRows[0].total,
    page: Number(page),
    totalPages: Math.ceil(countRows[0].total / limit)
  };
}

export async function updateContactStatus(id, status) {
  await pool.query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
  return { id, status };
}

export async function deleteContactMessage(id) {
  await pool.query('DELETE FROM contact_messages WHERE id = ?', [id]);
  return { id };
}
