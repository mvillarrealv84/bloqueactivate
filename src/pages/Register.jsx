import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(email, password, name);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message || 'Error al registrar. Intenta de nuevo.');
    }
  };

  return (
    <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ background: '#333', padding: '40px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: '#4AEEEA', textAlign: 'center', marginBottom: '30px' }}>Crear Cuenta</h1>
        {error && <div style={{ background: '#ff5252', color: 'white', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ color: 'white', display: 'block', marginBottom: '5px' }}>Tu Nombre / Apodo</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '2px solid #555', background: '#222', color: 'white' }}
              required
            />
          </div>
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
            Registrarse
          </button>
        </form>
        <p style={{ color: '#aaa', textAlign: 'center', marginTop: '20px' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#FCE029' }}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
