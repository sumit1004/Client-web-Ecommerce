import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Loader2, UploadCloud, X, Plus } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import '../CategoryForm.css'; // Reusing form styles

export function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    sku: '',
    category_id: '',
    brand: '',
    price: '',
    sale_price: '',
    cost_price: '',
    description: '',
    gender: '',
    age_group: '',
    color: '',
    size: '',
    weight: '',
    stock: 0,
    low_stock_threshold: 5,
    featured: false,
    new_arrival: false,
    show_on_homepage: false,
    status: 'draft',
    seo_title: '',
    seo_description: '',
    gallery: [] // { url, public_id, is_featured }
  });

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories/tree');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await apiClient.get(`/products/${id}`);
      const data = res.data?.data;
      if (data) {
        setFormData({
          ...data,
          price: data.price || '',
          sale_price: data.sale_price || '',
          cost_price: data.cost_price || '',
          featured: !!data.featured,
          new_arrival: !!data.new_arrival,
          show_on_homepage: !!data.show_on_homepage,
          gallery: data.gallery || []
        });
      }
    } catch (err) {
      setError('Failed to load product.');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newGallery = [...formData.gallery];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const uploadData = new FormData();
      uploadData.append('image', file);
      
      try {
        const res = await apiClient.post('/upload', uploadData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newGallery.push({
          url: res.data.data.url,
          public_id: res.data.data.public_id,
          is_featured: newGallery.length === 0
        });
      } catch (err) {
        console.error('Failed to upload image', err);
      }
    }
    
    setFormData(prev => ({ ...prev, gallery: newGallery }));
    e.target.value = '';
  };

  const removeImage = (index) => {
    const newGallery = [...formData.gallery];
    newGallery.splice(index, 1);
    // If we removed the featured one, make the new first one featured
    if (newGallery.length > 0 && formData.gallery[index].is_featured) {
      newGallery[0].is_featured = true;
    }
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await apiClient.put(`/products/${id}`, formData);
      } else {
        await apiClient.post('/products', formData);
      }
      navigate('/admin/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderTreeOptions = (nodes, level = 0) => {
    return nodes.map(node => (
      <optgroup key={node.id} label={`${'—'.repeat(level)} ${node.name}`}>
        <option value={node.id}>{`${'—'.repeat(level)} ${node.name}`}</option>
        {node.children && node.children.length > 0 && renderTreeOptions(node.children, level + 1)}
      </optgroup>
    ));
  };

  if (fetching) return <div className="admin-page"><div className="skeleton-table">Loading form...</div></div>;

  return (
    <div className="admin-category-form">
      <div className="form-header">
        <div className="title-area">
          <Link to="/admin/products" className="back-btn"><ArrowLeft size={20} /></Link>
          <h1>{isEdit ? 'Edit Product' : 'Create Product'}</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="main-column">
          <div className="form-card">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            
            <div className="media-grid">
              <div className="form-group">
                <label>SKU *</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required>
                  <option value="">Select Category</option>
                  {renderTreeOptions(categories)}
                </select>
              </div>
            </div>

            <div className="media-grid">
              <div className="form-group">
                <label>Brand</label>
                <input type="text" name="brand" value={formData.brand || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated if empty" />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={6} />
            </div>
          </div>

          <div className="form-card">
            <h2>Pricing & Inventory</h2>
            <div className="media-grid">
              <div className="form-group">
                <label>Regular Price (₹) *</label>
                <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Sale Price (₹)</label>
                <input type="number" step="0.01" name="sale_price" value={formData.sale_price || ''} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Low Stock Threshold</label>
                <input type="number" name="low_stock_threshold" value={formData.low_stock_threshold} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-card">
            <h2>Product Gallery</h2>
            <p style={{fontSize: '13px', color: 'var(--muted)', marginBottom: '16px'}}>Upload multiple images. The first image will be used as the thumbnail.</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {formData.gallery.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', width: '120px', height: '120px', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {idx === 0 && <span style={{ position: 'absolute', bottom: '4px', left: '4px', background: 'var(--accent)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>Cover</span>}
                  <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}><X size={14}/></button>
                </div>
              ))}
              
              <label style={{ width: '120px', height: '120px', border: '2px dashed var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--muted)', background: 'var(--secondary-bg)' }}>
                <UploadCloud size={24} />
                <span style={{ fontSize: '12px', marginTop: '8px' }}>Upload</span>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          <div className="form-card">
            <h2>Attributes (Variants)</h2>
            <div className="media-grid">
              <div className="form-group">
                <label>Size</label>
                <input type="text" name="size" value={formData.size || ''} onChange={handleChange} placeholder="e.g. S, M, L, XL" />
              </div>
              <div className="form-group">
                <label>Color</label>
                <input type="text" name="color" value={formData.color || ''} onChange={handleChange} placeholder="e.g. Red, Blue" />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender || ''} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              <div className="form-group">
                <label>Age Group</label>
                <input type="text" name="age_group" value={formData.age_group || ''} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>

        <div className="side-column">
          <div className="form-card status-card">
            <h2>Status & Visibility</h2>
            
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active (Published)</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive (Hidden)</option>
              </select>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              Featured Product
            </label>

            <label className="checkbox-label">
              <input type="checkbox" name="new_arrival" checked={formData.new_arrival} onChange={handleChange} />
              New Arrival
            </label>

            <label className="checkbox-label">
              <input type="checkbox" name="show_on_homepage" checked={formData.show_on_homepage} onChange={handleChange} />
              Show on Homepage
            </label>
          </div>

          <div className="form-card">
            <h2>SEO Settings</h2>
            <div className="form-group">
              <label>Meta Title</label>
              <input type="text" name="seo_title" value={formData.seo_title || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Meta Description</label>
              <textarea name="seo_description" value={formData.seo_description || ''} onChange={handleChange} rows={3} />
            </div>
          </div>

          <div className="form-actions-card">
            <Button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? <Loader2 className="spinner" size={18} /> : <Save size={18} style={{marginRight: '8px'}} />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
