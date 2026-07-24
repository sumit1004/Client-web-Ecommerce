import { useState, useEffect } from 'react';
import { UploadCloud, Trash2, Copy, Image as ImageIcon, Grid, List as ListIcon, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import '../AdminTable.css';

export function MediaLibrary() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, [search, page]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/media', {
        params: { search, page, limit: 20 }
      });
      setMedia(res.data?.data?.media || []);
      setTotalPages(res.data?.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch media', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        await apiClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      fetchMedia();
    } catch (err) {
      alert('Failed to upload some images');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this image permanently?')) return;
    try {
      await apiClient.delete(`/media/${id}`);
      fetchMedia();
    } catch (err) {
      alert('Failed to delete media');
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard');
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-header">
        <h1>Media Library</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="outline" onClick={fetchMedia}><RefreshCw size={16}/></Button>
          <label className="btn btn-primary btn-medium" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {uploading ? <RefreshCw size={16} className="spinner" /> : <UploadCloud size={16} />}
            {uploading ? 'Uploading...' : 'Upload Files'}
            <input type="file" multiple accept="image/*" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="admin-toolbar" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="search-box" style={{ maxWidth: '400px' }}>
          <input type="text" placeholder="Search by filename..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant={view === 'grid' ? 'primary' : 'outline'} onClick={() => setView('grid')}><Grid size={16}/></Button>
          <Button variant={view === 'list' ? 'primary' : 'outline'} onClick={() => setView('list')}><ListIcon size={16}/></Button>
        </div>
      </div>

      <div className="table-container" style={{ background: view === 'grid' ? 'transparent' : 'white', border: view === 'grid' ? 'none' : '1px solid var(--border)' }}>
        {loading ? (
          <div className="skeleton-table">Loading...</div>
        ) : media.length === 0 ? (
          <div className="empty-state" style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <ImageIcon size={48} />
            <p>No media files found.</p>
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {media.map(m => (
                  <div key={m.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ height: '160px', borderBottom: '1px solid var(--border)' }}>
                      <img src={m.url} alt={m.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '12px' }}>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.filename}>{m.filename}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--muted)' }}>{m.uploader_name || 'System'}</p>
                      <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--muted)' }}>{new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                    <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                      <button onClick={() => copyToClipboard(m.url)} style={{ background: 'white', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Copy URL"><Copy size={14}/></button>
                      <button onClick={() => handleDelete(m.id)} style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} title="Delete"><Trash2 size={14}/></button>
                    </div>
                    {m.mapped_products ? (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--success)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Mapped</span>
                    ) : (
                      <span style={{ position: 'absolute', top: '8px', left: '8px', background: 'var(--warning)', color: 'white', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Unmapped</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Thumbnail</th>
                    <th>Filename</th>
                    <th>URL</th>
                    <th>Uploaded By</th>
                    <th>Mapped Product</th>
                    <th>Status</th>
                    <th>Upload Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {media.map(m => (
                    <tr key={m.id}>
                      <td><img src={m.url} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/></td>
                      <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.filename}>{m.filename}</td>
                      <td>
                        <button className="action-btn" onClick={() => copyToClipboard(m.url)} title="Copy URL"><Copy size={16}/></button>
                      </td>
                      <td>{m.uploader_name || 'System'}</td>
                      <td style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={m.mapped_products || 'None'}>
                        {m.mapped_products || '-'}
                      </td>
                      <td>
                        {m.mapped_products ? (
                          <span className="badge success">Mapped</span>
                        ) : (
                          <span className="badge warning">Unmapped</span>
                        )}
                      </td>
                      <td>{new Date(m.created_at).toLocaleDateString()}</td>
                      <td className="actions-cell">
                        <button className="action-btn delete" onClick={() => handleDelete(m.id)}><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', padding: '24px 0', alignItems: 'center' }}>
                <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
                <span>Page {page} of {totalPages}</span>
                <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
