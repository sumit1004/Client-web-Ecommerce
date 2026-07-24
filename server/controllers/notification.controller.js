import { pool } from '../config/database.js';
import { ok } from '../utils/response.js';

export async function getNotifications(req, res, next) {
  try {
    const notifications = [];

    // 1. Unread Contact Messages
    const [contactRows] = await pool.query('SELECT COUNT(*) as unreadCount FROM contact_messages WHERE status = "new"');
    if (contactRows[0].unreadCount > 0) {
      notifications.push({
        id: 'contact_unread',
        type: 'contact',
        title: 'New Contact Messages',
        message: `You have ${contactRows[0].unreadCount} unread contact messages.`,
        link: '/admin/contacts',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Low Stock Alerts
    const [stockRows] = await pool.query('SELECT COUNT(*) as lowStockCount FROM products WHERE stock <= low_stock_threshold');
    if (stockRows[0].lowStockCount > 0) {
      notifications.push({
        id: 'low_stock',
        type: 'alert',
        title: 'Low Stock Alert',
        message: `${stockRows[0].lowStockCount} products are running low on stock.`,
        link: '/admin/products',
        timestamp: new Date().toISOString()
      });
    }

    // 3. System Alerts (could check last failed imports)
    const [importRows] = await pool.query('SELECT COUNT(*) as failedCount FROM failed_imports');
    if (importRows[0].failedCount > 0) {
      notifications.push({
        id: 'failed_import',
        type: 'error',
        title: 'Import Errors',
        message: `There are ${importRows[0].failedCount} unresolved import errors.`,
        link: '/admin/import',
        timestamp: new Date().toISOString()
      });
    }

    ok(res, 'Notifications fetched', notifications);
  } catch (error) {
    next(error);
  }
}
