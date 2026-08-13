import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/maestros/dashboard');
    } else {
      setError('Credenciales de maestro incorrectas');
    }
  };

  // Redirect if already logged in as teacher
  if (currentUser?.role === 'teacher') {
    navigate('/maestros/dashboard');
    return null;
  }

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="auth-box block-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', border: '4px solid #F44336' }}>
        <ShieldAlert size={48} color="#F44336" style={{ margin: '0 auto 15px' }} />
        <h2 style={{ marginBottom: '20px', color: '#F44336' }}>Acceso Profesores</h2>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px' }}>Correo Electrónico:</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '2px solid #ccc' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px' }}>Contraseña:</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '2px solid #ccc' }}
            />
          </div>
          <button type="submit" className="block-btn" style={{ background: '#F44336', marginTop: '10px' }}>
            Entrar al Panel
          </button>
        </form>
        
        <p style={{ marginTop: '20px' }}>
          ¿No tienes cuenta de maestro? <Link to="/maestros/register" style={{ color: '#F44336' }}>Regístrate aquí</Link>
        </p>
        <p style={{ marginTop: '20px', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: '#888' }}>Volver al portal de alumnos</Link>
        </p>
      </div>
    </div>
  );
}
