import { useState, useEffect } from 'react';
import { Activity, Search, Server, User, Box, Settings, MapPin, Database } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import './ActivityLogs.css';

export function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/activity?page=${page}&action=${actionFilter}`);
      setLogs(res.data.data.logs);
      setTotalPages(res.data.data.totalPages);
      setTotalLogs(res.data.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForAction = (action) => {
    if (action.includes('login') || action.includes('logout')) return <User size={16} />;
    if (action.includes('product') || action.includes('category')) return <Box size={16} />;
    if (action.includes('setting')) return <Settings size={16} />;
    if (action.includes('import')) return <Database size={16} />;
    return <Activity size={16} />;
  };

  const formatMetadata = (metadata) => {
    if (!metadata) return null;
    try {
      const parsed = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      return Object.entries(parsed).map(([k, v]) => (
        <span key={k} className="meta-tag">{k}: {String(v)}</span>
      ));
    } catch {
      return <span>{metadata}</span>;
    }
  };

  return (
    <div className="admin-page activity-logs">
      <div className="page-header">
        <h1>Global Activity Logs</h1>
        <div className="header-actions">
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
            <option value="">All Actions</option>
            <option value="login">Logins</option>
            <option value="update_settings">Settings Updates</option>
            <option value="update_profile">Profile Updates</option>
            <option value="change_password">Password Changes</option>
            <option value="bulk_import">Bulk Imports</option>
          </select>
        </div>
      </div>

      <div className="logs-container">
        <div className="logs-summary">
          <div className="summary-card">
            <strong>{totalLogs}</strong>
            <span>Total Logged Events</span>
          </div>
          <div className="summary-card">
            <strong><Server size={20} color="var(--primary)" /></strong>
            <span>System Health: Optimal</span>
          </div>
        </div>

        <div className="logs-table-wrapper">
          {loading ? (
            <div className="loading-state">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <Activity size={48} color="#ccc" />
              <p>No activity found.</p>
            </div>
          ) : (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Admin</th>
                  <th>Metadata</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div className="action-cell">
                        <span className="action-icon">{getIconForAction(log.action)}</span>
                        <span className="action-name">{log.action.replace(/_/g, ' ')}</span>
                      </div>
                    </td>
                    <td>{log.admin_name || 'System / Deleted User'}</td>
                    <td>
                      <div className="meta-container">
                        {formatMetadata(log.metadata)}
                      </div>
                    </td>
                    <td>{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {totalPages > 1 && (
            <div className="pagination">
              <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span>Page {page} of {totalPages}</span>
              <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
