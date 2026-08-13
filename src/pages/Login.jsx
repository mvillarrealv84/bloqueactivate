import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Correo o contraseña incorrectos');
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ background: '#333', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: '#4AEEEA', textAlign: 'center', marginBottom: '30px' }}>Inicia Sesión</h1>
        {error && <div style={{ background: '#ff5252', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '2px solid #555', background: '#222', color: 'white' }}
              required
            />
          </div>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '2px solid #555', background: '#222', color: 'white' }}
              required
            />
          </div>
          <button type="submit" className="block-btn accent" style={{ width: '100%', marginTop: '10px' }}>
            Jugar
          </button>
        </form>
        <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>
          ¿No tienes cuenta? <Link to="/register" style={{ color: '#FCE029' }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
