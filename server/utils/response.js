export function ok(res, message, data = {}, meta = {}) {
  return res.json({ success: true, message, data, meta });
}

export function created(res, message, data = {}) {
  return res.status(201).json({ success: true, message, data, meta: {} });
}

export function badRequest(res, message) {
  return res.status(400).json({ success: false, message });
}
