import { useState, useEffect } from 'react';
import { Save, Loader2, UploadCloud, X } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';

export function BusinessSettings() {
  const [data, setData] = useState({
    storeName: '', tagline: '', description: '', email: '', phone: '', whatsapp: '',
    gstNumber: '', address: '', googleMapsLink: '', workingHours: '', logoUrl: '', faviconUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings/business');
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

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const res = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(prev => ({ ...prev, [field]: res.data.data.url }));
    } catch (err) {
      console.error('Failed to upload', err);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/settings/business', data);
      setMessage('Settings saved successfully.');
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
      <h2>Business Information</h2>
      {message && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '16px', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={saveSettings} className="form-grid">
        <div className="main-column" style={{ width: '100%' }}>
          <div className="media-grid">
            <div className="form-group">
              <label>Store Name</label>
              <input type="text" name="storeName" value={data.storeName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Tagline</label>
              <input type="text" name="tagline" value={data.tagline} onChange={handleChange} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={data.description} onChange={handleChange} rows={3}></textarea>
          </div>

          <div className="media-grid">
            <div className="form-group">
              <label>Logo</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {data.logoUrl && <img src={data.logoUrl} alt="Logo" style={{height: '40px', objectFit: 'contain'}} />}
                <label className="btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px' }}>
                  <UploadCloud size={16} /> Upload
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
                </label>
                {data.logoUrl && <Button type="button" onClick={() => setData({...data, logoUrl: ''})} style={{background: 'transparent', color: 'red', border: 'none'}}><X size={16}/></Button>}
              </div>
            </div>
            <div className="form-group">
              <label>Favicon</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {data.faviconUrl && <img src={data.faviconUrl} alt="Favicon" style={{height: '40px', objectFit: 'contain'}} />}
                <label className="btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px' }}>
                  <UploadCloud size={16} /> Upload
                  <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'faviconUrl')} />
                </label>
                {data.faviconUrl && <Button type="button" onClick={() => setData({...data, faviconUrl: ''})} style={{background: 'transparent', color: 'red', border: 'none'}}><X size={16}/></Button>}
              </div>
            </div>
          </div>

          <div className="media-grid">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" name="email" value={data.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="text" name="phone" value={data.phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="text" name="whatsapp" value={data.whatsapp} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>GST Number</label>
              <input type="text" name="gstNumber" value={data.gstNumber} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Business Address</label>
            <textarea name="address" value={data.address} onChange={handleChange} rows={2}></textarea>
          </div>

          <div className="media-grid">
            <div className="form-group">
              <label>Google Maps Link</label>
              <input type="text" name="googleMapsLink" value={data.googleMapsLink} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Working Hours</label>
              <input type="text" name="workingHours" value={data.workingHours} onChange={handleChange} placeholder="e.g. Mon-Sat: 10AM - 8PM" />
            </div>
          </div>

          <Button type="submit" disabled={saving} style={{ marginTop: '16px' }}>
            {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} style={{marginRight: '8px'}} />}
            Save Business Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
