import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Credenciales de administrador incorrectas');
    }
  };

  // Redirect if already logged in as admin
  if (currentUser?.role === 'admin') {
    navigate('/admin/dashboard');
    return null;
  }

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="auth-box block-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', border: '4px solid #F44336', background: '#333', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <ShieldAlert size={48} color="#F44336" style={{ margin: '0 auto 15px' }} />
        <h2 style={{ marginBottom: '20px', color: '#F44336' }}>Acceso Administrador</h2>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px', color: 'white' }}>Correo Electrónico:</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '2px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px', color: 'white' }}>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '2px solid #ccc' }}
            />
          </div>
          <button type="submit" className="block-btn" style={{ background: '#F44336', color: 'white', marginTop: '10px', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            Entrar al Panel
          </button>
        </form>
        
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          <Link to="/" style={{ color: '#888' }}>Volver al portal</Link>
        </p>
      </div>
    </div>
  );
}
