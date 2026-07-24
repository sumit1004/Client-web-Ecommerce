import { Outlet, NavLink } from 'react-router-dom';
import { Building, Share2, Search, Layout, Settings as SettingsIcon } from 'lucide-react';
import './Settings.css';

export function SettingsLayout() {
  return (
    <div className="admin-page settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>
      
      <div className="settings-container">
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <NavLink to="/admin/settings/business" className={({isActive}) => isActive ? 'active' : ''}>
              <Building size={16} /> Business Information
            </NavLink>
            <NavLink to="/admin/settings/social" className={({isActive}) => isActive ? 'active' : ''}>
              <Share2 size={16} /> Social Media
            </NavLink>
            <NavLink to="/admin/settings/seo" className={({isActive}) => isActive ? 'active' : ''}>
              <Search size={16} /> SEO Settings
            </NavLink>
            <NavLink to="/admin/settings/homepage" className={({isActive}) => isActive ? 'active' : ''}>
              <Layout size={16} /> Homepage CMS
            </NavLink>
            <NavLink to="/admin/settings/system" className={({isActive}) => isActive ? 'active' : ''}>
              <SettingsIcon size={16} /> System
            </NavLink>
          </nav>
        </aside>
        
        <div className="settings-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
