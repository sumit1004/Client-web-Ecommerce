import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';

export function SystemSettings() {
  const [data, setData] = useState({
    currency: 'INR', currencySymbol: '₹', timezone: 'Asia/Kolkata', language: 'en',
    taxPercentage: '0', shippingCharges: '0', freeShippingThreshold: '0',
    maintenanceMode: false, cloudinaryCloudName: '', cloudinaryApiKey: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings/system');
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
    const { name, value, type, checked } = e.target;
    setData({ ...data, [name]: type === 'checkbox' ? checked : value });
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/settings/system', data);
      setMessage('System settings saved successfully.');
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
      <h2>System Settings</h2>
      {message && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '16px', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={saveSettings}>
        <div className="media-grid">
          <div className="form-group">
            <label>Currency Code</label>
            <input type="text" name="currency" value={data.currency} onChange={handleChange} placeholder="INR, USD" />
          </div>
          <div className="form-group">
            <label>Currency Symbol</label>
            <input type="text" name="currencySymbol" value={data.currencySymbol} onChange={handleChange} placeholder="₹, $" />
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <input type="text" name="timezone" value={data.timezone} onChange={handleChange} placeholder="Asia/Kolkata" />
          </div>
          <div className="form-group">
            <label>Default Language</label>
            <input type="text" name="language" value={data.language} onChange={handleChange} placeholder="en" />
          </div>
        </div>

        <h3 style={{marginTop: '24px', marginBottom: '16px', fontSize: '16px'}}>Billing & Shipping</h3>
        <div className="media-grid">
          <div className="form-group">
            <label>Global Tax Percentage (%)</label>
            <input type="number" step="0.01" name="taxPercentage" value={data.taxPercentage} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Flat Shipping Charges</label>
            <input type="number" step="0.01" name="shippingCharges" value={data.shippingCharges} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Free Shipping Threshold (Amount)</label>
            <input type="number" step="0.01" name="freeShippingThreshold" value={data.freeShippingThreshold} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{marginTop: '24px', marginBottom: '16px', fontSize: '16px'}}>Third Party Identifiers</h3>
        <div className="media-grid">
          <div className="form-group">
            <label>Cloudinary Cloud Name</label>
            <input type="text" name="cloudinaryCloudName" value={data.cloudinaryCloudName} onChange={handleChange} />
          </div>
        </div>

        <h3 style={{marginTop: '24px', marginBottom: '16px', fontSize: '16px'}}>Danger Zone</h3>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', color: '#ef4444', fontWeight: '500' }}>
          <input type="checkbox" name="maintenanceMode" checked={data.maintenanceMode} onChange={handleChange} />
          Enable Maintenance Mode (Takes website offline)
        </label>

        <Button type="submit" disabled={saving} style={{ marginTop: '24px' }}>
          {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} style={{marginRight: '8px'}} />}
          Save System Settings
        </Button>
      </form>
    </div>
  );
}
