import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AppProviders.jsx';

export function ProtectedRoute({ children }) {
  const auth = useAuth();
  const location = useLocation();

  if (!auth.admin) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
