import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { useAuth } from '../context/AppProviders.jsx';
import { demoAdminCredentials } from '../services/authService.js';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: demoAdminCredentials.email, password: demoAdminCredentials.password });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const from = location.state?.from || '/admin';

  if (auth.admin) return <Navigate to={from} replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    try {
      await auth.login(form);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Seo title="Admin Login" description="Secure admin login for Pasand Showroom." />
      <section className="auth-visual" aria-hidden="true">
        <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1100&q=85" alt="" />
        <div>
          <span>Pasand Showroom</span>
          <h1>Welcome to Pasand Showroom Admin</h1>
        </div>
      </section>
      <section className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow">Admin Access</span>
          <h1>Sign in to dashboard</h1>
          <p>Use your admin account to manage products, categories, imports, media, settings and customer messages.</p>
          <form onSubmit={submit}>
            <label>
              Email
              <span className="auth-input"><Mail size={18} /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" /></span>
            </label>
            <label>
              Password
              <span className="auth-input">
                <Lock size={18} />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" />
                <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <Button className="auth-submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <div className="demo-credentials">
            <strong>Local preview login</strong>
            <span>Email: {demoAdminCredentials.email}</span>
            <span>Password: {demoAdminCredentials.password}</span>
          </div>
        </div>
      </section>
    </main>
  );
}
