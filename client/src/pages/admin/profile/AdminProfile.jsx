import { useState, useEffect } from 'react';
import { User, Lock, Clock, Save, Shield, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import './AdminProfile.css';

export function AdminProfile() {
  const [profile, setProfile] = useState({ name: '', email: '', role: '', profile_image: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loginHistory, setLoginHistory] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchLoginHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/admin/profile');
      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const res = await apiClient.get('/admin/login-history');
      setLoginHistory(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.put('/admin/profile', { name: profile.name, profile_image: profile.profile_image });
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setPassLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.post('/admin/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      setSuccess('Password changed successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="admin-page admin-profile-page">
      <div className="page-header">
        <h1>Admin Profile</h1>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <div className="profile-grid">
        <div className="profile-column">
          <div className="profile-card">
            <div className="card-header">
              <User size={18} />
              <h2>Basic Information</h2>
            </div>
            <form onSubmit={saveProfile}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" name="name" value={profile.name} onChange={handleProfileChange} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={profile.email} disabled className="disabled-input" />
                <small className="help-text">Email address cannot be changed</small>
              </div>
              <div className="form-group">
                <label>Role</label>
                <div className="role-badge">
                  {profile.role === 'superadmin' ? <ShieldCheck size={14}/> : <Shield size={14}/>}
                  {profile.role}
                </div>
              </div>
              <Button type="submit" disabled={loading}>
                <Save size={16} /> Save Changes
              </Button>
            </form>
          </div>

          <div className="profile-card">
            <div className="card-header">
              <Lock size={18} />
              <h2>Change Password</h2>
            </div>
            <form onSubmit={savePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input type="password" name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} required />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required minLength={8} />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required minLength={8} />
              </div>
              <Button type="submit" disabled={passLoading}>
                <Lock size={16} /> Update Password
              </Button>
            </form>
          </div>
        </div>

        <div className="profile-column">
          <div className="profile-card history-card">
            <div className="card-header">
              <Clock size={18} />
              <h2>Recent Login History</h2>
            </div>
            {loginHistory.length === 0 ? (
              <p className="no-data">No recent login history found.</p>
            ) : (
              <ul className="history-list">
                {loginHistory.map((log, index) => (
                  <li key={index}>
                    <div className="history-icon"><Clock size={14} /></div>
                    <div className="history-details">
                      <span className="history-time">{new Date(log.time).toLocaleString()}</span>
                      <span className="history-action">Login successful</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
