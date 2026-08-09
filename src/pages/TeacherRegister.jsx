import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function TeacherRegister() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (register(email, password, name, 'teacher')) {
      navigate('/maestros/dashboard');
    } else {
      setError('El correo ya está registrado');
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
      <div className="auth-box block-panel" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', border: '4px solid #F44336' }}>
        <ShieldAlert size={48} color="#F44336" style={{ margin: '0 auto 15px' }} />
        <h2 style={{ marginBottom: '20px', color: '#F44336' }}>Registro de Profesores</h2>
        
        {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '5px' }}>Nombre del Profesor:</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '2px solid #ccc' }}
            />
          </div>
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
            Crear Cuenta Maestra
          </button>
        </form>
        
        <p style={{ marginTop: '20px' }}>
          ¿Ya tienes cuenta? <Link to="/maestros/login" style={{ color: '#F44336' }}>Inicia sesión aquí</Link>
        </p>
      </div>
    </div>
  );
}
