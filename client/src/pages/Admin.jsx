import { BarChart3, Boxes, Image, Lock, Settings, Upload } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';

export default function Admin() {
  return (
    <main className="admin-page">
      <Seo title="Admin" description="Secure admin dashboard for managing products, categories, media and settings." />
      <aside>
        <strong>1964 Admin</strong>
        {['Dashboard', 'Products', 'Categories', 'Bulk Import', 'Media Library', 'Settings'].map((item, index) => {
          const Icon = [BarChart3, Boxes, Boxes, Upload, Image, Settings][index];
          return <a href="#" key={item}><Icon size={18} /> {item}</a>;
        })}
      </aside>
      <section>
        <div className="admin-top"><h1>Business Dashboard</h1><span><Lock size={16} /> Protected route ready</span></div>
        <div className="admin-grid">
          <article><strong>428</strong><span>Total Products</span></article>
          <article><strong>18</strong><span>Low Stock</span></article>
          <article><strong>42</strong><span>New Messages</span></article>
          <article><strong>96%</strong><span>Catalog Health</span></article>
        </div>
        <div className="admin-table">
          <h2>Production Modules</h2>
          {['Product CRUD APIs', 'Category management', 'Cloudinary media service', 'Excel import engine', 'Settings and contact messages'].map((item) => <p key={item}>{item}<span>Ready in backend architecture</span></p>)}
        </div>
      </section>
    </main>
  );
}
