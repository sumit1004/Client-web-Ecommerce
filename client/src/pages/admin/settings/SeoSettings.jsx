import { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';

export function SeoSettings() {
  const [data, setData] = useState({
    siteTitle: '', metaTitle: '', metaDescription: '', metaKeywords: '',
    canonicalUrl: '', googleVerification: '', bingVerification: '',
    robotsTxt: '', schemaOrgJsonLd: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings/seo');
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
      await apiClient.put('/settings/seo', data);
      setMessage('SEO settings saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save SEO settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="settings-card">
      <h2>Global SEO Settings</h2>
      {message && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '16px', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={saveSettings}>
        <div className="form-group">
          <label>Site Title (Appended to all pages)</label>
          <input type="text" name="siteTitle" value={data.siteTitle} onChange={handleChange} placeholder="e.g. | Pasand Showroom" />
        </div>
        
        <div className="form-group">
          <label>Default Meta Title</label>
          <input type="text" name="metaTitle" value={data.metaTitle} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Default Meta Description</label>
          <textarea name="metaDescription" value={data.metaDescription} onChange={handleChange} rows={3}></textarea>
        </div>

        <div className="form-group">
          <label>Meta Keywords (Comma separated)</label>
          <input type="text" name="metaKeywords" value={data.metaKeywords} onChange={handleChange} />
        </div>

        <div className="media-grid">
          <div className="form-group">
            <label>Google Site Verification ID</label>
            <input type="text" name="googleVerification" value={data.googleVerification} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Bing Site Verification ID</label>
            <input type="text" name="bingVerification" value={data.bingVerification} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Robots.txt Content</label>
          <textarea name="robotsTxt" value={data.robotsTxt} onChange={handleChange} rows={5} style={{fontFamily: 'monospace'}}></textarea>
        </div>

        <div className="form-group">
          <label>Schema.org Organization JSON-LD</label>
          <textarea name="schemaOrgJsonLd" value={data.schemaOrgJsonLd} onChange={handleChange} rows={6} style={{fontFamily: 'monospace'}} placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}'></textarea>
        </div>

        <Button type="submit" disabled={saving} style={{ marginTop: '16px' }}>
          {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} style={{marginRight: '8px'}} />}
          Save SEO Settings
        </Button>
      </form>
    </div>
  );
}
