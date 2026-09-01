import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './admin.css';

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Login gagal');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin admin__login">
      <div className="admin__login-card">
        <div className="admin__login-logo">
          <img src="/images/logo-desa.png" alt="Logo Desa" />
          <h1>SIG Desa Cinunuk</h1>
          <small>Panel Administrator</small>
        </div>
        {error && <div className="admin__error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="admin__field">
            <label>Username</label>
            <input
              className="admin__input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              placeholder="admin"
            />
          </div>
          <div className="admin__field">
            <label>Password</label>
            <input
              className="admin__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button className="admin__btn admin__btn--full" disabled={busy}>
            {busy ? 'Memproses…' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  );
}
