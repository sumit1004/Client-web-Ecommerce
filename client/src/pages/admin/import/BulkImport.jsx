import { useState } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import '../AdminTable.css';

export function BulkImport() {
  const [tab, setTab] = useState('excel');
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [importError, setImportError] = useState('');
  const [jobState, setJobState] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleImagesChange = (e) => {
    if (e.target.files.length > 0) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleImportExcel = async (e) => {
    e.preventDefault();
    if (!file) return alert('Please select an Excel file');
    
    setLoading(true);
    setReport(null);
    setImportError('');
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await apiClient.post('/import/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setReport(res.data.data);
    } catch (err) {
      setImportError(err.response?.data?.message || err.message || 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  const handleImportImages = async (e) => {
    e.preventDefault();
    if (images.length === 0) return alert('Please select images');
    
    setLoading(true);
    setReport(null);
    setImportError('');
    setJobState({ status: 'Uploading...', progress: 0, total: images.length });
    setUploadProgress(0);
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    
    try {
      const res = await apiClient.post('/import/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 300000, // 5 minutes timeout for the initial POST
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      const jobId = res.data?.data?.jobId;
      if (!jobId) throw new Error('No job ID returned');

      // Start Polling
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await apiClient.get(`/import/status/${jobId}`);
          const job = statusRes.data?.data;
          if (job) {
            setJobState({ status: job.status, progress: job.progress, total: job.total });
            if (job.status === 'Completed') {
              clearInterval(pollInterval);
              setReport(job.report);
              setLoading(false);
            } else if (job.status === 'Error') {
              clearInterval(pollInterval);
              setImportError(job.error || 'Job failed in background');
              setLoading(false);
            }
          }
        } catch (e) {
          clearInterval(pollInterval);
          setImportError('Failed to fetch job status');
          setLoading(false);
        }
      }, 1500);

    } catch (err) {
      setImportError(err.response?.data?.message || err.message || 'Failed to upload images');
      setLoading(false);
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-header">
        <h1>Bulk Import Engine</h1>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px' }}>
        <Button variant={tab === 'excel' ? 'primary' : 'outline'} onClick={() => { setTab('excel'); setReport(null); }}>Products (Excel/CSV)</Button>
        <Button variant={tab === 'images' ? 'primary' : 'outline'} onClick={() => { setTab('images'); setReport(null); }}>Bulk Image Map</Button>
      </div>

      <div className="table-container" style={{ padding: '32px', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
        
        {importError && (
          <div style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={20} />
            <span>{importError}</span>
          </div>
        )}
        
        {tab === 'excel' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginTop: 0 }}>Import Products from Excel</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Upload a .xlsx, .xls, or .csv file containing your product data. Ensure columns like Name, SKU, Category, and Price exist.</p>
            
            <form onSubmit={handleImportExcel}>
              <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center', marginBottom: '24px', background: 'var(--secondary-bg)' }}>
                <FileText size={48} style={{ color: 'var(--muted)', marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px' }}>Select Excel File</h3>
                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} style={{ display: 'block', margin: '0 auto' }} />
              </div>
              <Button type="submit" disabled={!file || loading} style={{ width: '100%' }}>
                {loading ? <RefreshCw className="spinner" size={18} /> : 'Start Import'}
              </Button>
            </form>
          </div>
        )}

        {tab === 'images' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginTop: 0 }}>Bulk Image Mapping</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Upload multiple images at once. The system will automatically map images to products based on the SKU in the filename (e.g., <code>SKU123.jpg</code> or <code>SKU123_1.jpg</code>).</p>
            
            <form onSubmit={handleImportImages}>
              <div style={{ border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px', textAlign: 'center', marginBottom: '24px', background: 'var(--secondary-bg)' }}>
                <UploadCloud size={48} style={{ color: 'var(--muted)', marginBottom: '16px' }} />
                <h3 style={{ margin: '0 0 8px' }}>Select Images ({images.length} selected)</h3>
                <input type="file" multiple accept="image/*" onChange={handleImagesChange} style={{ display: 'block', margin: '0 auto' }} />
              </div>
              
              {loading && jobState && (
                <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border)', borderRadius: '8px', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong>{jobState.status}</strong>
                    {jobState.status === 'Uploading...' && <span>{uploadProgress}%</span>}
                    {jobState.status !== 'Uploading...' && jobState.total > 0 && <span>{jobState.progress} / {jobState.total}</span>}
                  </div>
                  <div style={{ height: '8px', background: 'var(--secondary-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: 'var(--primary)', 
                      width: jobState.status === 'Uploading...' ? `${uploadProgress}%` : `${jobState.total > 0 ? (jobState.progress / jobState.total) * 100 : 0}%`,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={images.length === 0 || loading} style={{ width: '100%' }}>
                {loading ? <RefreshCw className="spinner" size={18} /> : 'Upload & Map Images'}
              </Button>
            </form>
          </div>
        )}

        {/* Report Section */}
        {report && (
          <div style={{ marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
            <h3>Import Report</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'var(--secondary-bg)', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 8px', color: 'var(--muted)' }}>Total</h4>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{report.total}</span>
              </div>
              {tab === 'excel' && (
                <>
                  <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#166534' }}>Imported</h4>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>{report.imported}</span>
                  </div>
                  <div style={{ padding: '16px', background: '#e0f2fe', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 8px', color: '#075985' }}>Updated</h4>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#075985' }}>{report.updated}</span>
                  </div>
                </>
              )}
              {tab === 'images' && (
                <div style={{ padding: '16px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#166534' }}>Mapped</h4>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>{report.matched}</span>
                </div>
              )}
              <div style={{ padding: '16px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 8px', color: '#991b1b' }}>Failed/Ignored</h4>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b' }}>{tab === 'excel' ? report.failed : report.ignored}</span>
              </div>
            </div>

            {report.errors && report.errors.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--error)', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={16}/> Errors</h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{tab === 'excel' ? 'Row' : 'Filename'}</th>
                        <th>{tab === 'excel' ? 'SKU' : 'Reason'}</th>
                        {tab === 'excel' && <th>Reason</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {report.errors.map((err, i) => (
                        <tr key={i}>
                          <td>{tab === 'excel' ? err.row : err.filename}</td>
                          {tab === 'excel' && <td>{err.sku}</td>}
                          <td>{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
