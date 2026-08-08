import React from 'react';
import { Link } from 'react-router-dom';
import activities from '../data/activities.json';
import { BookOpen, Calculator, BrainCircuit, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();

  const getIcon = (type) => {
    switch(type) {
      case 'reading': return <BookOpen size={32} color="#5B8731" />;
      case 'math': return <Calculator size={32} color="#1C4D9C" />;
      case 'logic': return <BrainCircuit size={32} color="#AA0000" />;
      default: return <BookOpen size={32} />;
    }
  };

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ color: 'white', fontWeight: 'bold' }}>
          ¡Hola, {currentUser?.name || 'Aventurero'}!
        </div>
        <button onClick={logout} className="block-btn secondary" style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <LogOut size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>
          Cerrar Sesión
        </button>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="block-title" style={{ fontSize: '3rem' }}>Mundo de Bloques</h1>
        <h2 style={{ color: 'white', marginTop: '1rem' }}>Generador de Actividades (300 Misiones)</h2>
        <div style={{ background: '#222', display: 'inline-block', padding: '10px 20px', borderRadius: '8px', marginTop: '15px', color: '#FCE029', border: '2px solid #555' }}>
          <strong>Progreso:</strong> {currentUser?.progress?.length || 0} / 100 Misiones
        </div>
      </header>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem' 
      }}>
        {activities.map(act => {
          const isCompleted = currentUser?.progress?.includes(act.id);
          return (
            <div key={act.id} className="block-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              {isCompleted && (
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#fff', borderRadius: '50%', padding: '2px', boxShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                  <CheckCircle size={32} color="#4CAF50" fill="#E8F5E9" />
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  background: 'white', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '4px solid #333'
                }}>
                  {getIcon(act.type)}
                </div>
                <h3 style={{ fontSize: '1.4rem' }}>{act.title}</h3>
              </div>
              <p><strong>Nivel:</strong> {act.level}</p>
              <p><strong>Edad:</strong> {act.ageGroup}</p>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <Link to={`/activity/${act.id}`} className={isCompleted ? "block-btn secondary" : "block-btn"}>
                  {isCompleted ? 'Repasar Misión' : 'Jugar y Descargar'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
