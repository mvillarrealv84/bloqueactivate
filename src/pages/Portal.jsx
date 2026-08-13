import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, User, ShieldAlert } from 'lucide-react';

export default function Portal() {
  const navigate = useNavigate();
  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#222' }}>
      <h1 style={{ color: '#4AEEEA', textAlign: 'center', marginBottom: '50px', fontSize: '4rem', textShadow: '4px 4px 0 #000', fontFamily: 'monospace' }}>
        MUNDO DE BLOQUES
      </h1>
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div 
          onClick={() => navigate('/login')}
          style={{ background: '#333', padding: '40px', borderRadius: '12px', width: '250px', textAlign: 'center', cursor: 'pointer', border: '4px solid #4AEEEA', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <User size={64} color="#4AEEEA" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#4AEEEA', fontSize: '1.5rem', margin: 0 }}>ALUMNOS</h2>
        </div>
        
        <div 
          onClick={() => navigate('/maestros/login')}
          style={{ background: '#333', padding: '40px', borderRadius: '12px', width: '250px', textAlign: 'center', cursor: 'pointer', border: '4px solid #FCE029', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <GraduationCap size={64} color="#FCE029" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#FCE029', fontSize: '1.5rem', margin: 0 }}>MAESTROS</h2>
        </div>

        <div 
          onClick={() => navigate('/admin/login')}
          style={{ background: '#333', padding: '40px', borderRadius: '12px', width: '250px', textAlign: 'center', cursor: 'pointer', border: '4px solid #F44336', transition: 'transform 0.2s', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <ShieldAlert size={64} color="#F44336" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ color: '#F44336', fontSize: '1.5rem', margin: 0 }}>ADMINISTRADORES</h2>
        </div>
      </div>
    </div>
  );
}
