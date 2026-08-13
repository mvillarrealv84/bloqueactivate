import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ArrowLeft, Download, MonitorPlay, Settings, RefreshCw, Book } from 'lucide-react';
import { generateOperations, generateMultiplications, generateTimesTable, generateWordProblem, generateFractions } from '../utils/MathGenerator';
import { useAuth } from '../context/AuthContext';

export default function MathKit() {
  const { addMathXP, currentUser } = useAuth();
  const [bookletType, setBookletType] = useState('sumas');
  const [opDigits, setOpDigits] = useState(2);
  const [mulDigits, setMulDigits] = useState(2);
  const [baseTable, setBaseTable] = useState(7);
  
  const [exercises, setExercises] = useState(null);
  const [isInteractive, setIsInteractive] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const printRef = useRef(null);
  const { width, height } = useWindowSize();
  const [randomChar, setRandomChar] = useState('');
  const characterImages = [
    'char_steve.jpg',
    'char_creeper.jpg',
    'char_zombie.jpg',
    'char_alex.jpg',
    'char_skeleton.jpg',
    'char_enderman.jpg',
    'char_pig.jpg',
    'char_cow.jpg',
    'char_chicken.jpg',
    'char_villager.jpg'
  ];

  const generateKit = () => {
    let newEx = [];
    if (bookletType === 'sumas') newEx = generateOperations(10, opDigits, 'add');
    if (bookletType === 'restas') newEx = generateOperations(10, opDigits, 'sub');
    if (bookletType === 'multiplicaciones') newEx = generateMultiplications(10, mulDigits);
    if (bookletType === 'tablas') newEx = generateTimesTable(baseTable);
    if (bookletType === 'problemas') newEx = [generateWordProblem(), generateWordProblem()];
    if (bookletType === 'fracciones') newEx = [generateFractions(), generateFractions()];
    
    setExercises(newEx);
    setAnswers({});
    setIsSubmitted(false);
    setShowConfetti(false);
    
    // Pick random character
    const randomImg = characterImages[Math.floor(Math.random() * characterImages.length)];
    setRandomChar(randomImg);
  };

  useEffect(() => {
    generateKit();
  }, [bookletType]);

  const handleDownload = () => {
    setIsInteractive(false);
    setTimeout(() => {
      const element = printRef.current;
      const opt = {
        margin:       0,
        filename:     `Cuadernillo_${bookletType.toUpperCase()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, allowTaint: true, windowWidth: 794, windowHeight: 1123 },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] }
      };
      html2pdf().set(opt).from(element).save();
    }, 100);
  };

  const handleSelectAnswer = (id, val) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const checkAnswers = () => {
    if (!exercises) return;
    let correctCount = 0;
    
    exercises.forEach(ex => {
      if (answers[ex.id] === ex.answer) correctCount++;
    });

    setScore(correctCount);
    setIsSubmitted(true);
    if (correctCount === exercises.length) {
      setShowConfetti(true);
      // Give 50 XP for completing a booklet perfectly
      if (addMathXP) {
        addMathXP(bookletType, 50);
      }
    }
  };

  if (!exercises) return <div style={{color:'white'}}>Cargando Cuadernillo...</div>;

  const renderConfigOptions = () => {
    if (['sumas', 'restas'].includes(bookletType)) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong>Cifras:</strong>
          <select value={opDigits} onChange={e => setOpDigits(parseInt(e.target.value))} style={{ padding: '5px', borderRadius: '4px' }}>
            <option value={1}>1 Cifra</option>
            <option value={2}>2 Cifras</option>
            <option value={3}>3 Cifras</option>
          </select>
        </div>
      );
    }
    if (bookletType === 'multiplicaciones') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong>Cifras Max:</strong>
          <select value={mulDigits} onChange={e => setMulDigits(parseInt(e.target.value))} style={{ padding: '5px', borderRadius: '4px' }}>
            <option value={1}>1 Cifra</option>
            <option value={2}>2 Cifras</option>
            <option value={3}>3 Cifras</option>
          </select>
        </div>
      );
    }
    if (bookletType === 'tablas') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <strong>Tabla del:</strong>
          <select value={baseTable} onChange={e => setBaseTable(parseInt(e.target.value))} style={{ padding: '5px', borderRadius: '4px' }}>
            {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      );
    }
    return null;
  };

  const getStyleTheme = () => {
    if (bookletType === 'sumas') return { color: '#4CAF50', title: 'SUMAS', sub: 'Calcula el total de bloques' };
    if (bookletType === 'restas') return { color: '#E91E63', title: 'RESTAS', sub: '¿Cuántos items quedan?' };
    if (bookletType === 'multiplicaciones') return { color: '#9C27B0', title: 'MULTIPLICACIONES', sub: 'Operaciones avanzadas' };
    if (bookletType === 'tablas') return { color: '#F44336', title: `TABLA DEL ${baseTable}`, sub: 'Memoriza los productos' };
    if (bookletType === 'problemas') return { color: '#2196F3', title: 'PROBLEMAS MATEMÁTICOS', sub: 'Lee, piensa y resuelve' };
    if (bookletType === 'fracciones') return { color: '#FF9800', title: 'FRACCIONES', sub: 'Dibuja las porciones exactas' };
    return { color: '#333', title: 'MATEMÁTICAS' };
  };

  const theme = getStyleTheme();

  return (
    <div className="app-container" style={{ paddingBottom: '50px' }}>
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      {/* Navbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Link to="/" className="block-btn secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ArrowLeft size={20} /> Volver al Inicio
        </Link>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button onClick={() => setIsInteractive(true)} className={`block-btn ${!isInteractive ? 'secondary' : ''}`} style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MonitorPlay size={18} /> Jugar Online
          </button>
          <button onClick={handleDownload} className="block-btn secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Download size={18} /> Imprimir PDF
          </button>
        </div>
      </div>

      {/* Control Panel */}
      <div className="block-panel" style={{ marginBottom: '20px', background: '#333', color: 'white', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Book size={20} color="#FCE029" />
          <strong>Cuadernillo:</strong>
          <select value={bookletType} onChange={e => setBookletType(e.target.value)} style={{ padding: '5px', fontSize: '1.2rem', borderRadius: '4px', fontWeight: 'bold' }}>
            <option value="sumas">Sumas</option>
            <option value="restas">Restas</option>
            <option value="multiplicaciones">Multiplicaciones</option>
            <option value="tablas">Tablas de Multiplicar</option>
            <option value="problemas">Problemas Lógicos</option>
            <option value="fracciones">Fracciones</option>
          </select>
        </div>
        
        {renderConfigOptions()}

        <button onClick={generateKit} className="block-btn" style={{ marginLeft: 'auto', background: theme.color, display: 'flex', gap: '10px', alignItems: 'center' }}>
          <RefreshCw size={18} /> Regenerar Ficha
        </button>
      </div>

      {/* PDF Container */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div 
          ref={printRef}
          className="pdf-container"
          style={{
            width: isInteractive ? '100%' : '794px',
            height: isInteractive ? 'auto' : '1123px',
            background: `url('data:image/svg+xml;utf8,<svg width="60" height="60" xmlns="http://www.w3.org/2000/svg"><rect width="60" height="60" fill="%2379553a"/><rect width="30" height="30" fill="%2367462c"/><rect x="30" y="30" width="30" height="30" fill="%2367462c"/><rect width="60" height="20" fill="%234b8c2a"/><rect x="15" y="20" width="15" height="10" fill="%234b8c2a"/><rect x="45" y="20" width="15" height="10" fill="%234b8c2a"/></svg>') repeat`,
            padding: '25px',
            position: 'relative',
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >

          {/* Inner White Page */}
          <div style={{ position: 'relative', width: '100%', height: isInteractive ? 'auto' : '1073px', background: '#FFFFFF', overflow: 'hidden' }}>

            {/* Absolute Character Position */}
            {randomChar && (
              <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '350px', height: '350px', zIndex: 1, pointerEvents: 'none' }}>
                <img src={`/characters/${randomChar}`} alt="Character" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            )}

            {/* Main Content Area */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', padding: '40px', paddingBottom: '380px' }}>
            
            {/* Header */}
            <div style={{ marginBottom: '60px', textAlign: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '3.5rem', textTransform: 'uppercase', fontWeight: '900', color: '#222' }}>{theme.title}</h1>
              <h2 style={{ margin: '5px 0 0 0', fontSize: '1.8rem', color: '#555' }}>{theme.sub}</h2>
            </div>

            {/* Layout For Operations & Times Tables */}
            {['sumas', 'restas', 'multiplicaciones', 'tablas'].includes(bookletType) && (
              <div style={{ 
                padding: '10px 40px', 
                display: 'grid', 
                gridTemplateColumns: bookletType === 'tablas' ? '300px' : '1fr 1fr', 
                gap: '30px',
                flexGrow: 1,
                justifyContent: bookletType === 'tablas' ? 'center' : 'stretch',
                zIndex: 3
              }}>
                {exercises.map((op, i) => (
                  <div key={op.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '2.2rem', fontWeight: 'bold', borderBottom: '2px solid #ccc', paddingBottom: '10px', color: '#333' }}>
                    <span style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{op.text}</span>
                    {isInteractive ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {op.options.map((opt, idx) => {
                          const isSelected = answers[op.id] === opt;
                          let btnBg = isSelected ? '#FCE029' : '#eee';
                          if (isSubmitted) {
                            if (opt === op.answer) btnBg = '#4CAF50';
                            else if (isSelected) btnBg = '#f44336';
                          }
                          return (
                            <button 
                              key={idx} 
                              onClick={() => handleSelectAnswer(op.id, opt)}
                              style={{ padding: '5px 15px', border: '2px solid #333', borderRadius: '4px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.5rem', minWidth: '60px' }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ width: '100px', height: '40px', border: '2px solid #555', background: 'white' }}></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Layout For Word Problems */}
            {bookletType === 'problemas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flexGrow: 1, padding: '0 40px', zIndex: 3 }}>
                {exercises.map((prob, i) => (
                  <div key={prob.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', color: '#222' }}>
                    <p style={{ fontSize: '2rem', marginBottom: '10px', lineHeight: '1.4' }}>{prob.storyText}</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>{prob.question}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Respuesta:</span>
                      {isInteractive ? (
                        <div style={{ display: 'flex', gap: '15px' }}>
                          {prob.options.map((opt, idx) => {
                            const isSelected = answers[prob.id] === opt;
                            let btnBg = isSelected ? '#FCE029' : '#eee';
                            if (isSubmitted) {
                              if (opt === prob.answer) btnBg = '#4CAF50';
                              else if (isSelected) btnBg = '#f44336';
                            }
                            return (
                              <button 
                                key={idx} 
                                onClick={() => handleSelectAnswer(prob.id, opt)}
                                style={{ padding: '10px 30px', border: '3px solid #333', borderRadius: '8px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.5rem' }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ flex: 1, height: '60px', border: '2px solid #555', background: 'white' }}></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout For Fractions */}
            {bookletType === 'fracciones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flexGrow: 1, padding: '0 40px', zIndex: 3 }}>
                {exercises.map((frac, i) => (
                  <div key={frac.id} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '2rem', marginBottom: '20px', fontWeight: 'bold', color: '#222' }}>{isInteractive ? "¿Qué fracción es?" : `Colorea: ${frac.text}`}</p>
                      
                      {/* Rectangular Fraction Bar */}
                      <div style={{ display: 'flex', border: '4px solid #333', width: '300px', height: '60px', background: 'white' }}>
                        {Array.from({ length: frac.den }).map((_, i) => {
                          const isFilled = i < frac.num;
                          const fill = isInteractive && isFilled ? theme.color : 'transparent';
                          return (
                            <div 
                              key={i} 
                              style={{ 
                                flex: 1, 
                                background: fill, 
                                borderRight: i < frac.den - 1 ? '4px solid #333' : 'none' 
                              }}
                            />
                          );
                        })}
                      </div>

                    </div>

                    {isInteractive && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {frac.options.map((opt, idx) => {
                          const isSelected = answers[frac.id] === opt;
                          let btnBg = isSelected ? '#FCE029' : '#eee';
                          if (isSubmitted) {
                            if (opt === frac.answer) btnBg = '#4CAF50';
                            else if (isSelected) btnBg = '#f44336';
                          }
                          return (
                            <button 
                              key={idx} 
                              onClick={() => handleSelectAnswer(frac.id, opt)}
                              style={{ padding: '15px 40px', border: '3px solid #333', borderRadius: '8px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.8rem' }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
          </div> {/* End Main Content Area */}
          
          </div> {/* End Inner White Page */}

        </div> {/* End pdf-container */}
      </div>

      {isInteractive && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          {!isSubmitted ? (
            <button onClick={checkAnswers} className="block-btn" style={{ fontSize: '1.5rem', padding: '15px 40px', background: '#4CAF50' }}>
              Revisar mi Cuadernillo
            </button>
          ) : (
            <div className="block-panel" style={{ display: 'inline-block', background: score === exercises.length ? '#4CAF50' : '#FF9800', color: 'white' }}>
              <h2 style={{ fontSize: '2.5rem', marginBottom: '10px', textShadow: '2px 2px 0 #000' }}>
                {score === exercises.length ? '¡PERFECTO!' : '¡SIGUE INTENTANDO!'}
              </h2>
              <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Acertaste {score} de {exercises.length} ejercicios.</p>
              {score === exercises.length && currentUser && currentUser.role === 'student' && (
                <div style={{ background: '#FFC107', color: 'black', padding: '10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '20px', border: '2px solid white' }}>
                  ⭐ ¡Has ganado +50 Puntos de Experiencia (XP)!
                </div>
              )}
              <button onClick={generateKit} className="block-btn secondary" style={{ fontSize: '1.2rem', border: '2px solid white' }}>
                Generar una Hoja Nueva
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
