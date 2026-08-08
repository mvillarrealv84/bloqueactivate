import React, { useRef, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import activities from '../data/activities.json';
import MazeGenerator from '../components/MazeGenerator';
import SequenceDnd from '../components/SequenceDnd';
import { ArrowLeft, Download, Diamond, MonitorPlay, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ActivityDetail() {
  const { id } = useParams();
  const activity = activities.find(a => a.id === parseInt(id));
  const printRef = useRef(null);
  const { width, height } = useWindowSize();
  const { currentUser, markMissionComplete } = useAuth();
  
  const [isInteractive, setIsInteractive] = useState(false);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [results, setResults] = useState({});

  // Setup default sequence order when interactive mode opens
  useEffect(() => {
    if (isInteractive && activity) {
      const initialAnswers = {};
      Object.keys(activity.activities).forEach(key => {
        if (activity.activities[key].type === 'sequence') {
          initialAnswers[key] = [...activity.activities[key].options];
        } else {
          initialAnswers[key] = '';
        }
      });
      setAnswers(initialAnswers);
      setIsSubmitted(false);
      setShowConfetti(false);
      setResults({});
    }
  }, [isInteractive, activity]);

  if (!activity) return <div style={{color:'white'}}>Actividad no encontrada</div>;

  const handleDownload = () => {
    setIsInteractive(false); // Force print mode before download
    setTimeout(() => {
      const element = printRef.current;
      const opt = {
        margin:       0,
        filename:     `${activity.title}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 794, windowHeight: 1123 },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] }
      };
      html2pdf().set(opt).from(element).save();
    }, 100);
  };

  const handleAnswerChange = (actKey, value) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [actKey]: value }));
  };

  const checkAnswers = () => {
    const newResults = {};
    let correctCount = 0;
    const totalCount = Object.keys(activity.activities).length;

    Object.keys(activity.activities).forEach(key => {
      const act = activity.activities[key];
      const userAnswer = answers[key];
      const correctAnswer = act.answer;
      
      let isCorrect = false;

      if (act.type === 'sequence') {
        // Compare arrays
        if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
          isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
        } else {
          isCorrect = false;
        }
      } else {
        // Compare strings, ignoring case and removing ALL spaces for extreme flexibility
        const normalize = (str) => String(str || '').toLowerCase().replace(/\s+/g, '');
        // Extract just the letter if it's multiple choice like "A. algo" vs "A"
        let normUser = normalize(userAnswer);
        let normCorrect = normalize(correctAnswer);
        
        if (act.type === 'multiple-choice') {
           // Allow match if user picked "A" and correct answer starts with "A."
           if (normCorrect.startsWith(normUser + '.') || normCorrect === normUser) {
              isCorrect = true;
           } else {
              isCorrect = normCorrect === normUser;
           }
        } else {
           isCorrect = normCorrect === normUser;
        }
      }

      newResults[key] = isCorrect;
      if (isCorrect) correctCount++;
    });

    setResults(newResults);
    setIsSubmitted(true);

    if (correctCount === totalCount) {
      setShowConfetti(true);
      markMissionComplete(activity.id);
      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }
  };

  // Helper colors for activities
  const colors = {
    act1: '#4CAF50', // Green
    act2: '#9C27B0', // Purple
    act3: '#2196F3', // Blue
    act4: '#FF9800'  // Orange
  };

  const isCompleted = currentUser?.progress?.includes(activity.id);

  return (
    <div className="app-container">
      {showConfetti && <Confetti width={width} height={height} numberOfPieces={500} />}
      
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '10px' }}>
        <Link to="/" className="block-btn secondary">
          <ArrowLeft /> Volver al Inicio
        </Link>
        
        <div style={{ display: 'flex', gap: '10px', background: '#222', padding: '5px', borderRadius: '8px' }}>
          <button 
            onClick={() => setIsInteractive(false)} 
            className={`block-btn ${!isInteractive ? 'accent' : 'secondary'}`}
            style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Printer size={18}/> Modo Imprimir
          </button>
          <button 
            onClick={() => setIsInteractive(true)} 
            className={`block-btn ${isInteractive ? 'accent' : 'secondary'}`}
            style={{ padding: '8px 15px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <MonitorPlay size={18}/> Modo Interactivo
          </button>
        </div>

        <button onClick={handleDownload} className="block-btn accent" style={{ background: '#4CAF50' }}>
          <Download /> Descargar en PDF
        </button>
      </div>

      <div style={{ background: '#333', padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
        {/* Este es el contenedor que se imprimirá */}
        <div 
          ref={printRef} 
          className="print-page" 
          style={{ 
            background: 'url("https://www.transparenttextures.com/patterns/cubes.png") #618A3D', 
            position: 'relative',
            overflow: 'hidden',
            color: '#333',
            fontFamily: "'Nunito', sans-serif"
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
            <div style={{ background: '#866043', border: '4px solid #4a3424', padding: '10px', color: 'white', fontWeight: 'bold', borderRadius: '4px', textAlign: 'center' }}>
              Nivel<br/>{activity.level.split(' ')[1]} de 10
            </div>
            
            <div style={{ 
              background: '#1C4D9C', 
              border: '4px solid #102e5e', 
              padding: '10px 30px', 
              color: 'white', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              flex: 1,
              margin: '0 15px',
              justifyContent: 'center',
              boxShadow: '4px 4px 0px rgba(0,0,0,0.4)'
            }}>
              <Diamond size={32} color="#4AEEEA" fill="#4AEEEA" />
              <h1 style={{ fontSize: '2.2rem', margin: 0, textShadow: '2px 2px 0px #000' }}>
                {activity.title}
                {isCompleted && <span style={{fontSize: '1.2rem', marginLeft: '10px', color: '#4CAF50'}}>✅</span>}
              </h1>
            </div>

            <div style={{ background: '#1C4D9C', border: '4px solid #102e5e', padding: '15px 10px', color: 'white', fontWeight: 'bold', borderRadius: '50%', textAlign: 'center', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activity.ageGroup}
            </div>
          </div>

          {/* Subtitle tag */}
          <div style={{ textAlign: 'center', marginTop: '-25px', position: 'relative', zIndex: 2, marginBottom: '20px' }}>
            <span style={{ background: '#FCE029', border: '4px solid #b8a218', padding: '5px 30px', borderRadius: '4px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.3)' }}>
              {activity.type === 'reading' ? 'Comprensión de lectura' : activity.type === 'math' ? 'Reto Matemático' : 'Acertijo y Lógica'}
            </span>
          </div>

          {/* Story Panel */}
          <div style={{ 
            borderRadius: '8px', 
            border: '4px solid #333',
            marginBottom: '20px', 
            boxShadow: '4px 4px 0px rgba(0,0,0,0.4)', 
            position: 'relative', 
            minHeight: '340px',
            backgroundImage: activity.image ? `url(${activity.image})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#F4E8D6',
              border: '4px solid #C4B299',
              borderRadius: '8px',
              width: '45%',
              margin: '15px',
              padding: '12px',
              position: 'relative',
              zIndex: 2,
              boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
            }}>
              {activity.story.map((s, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#D9C8B0', border: '2px solid #A69680', width: '30px', height: '30px', minWidth: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', fontWeight: 'bold' }}>
                    {s.step}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', lineHeight: '1.2' }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activities Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            {Object.keys(activity.activities).map((actKey, idx) => {
              const act = activity.activities[actKey];
              const color = colors[`act${idx+1}`];
              
              // Determine border color for interactive mode
              let borderStyle = `4px solid ${color}`;
              if (isInteractive && isSubmitted) {
                borderStyle = results[actKey] ? `4px solid #4CAF50` : `4px solid #F44336`;
              }

              return (
                <div key={idx} style={{ background: 'white', border: borderStyle, borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ background: color, color: 'white', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ background: 'white', color: color, width: '30px', height: '30px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', fontFamily: 'Fredoka' }}>
                      {idx + 1}
                    </div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{act.title}</h2>
                    {isInteractive && isSubmitted && (
                       <span style={{marginLeft: 'auto', fontSize: '1.5rem'}}>
                         {results[actKey] ? '✅' : '❌'}
                       </span>
                    )}
                  </div>
                  <div style={{ padding: '15px' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>{act.description}</p>
                    
                    {/* MAZE */}
                    {act.type === 'maze' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <MazeGenerator width={20} height={10} />
                        {isInteractive && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}>
                            <input 
                              type="checkbox" 
                              checked={answers[actKey] === 'ok'}
                              onChange={(e) => handleAnswerChange(actKey, e.target.checked ? 'ok' : '')}
                              disabled={isSubmitted}
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <strong>¡Completado en la mente!</strong>
                          </label>
                        )}
                      </div>
                    )}
                    
                    {/* SEQUENCE */}
                    {act.type === 'sequence' && (
                      <SequenceDnd 
                        options={act.options} 
                        isInteractive={isInteractive} 
                        value={answers[actKey]} 
                        onChange={(val) => handleAnswerChange(actKey, val)}
                        showResult={isSubmitted}
                      />
                    )}
                    
                    {/* MULTIPLE CHOICE */}
                    {act.type === 'multiple-choice' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {act.options.map((opt, i) => {
                           const isSelected = answers[actKey] === opt;
                           return (
                             <div 
                               key={i} 
                               onClick={() => handleAnswerChange(actKey, opt)}
                               style={{ 
                                 padding: '8px', 
                                 background: !isInteractive ? '#f5f5f5' : (isSelected ? '#FCE029' : '#fff'), 
                                 borderRadius: '4px',
                                 border: isInteractive ? '2px solid #ddd' : 'none',
                                 cursor: (isInteractive && !isSubmitted) ? 'pointer' : 'default',
                                 fontWeight: isSelected ? 'bold' : 'normal',
                                 boxShadow: (isInteractive && isSelected) ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                               }}
                             >
                               {opt}
                             </div>
                           )
                        })}
                      </div>
                    )}
                    
                    {/* FILL BLANK & MATH */}
                    {(act.type === 'fill-blank' || act.type === 'math-operation') && (
                      isInteractive ? (
                        <input 
                          type="text" 
                          placeholder="Escribe tu respuesta aquí..."
                          value={answers[actKey] || ''}
                          onChange={(e) => handleAnswerChange(actKey, e.target.value)}
                          disabled={isSubmitted}
                          style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #ccc',
                            borderRadius: '6px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            background: isSubmitted ? '#f5f5f5' : '#fff'
                          }}
                        />
                      ) : (
                        <div style={{ height: act.type === 'math-operation' ? '80px' : '60px', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
                          {act.type === 'fill-blank' ? '____________________' : ''}
                        </div>
                      )
                    )}

                    {(act.type === 'draw' || act.type === 'match') && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {act.type === 'draw' && <div style={{ height: '100px', border: '2px dashed #ccc' }}></div>}
                        {act.type === 'match' && <div style={{ display: 'flex', justifyContent: 'space-between', height: '100px' }}><div style={{ width: '40%', border: '2px dashed #ccc' }}></div><div style={{ width: '40%', border: '2px dashed #ccc' }}></div></div>}
                        {isInteractive && (
                          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#f5f5f5', padding: '10px', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}>
                            <input 
                              type="checkbox" 
                              checked={answers[actKey] === 'ok'}
                              onChange={(e) => handleAnswerChange(actKey, e.target.checked ? 'ok' : '')}
                              disabled={isSubmitted}
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                            <strong>¡Completado en la mente!</strong>
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer / Tip */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', background: '#F4E8D6', border: '4px solid #C4B299', padding: '10px 20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <span style={{ fontWeight: 'bold', fontFamily: 'Fredoka' }}>Inicio</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <span style={{ background: '#5B8731', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</span>
                <span style={{ background: '#aaa', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</span>
                <span style={{ background: '#aaa', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
              </div>
              <span style={{ fontWeight: 'bold', fontFamily: 'Fredoka' }}>Meta</span>
            </div>
            <div style={{ background: '#fff', border: '2px solid #FCE029', padding: '10px', borderRadius: '8px', flex: 2, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ fontSize: '2rem' }}>💡</div>
              <div>
                <strong>Consejo de aventurero:</strong><br/>
                {activity.tip}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Submit Button */}
        {isInteractive && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
            <button 
              onClick={isSubmitted ? () => setIsSubmitted(false) : checkAnswers}
              className="block-btn accent"
              style={{ fontSize: '1.5rem', padding: '15px 40px', background: isSubmitted ? '#FF9800' : '#4CAF50' }}
            >
              {isSubmitted ? 'Reintentar' : '¡Comprobar Respuestas!'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
