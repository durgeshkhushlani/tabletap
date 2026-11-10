import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ restaurantName: '', name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/admin" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const { data } = await api.post(`/auth/${mode}`, form);
      login(data.token);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="narrow card">
      <h1>TableTap {mode === 'login' ? 'Login' : 'Register'}</h1>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <>
            <label>Restaurant name</label>
            <input value={form.restaurantName} onChange={set('restaurantName')} required />
            <label>Your name</label>
            <input value={form.name} onChange={set('name')} required />
          </>
        )}
        <label>Email</label>
        <input type="email" value={form.email} onChange={set('email')} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={set('password')} minLength={6} required />
        {error && <div className="error">{error}</div>}
        <button className="primary" disabled={busy}>{mode === 'login' ? 'Log in' : 'Create restaurant'}</button>
      </form>
      <p className="muted">
        {mode === 'login' ? 'New restaurant? ' : 'Already registered? '}
        <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'Register' : 'Log in'}
        </a>
      </p>
    </div>
  );
}
