import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import activities from '../data/activities.json';
import { BookOpen, Calculator, BrainCircuit, CheckCircle, LogOut, Swords, Infinity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('historia'); // 'historia' or 'math'

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
        
        {/* TAB SYSTEM */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '30px' }}>
          <button 
            onClick={() => setActiveTab('historia')}
            className={`block-btn ${activeTab !== 'historia' ? 'secondary' : ''}`}
            style={{ width: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <Swords size={24} /> 100 Misiones de Historia
          </button>
          <button 
            onClick={() => setActiveTab('math')}
            className={`block-btn ${activeTab !== 'math' ? 'secondary' : ''}`}
            style={{ width: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', background: activeTab === 'math' ? '#9C27B0' : undefined }}>
            <Infinity size={24} /> Kit de Matemáticas
          </button>
        </div>
      </header>

      {activeTab === 'historia' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ background: '#222', display: 'inline-block', padding: '10px 20px', borderRadius: '8px', color: '#FCE029', border: '2px solid #555' }}>
              <strong>Progreso:</strong> {currentUser?.progress?.length || 0} / 100 Misiones
            </div>
          </div>
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
        </>
      )}

      {activeTab === 'math' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div className="block-panel" style={{ background: '#3F51B5', color: 'white' }}>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', textShadow: '2px 2px 0 #000' }}>Kit de Matemáticas Estilo Minecraft</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>
              Genera ejercicios matemáticos infinitos al azar. ¡Ideal para imprimir o jugar en modo interactivo sin aburrirse jamás!
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left', marginBottom: '30px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#FCE029', marginBottom: '10px' }}>Incluye:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8' }}>
                  <li>✅ Sumas y Restas</li>
                  <li>✅ Multiplicaciones</li>
                  <li>✅ Problemas Matemáticos</li>
                  <li>✅ Fracciones</li>
                </ul>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ color: '#FCE029', marginBottom: '10px' }}>Opciones:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, lineHeight: '1.8' }}>
                  <li>✨ 1, 2 o 3 cifras ajustables</li>
                  <li>✨ Modo PDF Imprimible</li>
                  <li>✨ Modo Interactivo 100% Visual</li>
                  <li>✨ Generador Infinito Automático</li>
                </ul>
              </div>
            </div>

            <Link to="/math-kit" className="block-btn" style={{ fontSize: '1.5rem', padding: '15px 40px', background: '#4CAF50' }}>
              Generar Ficha Matemática
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
