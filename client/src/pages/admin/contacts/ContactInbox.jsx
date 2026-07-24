import { useState, useEffect } from 'react';
import { Mail, Search, Trash2, CheckCircle, Clock } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import './ContactInbox.css';

export function ContactInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);

  useEffect(() => {
    fetchMessages();
  }, [page, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/contact?page=${page}&status=${statusFilter}`);
      setMessages(res.data.data.messages);
      setTotalPages(res.data.data.totalPages);
      setTotalMessages(res.data.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await apiClient.patch(`/contact/${id}/status`, { status: newStatus });
      fetchMessages();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await apiClient.delete(`/contact/${id}`);
      fetchMessages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete message');
    }
  };

  return (
    <div className="admin-page contact-inbox">
      <div className="page-header">
        <h1>Contact Inbox</h1>
        <div className="header-actions">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Messages</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="inbox-container">
        <div className="inbox-sidebar">
          <div className="sidebar-stats">
            <strong>{totalMessages}</strong>
            <span>Total Messages</span>
          </div>
          <ul className="status-list">
            <li className={statusFilter === '' ? 'active' : ''} onClick={() => setStatusFilter('')}><Mail size={16}/> All</li>
            <li className={statusFilter === 'new' ? 'active' : ''} onClick={() => setStatusFilter('new')}><Clock size={16} color="var(--primary)"/> New</li>
            <li className={statusFilter === 'read' ? 'active' : ''} onClick={() => setStatusFilter('read')}><Mail size={16} color="gray"/> Read</li>
            <li className={statusFilter === 'resolved' ? 'active' : ''} onClick={() => setStatusFilter('resolved')}><CheckCircle size={16} color="green"/> Resolved</li>
          </ul>
        </div>
        
        <div className="inbox-content">
          {loading ? (
            <div className="loading-state">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <Mail size={48} color="#ccc" />
              <p>No messages found.</p>
            </div>
          ) : (
            <div className="message-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message-card status-${msg.status}`}>
                  <div className="msg-header">
                    <div className="msg-info">
                      <span className="msg-name">{msg.name}</span>
                      <span className="msg-phone">{msg.phone}</span>
                      <span className="msg-date">{new Date(msg.created_at).toLocaleString()}</span>
                    </div>
                    <div className="msg-status-badge">{msg.status}</div>
                  </div>
                  <div className="msg-body">
                    {msg.message}
                  </div>
                  <div className="msg-actions">
                    {msg.status === 'new' && <Button onClick={() => updateStatus(msg.id, 'read')} className="btn-sm btn-secondary">Mark Read</Button>}
                    {msg.status !== 'resolved' && <Button onClick={() => updateStatus(msg.id, 'resolved')} className="btn-sm">Resolve</Button>}
                    <button onClick={() => deleteMessage(msg.id)} className="btn-icon text-red" title="Delete"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
              
              {totalPages > 1 && (
                <div className="pagination">
                  <Button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
                  <span>Page {page} of {totalPages}</span>
                  <Button disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
