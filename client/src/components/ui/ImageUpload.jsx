import { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';
import './ImageUpload.css';

export function ImageUpload({ value, onChange, label = 'Upload Image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await apiClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onChange(res.data.data.url);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (e) => {
    e.preventDefault();
    onChange('');
  };

  return (
    <div className="image-upload-wrapper">
      <label className="upload-label">{label}</label>
      <div className={`upload-area ${uploading ? 'uploading' : ''}`}>
        {value ? (
          <div className="upload-preview">
            <img src={value} alt="Preview" />
            <button className="remove-btn" onClick={removeImage}><X size={16} /></button>
          </div>
        ) : (
          <label className="upload-placeholder">
            <UploadCloud size={32} />
            <span>{uploading ? 'Uploading...' : 'Click or Drag to upload'}</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              ref={fileInputRef} 
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {error && <span className="upload-error">{error}</span>}
    </div>
  );
}
