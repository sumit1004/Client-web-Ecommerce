export function ok(res, message, data = {}, meta = {}) {
  return res.json({ success: true, message, data, meta });
}

export function created(res, message, data = {}) {
  return res.status(201).json({ success: true, message, data, meta: {} });
}
