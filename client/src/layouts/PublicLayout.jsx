import { Outlet } from 'react-router-dom';
import { AnnouncementBar } from '../components/layout/AnnouncementBar.jsx';
import { FloatingWhatsApp } from '../components/layout/FloatingWhatsApp.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { MobileBottomNav } from '../components/layout/MobileBottomNav.jsx';
import { Navbar } from '../components/layout/Navbar.jsx';
import { SearchExperience } from '../components/search/SearchExperience.jsx';
import { ToastProvider } from '../components/ui/Toast.jsx';

export function PublicLayout() {
  return (
    <ToastProvider>
      <AnnouncementBar />
      <Navbar />
      <Outlet />
      <Footer />
      <FloatingWhatsApp />
      <MobileBottomNav />
      <SearchExperience />
    </ToastProvider>
  );
}
