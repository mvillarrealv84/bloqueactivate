import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ArrowLeft, Download, MonitorPlay, Settings, RefreshCw, Book } from 'lucide-react';
import { generateOperations, generateMultiplications, generateTimesTable, generateWordProblem, generateFractions } from '../utils/MathGenerator';

export default function MathKit() {
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
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 794, windowHeight: 1123 },
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
            minHeight: isInteractive ? 'auto' : '1123px',
            background: '#F0F0F0',
            padding: isInteractive ? '0' : '40px',
            borderRadius: isInteractive ? '0' : '12px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Grid Pattern */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundImage: 'linear-gradient(#ddd 1px, transparent 1px), linear-gradient(90deg, #ddd 1px, transparent 1px)',
            backgroundSize: '40px 40px', opacity: 0.5, zIndex: 0, pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
              <div style={{ flex: 1, background: 'white', color: theme.color, padding: '20px 30px', borderRadius: '8px', border: `6px solid ${theme.color}`, boxShadow: '4px 4px 0px rgba(0,0,0,0.2)', textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', textTransform: 'uppercase', fontWeight: '900' }}>{theme.title}</h1>
                <h2 style={{ margin: '5px 0 0 0', fontSize: '1.2rem', color: '#555' }}>{theme.sub}</h2>
              </div>
            </div>

            {/* Layout For Operations & Times Tables */}
            {['sumas', 'restas', 'multiplicaciones', 'tablas'].includes(bookletType) && (
              <div style={{ 
                background: 'white', 
                border: `4px solid ${theme.color}`, 
                borderRadius: '8px', 
                padding: '30px', 
                display: 'grid', 
                gridTemplateColumns: bookletType === 'tablas' ? '1fr' : '1fr 1fr', 
                gap: '20px',
                flexGrow: 1
              }}>
                {exercises.map((op, i) => (
                  <div key={op.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.8rem', fontWeight: 'bold', borderBottom: '2px dashed #ddd', paddingBottom: '10px' }}>
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
                              style={{ padding: '10px 15px', border: '2px solid #333', borderRadius: '6px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.2rem', minWidth: '80px' }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ width: '120px', height: '40px', border: '2px solid #aaa', borderRadius: '4px', background: '#fafafa' }}></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Layout For Word Problems */}
            {bookletType === 'problemas' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
                {exercises.map((prob, i) => (
                  <div key={prob.id} style={{ background: 'white', border: `4px solid ${theme.color}`, borderRadius: '8px', padding: '30px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: theme.color, color: 'white', display: 'inline-block', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', marginBottom: '20px', alignSelf: 'flex-start' }}>Problema {i+1}</div>
                    <p style={{ fontSize: '1.8rem', marginBottom: '20px', lineHeight: '1.5' }}>{prob.storyText}</p>
                    <p style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '30px', color: theme.color }}>{prob.question}</p>
                    
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      {isInteractive ? (
                        prob.options.map((opt, idx) => {
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
                              style={{ padding: '20px 40px', border: '4px solid #333', borderRadius: '12px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.5rem' }}
                            >
                              {opt}
                            </button>
                          );
                        })
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Respuesta:</span>
                          <div style={{ flex: 1, height: '80px', border: '3px dashed #aaa', borderRadius: '12px', background: '#fafafa' }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Layout For Fractions */}
            {bookletType === 'fracciones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flexGrow: 1 }}>
                {exercises.map((frac, i) => (
                  <div key={frac.id} style={{ background: 'white', border: `4px solid ${theme.color}`, borderRadius: '8px', padding: '30px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-around' }}>
                    
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.8rem', marginBottom: '20px', fontWeight: 'bold' }}>{isInteractive ? "¿Qué fracción es?" : `Colorea: ${frac.text}`}</p>
                      <svg width="250" height="250" viewBox="-1 -1 2 2" style={{ border: '6px solid #333', borderRadius: '50%', background: '#fff' }}>
                        {Array.from({ length: frac.den }).map((_, i) => {
                          const angle = (2 * Math.PI) / frac.den;
                          const startAngle = i * angle;
                          const endAngle = (i + 1) * angle;
                          const x1 = Math.cos(startAngle);
                          const y1 = Math.sin(startAngle);
                          const x2 = Math.cos(endAngle);
                          const y2 = Math.sin(endAngle);
                          const largeArc = angle > Math.PI ? 1 : 0;
                          const d = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;
                          const isFilled = i < frac.num;
                          const fill = isInteractive && isFilled ? theme.color : 'transparent';
                          
                          return (
                            <path 
                              key={i} 
                              d={d} 
                              fill={fill} 
                              stroke="#333" 
                              strokeWidth="0.05"
                            />
                          );
                        })}
                      </svg>
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
                              style={{ padding: '20px 40px', border: '4px solid #333', borderRadius: '12px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.8rem' }}
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
          </div>
        </div>
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
              <p style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Acertaste {score} de {exercises.length} ejercicios.</p>
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
