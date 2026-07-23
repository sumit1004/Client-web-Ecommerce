import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary.jsx';
import { ProtectedRoute } from './components/auth/ProtectedRoute.jsx';

const Landing = lazy(() => import('./pages/Landing.jsx'));
const Categories = lazy(() => import('./pages/Categories.jsx'));
const Category = lazy(() => import('./pages/Category.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const Product = lazy(() => import('./pages/Product.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const Admin = lazy(() => import('./pages/Admin.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/search" element={<Navigate to="/products" replace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
