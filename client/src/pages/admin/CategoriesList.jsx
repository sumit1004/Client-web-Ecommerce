import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, Check, X, Star, Home, ArrowUp, ArrowDown, Boxes, Image } from 'lucide-react';
import { apiClient } from '../../services/apiClient.js';
import { Button } from '../../components/ui/Button.jsx';
import './AdminTable.css';

export function CategoriesList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sortField, setSortField] = useState('display_order');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchCategories();
  }, [search, statusFilter, sortField, sortOrder]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/categories', {
        params: { search, status: statusFilter, sort: sortField, order: sortOrder }
      });
      setCategories(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const toggleSelect = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === categories.length) setSelectedIds(newSet());
    else setSelectedIds(new Set(categories.map(c => c.id)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await apiClient.delete(`/categories/${id}`);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    if (action === 'delete') {
      if (!window.confirm(`Delete ${selectedIds.size} categories?`)) return;
      // Note: A real bulk delete endpoint should be created if needed, 
      // but for now we loop or assume a new endpoint. 
      // We will just alert that it's not fully implemented for loop to avoid spam.
      alert('Bulk delete not fully implemented yet in API.');
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-header">
        <h1>Categories</h1>
        <Link to="/admin/categories/create">
          <Button><PlusCircle size={16} style={{marginRight: '8px'}}/> Create Category</Button>
        </Link>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search categories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
          <option value="disabled">Disabled</option>
        </select>
        {selectedIds.size > 0 && (
          <select onChange={(e) => handleBulkAction(e.target.value)} value="">
            <option value="">Bulk Actions ({selectedIds.size})</option>
            <option value="delete">Delete Selected</option>
          </select>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="skeleton-table">Loading...</div>
        ) : categories.length === 0 ? (
          <div className="empty-state">
            <Boxes size={48} />
            <p>No categories found.</p>
            <Link to="/admin/categories/create"><Button>Create your first category</Button></Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th><input type="checkbox" checked={selectedIds.size === categories.length && categories.length > 0} onChange={toggleSelectAll} /></th>
                <th>Image</th>
                <th onClick={() => handleSort('name')} className="sortable">Name {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</th>
                <th>Parent</th>
                <th>Slug</th>
                <th onClick={() => handleSort('products')} className="sortable">Products {sortField === 'products' && (sortOrder === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</th>
                <th>Featured</th>
                <th>Homepage</th>
                <th>Status</th>
                <th onClick={() => handleSort('display_order')} className="sortable">Order {sortField === 'display_order' && (sortOrder === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id}>
                  <td><input type="checkbox" checked={selectedIds.has(cat.id)} onChange={() => toggleSelect(cat.id)} /></td>
                  <td>
                    {cat.image_url ? <img src={cat.image_url} alt={cat.name} className="table-img" /> : <div className="table-img-placeholder"><Image size={16}/></div>}
                  </td>
                  <td><strong>{cat.name}</strong></td>
                  <td>{cat.parent_name || '-'}</td>
                  <td><small>{cat.slug}</small></td>
                  <td>{cat.productCount}</td>
                  <td>{cat.featured ? <Star size={16} fill="var(--accent)" color="var(--accent)"/> : <Star size={16} color="var(--muted)"/>}</td>
                  <td>{cat.show_on_homepage ? <Home size={16} color="var(--success)"/> : <Home size={16} color="var(--muted)"/>}</td>
                  <td><span className={`status-badge status-${cat.status}`}>{cat.status}</span></td>
                  <td>{cat.display_order}</td>
                  <td className="actions-cell">
                    <Link to={`/admin/categories/edit/${cat.id}`} className="action-btn edit"><Edit2 size={16} /></Link>
                    <button className="action-btn delete" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
