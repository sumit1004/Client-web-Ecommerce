import { useState, useEffect } from 'react';
import { Save, Loader2, UploadCloud, X } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';

export function HomepageCms() {
  const [data, setData] = useState({
    announcementBar: { enabled: true, text: 'Welcome to our store!', link: '' },
    hero: { heading: '', subheading: '', buttonText: '', buttonLink: '', backgroundImage: '' },
    about: { heading: '', content: '' }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings/homepage');
      if (res.data.data) {
        // Deep merge for nested state
        setData(prev => ({
          announcementBar: { ...prev.announcementBar, ...(res.data.data.announcementBar || {}) },
          hero: { ...prev.hero, ...(res.data.data.hero || {}) },
          about: { ...prev.about, ...(res.data.data.about || {}) }
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNestedChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (e, section, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);
    try {
      const res = await apiClient.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleNestedChange(section, field, res.data.data.url);
    } catch (err) {
      console.error('Failed to upload', err);
    }
  };

  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await apiClient.put('/settings/homepage', data);
      setMessage('Homepage CMS saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save CMS settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="settings-card">
      <h2>Homepage CMS</h2>
      {message && <div style={{ padding: '10px', background: '#dcfce7', color: '#166534', marginBottom: '16px', borderRadius: '4px' }}>{message}</div>}
      
      <form onSubmit={saveSettings}>
        
        <h3 style={{fontSize: '16px', marginBottom: '16px'}}>Announcement Bar</h3>
        <div style={{ background: 'var(--secondary-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontWeight: '500' }}>
            <input type="checkbox" checked={data.announcementBar.enabled} onChange={(e) => handleNestedChange('announcementBar', 'enabled', e.target.checked)} />
            Enable Announcement Bar
          </label>
          <div className="media-grid">
            <div className="form-group">
              <label>Announcement Text</label>
              <input type="text" value={data.announcementBar.text} onChange={(e) => handleNestedChange('announcementBar', 'text', e.target.value)} disabled={!data.announcementBar.enabled} />
            </div>
            <div className="form-group">
              <label>Link (Optional)</label>
              <input type="text" value={data.announcementBar.link} onChange={(e) => handleNestedChange('announcementBar', 'link', e.target.value)} disabled={!data.announcementBar.enabled} />
            </div>
          </div>
        </div>

        <h3 style={{fontSize: '16px', marginBottom: '16px'}}>Hero Section</h3>
        <div style={{ background: 'var(--secondary-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div className="form-group">
            <label>Hero Heading</label>
            <input type="text" value={data.hero.heading} onChange={(e) => handleNestedChange('hero', 'heading', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Hero Subheading</label>
            <textarea value={data.hero.subheading} onChange={(e) => handleNestedChange('hero', 'subheading', e.target.value)} rows={2}></textarea>
          </div>
          <div className="media-grid">
            <div className="form-group">
              <label>Button Text</label>
              <input type="text" value={data.hero.buttonText} onChange={(e) => handleNestedChange('hero', 'buttonText', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Button Link</label>
              <input type="text" value={data.hero.buttonLink} onChange={(e) => handleNestedChange('hero', 'buttonLink', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Hero Background Image</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: '#fff', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
              {data.hero.backgroundImage && <img src={data.hero.backgroundImage} alt="Hero" style={{height: '60px', width: '100px', objectFit: 'cover', borderRadius: '4px'}} />}
              <label className="btn-secondary" style={{ cursor: 'pointer', padding: '6px 12px' }}>
                <UploadCloud size={16} /> Upload Background
                <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileUpload(e, 'hero', 'backgroundImage')} />
              </label>
              {data.hero.backgroundImage && <Button type="button" onClick={() => handleNestedChange('hero', 'backgroundImage', '')} style={{background: 'transparent', color: 'red', border: 'none'}}><X size={16}/></Button>}
            </div>
          </div>
        </div>

        <h3 style={{fontSize: '16px', marginBottom: '16px'}}>About Section</h3>
        <div style={{ background: 'var(--secondary-bg)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div className="form-group">
            <label>Heading</label>
            <input type="text" value={data.about.heading} onChange={(e) => handleNestedChange('about', 'heading', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Content</label>
            <textarea value={data.about.content} onChange={(e) => handleNestedChange('about', 'content', e.target.value)} rows={4}></textarea>
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="spinner" size={16} /> : <Save size={16} style={{marginRight: '8px'}} />}
          Save Homepage CMS
        </Button>
      </form>
    </div>
  );
}
