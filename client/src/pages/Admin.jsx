import { useEffect, useState } from 'react';
import { BarChart3, Boxes, Image, Lock, LogOut, Settings, Upload, PlusCircle, FileSpreadsheet, Globe, AlertCircle, RefreshCw, Mail, Activity } from 'lucide-react';
import { Route, Routes, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Seo } from '../components/ui/Seo.jsx';
import { useAuth } from '../context/AppProviders.jsx';
import { apiClient } from '../services/apiClient.js';
import { Button } from '../components/ui/Button.jsx';
import { CategoriesList } from './admin/CategoriesList.jsx';
import { CategoryForm } from './admin/CategoryForm.jsx';
import { ProductsList } from './admin/products/ProductsList.jsx';
import { ProductForm } from './admin/products/ProductForm.jsx';
import { MediaLibrary } from './admin/media/MediaLibrary.jsx';
import { BulkImport } from './admin/import/BulkImport.jsx';
import { AdminProfile } from './admin/profile/AdminProfile.jsx';
import { ContactInbox } from './admin/contacts/ContactInbox.jsx';
import { ActivityLogs } from './admin/logs/ActivityLogs.jsx';
import { NotificationBell } from '../components/ui/NotificationBell.jsx';
import { SettingsLayout } from './admin/settings/SettingsLayout.jsx';
import { BusinessSettings } from './admin/settings/BusinessSettings.jsx';
import { SocialMediaSettings } from './admin/settings/SocialMediaSettings.jsx';
import { SeoSettings } from './admin/settings/SeoSettings.jsx';
import { HomepageCms } from './admin/settings/HomepageCms.jsx';
import { SystemSettings } from './admin/settings/SystemSettings.jsx';

export default function Admin() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, activityRes, lowStockRes, outOfStockRes, recentRes] = await Promise.all([
        apiClient.get('/dashboard/stats'),
        apiClient.get('/dashboard/activity'),
        apiClient.get('/dashboard/low-stock'),
        apiClient.get('/dashboard/out-of-stock'),
        apiClient.get('/dashboard/recent-products')
      ]);

      setStats(statsRes.data?.data);
      setActivity(activityRes.data?.data || []);
      setLowStock(lowStockRes.data?.data || []);
      setOutOfStock(outOfStockRes.data?.data || []);
      setRecentProducts(recentRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function logout() {
    await auth.logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="admin-page">
      <Seo title="Dashboard" description="Secure admin dashboard for managing products, categories, media and settings." />
      <aside>
        <strong>Pasand Showroom</strong>
        <Link to="/admin"><BarChart3 size={18} /> Dashboard</Link>
        <Link to="/admin/products"><Boxes size={18} /> Products</Link>
        <Link to="/admin/categories" className={useLocation().pathname.includes('/categories') ? 'active' : ''}><Boxes size={18} /> Categories</Link>
        <Link to="/admin/import"><Upload size={18} /> Bulk Import</Link>
        <Link to="/admin/media"><Image size={18} /> Media Library</Link>
        <Link to="/admin/contacts"><Mail size={18} /> Contacts</Link>
        <Link to="/admin/logs"><Activity size={18} /> Activity Logs</Link>
        <Link to="/admin/settings"><Settings size={18} /> Settings</Link>
      </aside>
      <section>
        <div className="admin-top">
          <div>
            <h1>Pasand Showroom Admin</h1>
            <p>Signed in as {auth.admin?.name || 'Admin'} • {new Date().toLocaleDateString()}</p>
          </div>
          <div className="admin-actions">
            <NotificationBell />
            <Link to="/admin/profile" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'inherit' }}>
              <Lock size={16} /> Profile & Security
            </Link>
            <button onClick={logout}><LogOut size={16} /> Logout</button>
          </div>
        </div>

        <Routes>
          <Route path="/" element={
            error ? (
              <div className="admin-error">
                <AlertCircle size={32} />
                <h2>Database Connection Error</h2>
                <p>{error}</p>
                <Button onClick={fetchDashboardData}><RefreshCw size={16} /> Retry Connection</Button>
              </div>
            ) : loading ? (
              <div className="admin-grid">
                {[...Array(8)].map((_, i) => <article key={i} className="skeleton-card" style={{ height: '100px', background: '#eee', borderRadius: '8px' }}></article>)}
              </div>
            ) : (
              <>
                <div className="admin-grid">
                  <article><strong>{stats?.totalProducts || 0}</strong><span>Total Products</span></article>
                  <article><strong>{stats?.totalCategories || 0}</strong><span>Total Categories</span></article>
                  <article><strong>{stats?.featuredProducts || 0}</strong><span>Featured Products</span></article>
                  <article><strong>{stats?.collections || 0}</strong><span>Collections</span></article>
                  <article><strong>{stats?.mediaImages || 0}</strong><span>Media Library Images</span></article>
                  <article><strong>{stats?.lowStock || 0}</strong><span>Low Stock Products</span></article>
                  <article><strong>{stats?.outOfStock || 0}</strong><span>Out Of Stock</span></article>
                  <article><strong>{stats?.contactMessages || 0}</strong><span>Contact Messages</span></article>
                  <article style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{stats?.catalogHealth || 0}%</strong>
                      <span>Catalog Health</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#eee', borderRadius: '4px', marginTop: '10px' }}>
                      <div style={{ width: `${stats?.catalogHealth || 0}%`, height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                    </div>
                  </article>
                </div>

                <div style={{ display: 'flex', gap: '10px', margin: '2rem 0' }}>
                  <Button><PlusCircle size={16} style={{marginRight: '8px'}}/> Add Product</Button>
                  <Link to="/admin/categories/create"><Button><PlusCircle size={16} style={{marginRight: '8px'}}/> Add Category</Button></Link>
                  <Button><FileSpreadsheet size={16} style={{marginRight: '8px'}}/> Bulk Import</Button>
                  <Button><Upload size={16} style={{marginRight: '8px'}}/> Upload Images</Button>
                  <Button><Globe size={16} style={{marginRight: '8px'}}/> Website Preview</Button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="admin-table">
                    <h2>Low Stock Panel</h2>
                    {lowStock.length === 0 ? <p>All products adequately stocked.</p> : lowStock.map(p => (
                      <p key={p.id}>
                        {p.name} (SKU: {p.sku}) 
                        <span style={{ color: 'orange' }}>Stock: {p.stock} / {p.low_stock_threshold}</span>
                      </p>
                    ))}
                  </div>

                  <div className="admin-table">
                    <h2>Out Of Stock Panel</h2>
                    {outOfStock.length === 0 ? <p>No out of stock products.</p> : outOfStock.map(p => (
                      <p key={p.id}>
                        {p.name} ({p.category_name})
                        <span style={{ color: 'red' }}>SKU: {p.sku}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                  <div className="admin-table">
                    <h2>Recent Products</h2>
                    {recentProducts.length === 0 ? <p>No products found.</p> : recentProducts.map(p => (
                      <p key={p.id}>
                        {p.name} 
                        <span>₹{p.price} | {p.category_name} | {p.status}</span>
                      </p>
                    ))}
                  </div>

                  <div className="admin-table">
                    <h2>Recent Activity</h2>
                    {activity.length === 0 ? <p>No recent activity.</p> : activity.map(a => (
                      <p key={a.id}>
                        {a.action} by {a.admin_name}
                        <span>{new Date(a.created_at).toLocaleString()}</span>
                      </p>
                    ))}
                  </div>
                </div>
              </>
            )
          } />
          <Route path="/categories" element={<CategoriesList />} />
          <Route path="/categories/create" element={<CategoryForm />} />
          <Route path="/categories/edit/:id" element={<CategoryForm />} />
          <Route path="/products" element={<ProductsList />} />
          <Route path="/products/create" element={<ProductForm />} />
          <Route path="/products/edit/:id" element={<ProductForm />} />
          <Route path="/media" element={<MediaLibrary />} />
          <Route path="/import" element={<BulkImport />} />
          <Route path="/contacts" element={<ContactInbox />} />
          <Route path="/logs" element={<ActivityLogs />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="business" replace />} />
            <Route path="business" element={<BusinessSettings />} />
            <Route path="social" element={<SocialMediaSettings />} />
            <Route path="seo" element={<SeoSettings />} />
            <Route path="homepage" element={<HomepageCms />} />
            <Route path="system" element={<SystemSettings />} />
          </Route>
        </Routes>
      </section>
    </main>
  );
}
