import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';
import { Button } from '../../components/ui/Button.jsx';
import { ImageUpload } from '../../components/ui/ImageUpload.jsx';
import './CategoryForm.css';

export function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [tree, setTree] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parent_id: '',
    description: '',
    image_url: '',
    banner_url: '',
    icon: '',
    display_order: 0,
    featured: false,
    show_on_homepage: false,
    status: 'published',
    seo_title: '',
    seo_description: ''
  });

  useEffect(() => {
    fetchTree();
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchTree = async () => {
    try {
      const res = await apiClient.get('/categories/tree');
      setTree(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load category tree', err);
    }
  };

  const fetchCategory = async () => {
    try {
      const res = await apiClient.get(`/categories/${id}`);
      const data = res.data?.data;
      if (data) {
        setFormData({
          name: data.name || '',
          slug: data.slug || '',
          parent_id: data.parent_id || '',
          description: data.description || '',
          image_url: data.image_url || '',
          banner_url: data.banner_url || '',
          icon: data.icon || '',
          display_order: data.display_order || 0,
          featured: !!data.featured,
          show_on_homepage: !!data.show_on_homepage,
          status: data.status || 'published',
          seo_title: data.seo_title || '',
          seo_description: data.seo_description || ''
        });
      }
    } catch (err) {
      setError('Failed to load category.');
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

  const handleImageChange = (field, url) => {
    setFormData(prev => ({ ...prev, [field]: url }));
  };

  const handleSubmit = async (e, shouldAddAnother = false) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await apiClient.put(`/categories/${id}`, formData);
        navigate('/admin/categories');
      } else {
        await apiClient.post('/categories', formData);
        if (shouldAddAnother) {
          setFormData({ ...formData, name: '', slug: '', description: '', image_url: '', banner_url: '' });
          window.scrollTo(0, 0);
        } else {
          navigate('/admin/categories');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderTreeOptions = (nodes, level = 0) => {
    return nodes.map(node => (
      <optgroup key={node.id} label={`${'—'.repeat(level)} ${node.name}`}>
        <option value={node.id} disabled={isEdit && node.id === id}>{`${'—'.repeat(level)} ${node.name}`}</option>
        {node.children && node.children.length > 0 && renderTreeOptions(node.children, level + 1)}
      </optgroup>
    ));
  };

  if (fetching) return <div className="admin-page"><div className="skeleton-table">Loading form...</div></div>;

  return (
    <div className="admin-category-form">
      <div className="form-header">
        <div className="title-area">
          <Link to="/admin/categories" className="back-btn"><ArrowLeft size={20} /></Link>
          <h1>{isEdit ? 'Edit Category' : 'Create Category'}</h1>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="main-column">
          <div className="form-card">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Category Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Men's Shirts" />
            </div>
            
            <div className="form-group">
              <label>Slug</label>
              <input type="text" name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated if left blank" />
              <small>Used for URL: /category/your-slug</small>
            </div>

            <div className="form-group">
              <label>Parent Category</label>
              <select name="parent_id" value={formData.parent_id} onChange={handleChange}>
                <option value="">None (Top Level)</option>
                {renderTreeOptions(tree)}
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe this category..." />
            </div>
          </div>

          <div className="form-card">
            <h2>Media</h2>
            <div className="media-grid">
              <ImageUpload label="Category Image" value={formData.image_url} onChange={(url) => handleImageChange('image_url', url)} />
              <ImageUpload label="Banner Image" value={formData.banner_url} onChange={(url) => handleImageChange('banner_url', url)} />
            </div>
          </div>

          <div className="form-card">
            <h2>Search Engine Optimization (SEO)</h2>
            <div className="form-group">
              <label>SEO Title</label>
              <input type="text" name="seo_title" value={formData.seo_title} onChange={handleChange} placeholder="Custom title for search engines" />
            </div>
            <div className="form-group">
              <label>SEO Description</label>
              <textarea name="seo_description" value={formData.seo_description} onChange={handleChange} rows={3} placeholder="Meta description..." />
            </div>
          </div>
        </div>

        <div className="side-column">
          <div className="form-card status-card">
            <h2>Status & Visibility</h2>
            
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="hidden">Hidden</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <label className="checkbox-label">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              Featured Category
            </label>

            <label className="checkbox-label">
              <input type="checkbox" name="show_on_homepage" checked={formData.show_on_homepage} onChange={handleChange} />
              Show on Homepage
            </label>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Display Order</label>
              <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} />
              <small>Lower numbers appear first</small>
            </div>
          </div>

          <div className="form-actions-card">
            <Button type="submit" disabled={loading} style={{ width: '100%', marginBottom: '10px' }}>
              {loading ? <Loader2 className="spinner" size={18} /> : <Save size={18} style={{marginRight: '8px'}} />}
              {isEdit ? 'Save Changes' : 'Create Category'}
            </Button>
            
            {!isEdit && (
              <Button type="button" disabled={loading} onClick={(e) => handleSubmit(e, true)} style={{ width: '100%', background: 'var(--secondary-bg)', color: 'var(--text)' }}>
                Save & Add Another
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
