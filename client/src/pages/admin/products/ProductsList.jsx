import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, Check, X, Star, Home, ArrowUp, ArrowDown, Package, Upload } from 'lucide-react';
import { apiClient } from '../../../services/apiClient.js';
import { Button } from '../../../components/ui/Button.jsx';
import '../AdminTable.css';

export function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, [search, statusFilter, sortField, sortOrder, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/products', {
        params: { search, status: statusFilter, sort: sortField, order: sortOrder, page }
      });
      setProducts(res.data?.data?.products || []);
      setTotalPages(res.data?.data?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
    if (selectedIds.size === products.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(products.map(p => p.id)));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await apiClient.delete(`/products/${id}`);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    try {
      if (action === 'delete') {
        if (!window.confirm(`Delete ${selectedIds.size} products?`)) return;
        // In a real app we'd have a bulk delete endpoint, for now simulate or just alert
        alert('Bulk delete not fully implemented yet in API.');
      } else if (['draft', 'published', 'hidden'].includes(action)) {
        await apiClient.patch('/products/bulk/status', { ids: Array.from(selectedIds), status: action });
        fetchProducts();
        setSelectedIds(new Set());
      }
    } catch (err) {
      alert('Bulk action failed');
    }
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-header">
        <h1>Products</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/import">
            <Button variant="outline"><Upload size={16} style={{marginRight: '8px'}}/> Import</Button>
          </Link>
          <Link to="/admin/products/create">
            <Button><PlusCircle size={16} style={{marginRight: '8px'}}/> Create Product</Button>
          </Link>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by name, SKU, or barcode..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
        {selectedIds.size > 0 && (
          <select onChange={(e) => { handleBulkAction(e.target.value); e.target.value = ''; }} defaultValue="">
            <option value="" disabled>Bulk Actions ({selectedIds.size})</option>
            <option value="active">Mark as Active</option>
            <option value="draft">Mark as Draft</option>
            <option value="inactive">Mark as Inactive</option>
            <option value="delete">Delete Selected</option>
          </select>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="skeleton-table">Loading...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <p>No products found.</p>
            <Link to="/admin/products/create"><Button>Create your first product</Button></Link>
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th><input type="checkbox" checked={selectedIds.size === products.length && products.length > 0} onChange={toggleSelectAll} /></th>
                  <th>Image</th>
                  <th onClick={() => handleSort('name')} className="sortable">Name {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th onClick={() => handleSort('price')} className="sortable">Price {sortField === 'price' && (sortOrder === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</th>
                  <th onClick={() => handleSort('stock')} className="sortable">Stock {sortField === 'stock' && (sortOrder === 'asc' ? <ArrowUp size={14}/> : <ArrowDown size={14}/>)}</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td><input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => toggleSelect(product.id)} /></td>
                    <td>
                      {product.images && product.images.length > 0 ? 
                        <img src={product.images[0].url} alt={product.name} className="table-img" /> : 
                        <div className="table-img-placeholder"><Package size={16}/></div>}
                    </td>
                    <td><strong>{product.name}</strong></td>
                    <td><small>{product.sku}</small></td>
                    <td>{product.category_name || '-'}</td>
                    <td>₹{product.sale_price || product.price}</td>
                    <td>
                      <span style={{ color: product.stock <= product.low_stock_threshold ? 'var(--error)' : 'inherit', fontWeight: product.stock <= product.low_stock_threshold ? 'bold' : 'normal' }}>
                        {product.stock}
                      </span>
                    </td>
                    <td><span className={`status-badge status-${product.status}`}>{product.status}</span></td>
                    <td className="actions-cell">
                      <Link to={`/admin/products/edit/${product.id}`} className="action-btn edit"><Edit2 size={16} /></Link>
                      <button className="action-btn delete" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', alignItems: 'center' }}>
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
