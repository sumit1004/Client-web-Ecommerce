import { useState, useEffect, useRef } from 'react';
import { Bell, AlertCircle, Mail, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../services/apiClient.js';
import './NotificationBell.css';

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'contact': return <Mail size={16} color="var(--primary)" />;
      case 'error': return <AlertCircle size={16} color="#ef4444" />;
      case 'alert': return <AlertTriangle size={16} color="#f59e0b" />;
      default: return <Bell size={16} />;
    }
  };

  return (
    <div className="notification-bell" ref={bellRef}>
      <button className="bell-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={20} />
        {notifications.length > 0 && <span className="notification-badge">{notifications.length}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && <span className="badge">{notifications.length} New</span>}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <Bell size={24} color="#ccc" />
                <p>You're all caught up!</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link to={notif.link} key={notif.id} className="notification-item" onClick={() => setIsOpen(false)}>
                  <div className="notif-icon">{getIcon(notif.type)}</div>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notif-time">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
