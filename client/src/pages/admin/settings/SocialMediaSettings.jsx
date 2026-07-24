import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';

export function SocialMediaSettings() {
  const [data, setData] = useState({
    facebook: '', instagram: '', youtube: '', linkedin: '', twitter: '', pinterest: '', threads: '', telegram: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings/social');
      if (res.data.data) {
        setData(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/settings/social', data);
      setMessage('Social media links saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="settings-card">
      <h2>Social Media Links</h2>
      {message && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '16px', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={saveSettings}>
        <div className="media-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {['facebook', 'instagram', 'youtube', 'linkedin', 'twitter', 'pinterest', 'threads', 'telegram'].map(platform => (
            <div className="form-group" key={platform}>
              <label style={{ textTransform: 'capitalize' }}>{platform}</label>
              <input type="url" name={platform} value={data[platform]} onChange={handleChange} placeholder={`https://${platform}.com/...`} />
            </div>
          ))}
        </div>

        <Button type="submit" disabled={saving} style={{ marginTop: '16px' }}>
          {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} style={{marginRight: '8px'}} />}
          Save Links
        </Button>
      </form>
    </div>
  );
}
