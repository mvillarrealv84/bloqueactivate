import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { ArrowLeft, Download, MonitorPlay, Settings, RefreshCw } from 'lucide-react';
import { generateOperations, generateMultiplications, generateWordProblem, generateFractions } from '../utils/MathGenerator';

export default function MathKit() {
  const [opDigits, setOpDigits] = useState(2);
  const [mulDigits, setMulDigits] = useState(2);
  const [kit, setKit] = useState(null);
  
  const [isInteractive, setIsInteractive] = useState(true);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  const printRef = useRef(null);
  const { width, height } = useWindowSize();

  const generateKit = () => {
    setKit({
      operations: generateOperations(4, opDigits),
      multiplications: generateMultiplications(4, mulDigits),
      wordProblem: generateWordProblem(),
      fractions: generateFractions()
    });
    setAnswers({});
    setIsSubmitted(false);
    setShowConfetti(false);
  };

  useEffect(() => {
    generateKit();
  }, []); // Initial generation

  const handleDownload = () => {
    setIsInteractive(false);
    setTimeout(() => {
      const element = printRef.current;
      const opt = {
        margin:       0,
        filename:     `MathKit_MundoDeBloques.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 794, windowHeight: 1123 },
        jsPDF:        { unit: 'px', format: [794, 1123], orientation: 'portrait', hotfixes: ['px_scaling'] }
      };
      html2pdf().set(opt).from(element).save();
    }, 100);
  };

  const handleSelectAnswer = (actId, val) => {
    if (isSubmitted) return;
    setAnswers(prev => ({ ...prev, [actId]: val }));
  };

  const checkAnswers = () => {
    if (!kit) return;
    let correctCount = 0;
    let totalCount = 4 + 4 + 1 + 1; // 10 problems total

    // Check Operations
    kit.operations.forEach(op => {
      if (answers[op.id] === op.answer) correctCount++;
    });
    // Check Multiplications
    kit.multiplications.forEach(mul => {
      if (answers[mul.id] === mul.answer) correctCount++;
    });
    // Check Word Problem
    if (answers[kit.wordProblem.id] === kit.wordProblem.answer) correctCount++;
    // Check Fractions
    if (answers[kit.fractions.id] === kit.fractions.answer) correctCount++;

    setScore(correctCount);
    setIsSubmitted(true);
    if (correctCount === totalCount) {
      setShowConfetti(true);
    }
  };

  if (!kit) return <div style={{color:'white'}}>Cargando Kit...</div>;

  const totalQuestions = 10;

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
          <Settings size={20} color="#FCE029" />
          <strong>Dificultad Sumas/Restas:</strong>
          <select value={opDigits} onChange={e => setOpDigits(parseInt(e.target.value))} style={{ padding: '5px', fontSize: '1.2rem', borderRadius: '4px' }}>
            <option value={1}>1 Cifra</option>
            <option value={2}>2 Cifras</option>
            <option value={3}>3 Cifras</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={20} color="#FCE029" />
          <strong>Dificultad Multiplicaciones:</strong>
          <select value={mulDigits} onChange={e => setMulDigits(parseInt(e.target.value))} style={{ padding: '5px', fontSize: '1.2rem', borderRadius: '4px' }}>
            <option value={1}>1 Cifra</option>
            <option value={2}>2 Cifras</option>
            <option value={3}>3 Cifras</option>
          </select>
        </div>
        <button onClick={generateKit} className="block-btn" style={{ marginLeft: 'auto', background: '#9C27B0', display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            backgroundImage: 'linear-gradient(#ccc 1px, transparent 1px), linear-gradient(90deg, #ccc 1px, transparent 1px)',
            backgroundSize: '40px 40px', opacity: 0.3, zIndex: 0, pointerEvents: 'none'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ flex: 1, background: '#1C4D9C', color: 'white', padding: '15px 30px', borderRadius: '8px', border: '4px solid #111', boxShadow: '4px 4px 0px rgba(0,0,0,0.5)' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', textTransform: 'uppercase', textShadow: '2px 2px 0 #000' }}>Kit de Matemáticas</h1>
                <div style={{ background: '#FCE029', color: 'black', padding: '5px 15px', borderRadius: '4px', display: 'inline-block', marginTop: '10px', fontWeight: 'bold' }}>
                  Generador Infinito ♾️
                </div>
              </div>
            </div>

            {/* Activities Grid */}
            <div className="activities-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
            }}>
              
              {/* Box 1: Operations */}
              <div className="activity-box" style={{ background: 'white', border: '4px solid #4CAF50', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#4CAF50', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>1 SUMAS Y RESTAS</span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {kit.operations.map((op, i) => (
                    <div key={op.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
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
                                style={{ padding: '10px 15px', border: '2px solid #333', borderRadius: '6px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ width: '120px', height: '40px', border: '2px dashed #aaa', borderRadius: '4px' }}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Multiplications */}
              <div className="activity-box" style={{ background: 'white', border: '4px solid #9C27B0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#9C27B0', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>2 MULTIPLICACIONES</span>
                </div>
                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {kit.multiplications.map((mul, i) => (
                    <div key={mul.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                      <span style={{ fontFamily: 'monospace', letterSpacing: '2px' }}>{mul.text}</span>
                      {isInteractive ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {mul.options.map((opt, idx) => {
                            const isSelected = answers[mul.id] === opt;
                            let btnBg = isSelected ? '#FCE029' : '#eee';
                            if (isSubmitted) {
                              if (opt === mul.answer) btnBg = '#4CAF50';
                              else if (isSelected) btnBg = '#f44336';
                            }
                            return (
                              <button 
                                key={idx} 
                                onClick={() => handleSelectAnswer(mul.id, opt)}
                                style={{ padding: '10px 15px', border: '2px solid #333', borderRadius: '6px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ width: '120px', height: '40px', border: '2px dashed #aaa', borderRadius: '4px' }}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 3: Word Problem */}
              <div className="activity-box" style={{ background: 'white', border: '4px solid #2196F3', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#2196F3', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>3 PROBLEMAS MATEMÁTICOS</span>
                </div>
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '10px', lineHeight: '1.5' }}>{kit.wordProblem.storyText}</p>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>{kit.wordProblem.question}</p>
                  
                  {isInteractive ? (
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      {kit.wordProblem.options.map((opt, idx) => {
                        const isSelected = answers[kit.wordProblem.id] === opt;
                        let btnBg = isSelected ? '#FCE029' : '#eee';
                        if (isSubmitted) {
                          if (opt === kit.wordProblem.answer) btnBg = '#4CAF50';
                          else if (isSelected) btnBg = '#f44336';
                        }
                        return (
                          <button 
                            key={idx} 
                            onClick={() => handleSelectAnswer(kit.wordProblem.id, opt)}
                            style={{ padding: '15px 30px', border: '3px solid #333', borderRadius: '8px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.3rem' }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: '1.2rem', color: '#666' }}>Respuesta:</p>
                      <div style={{ width: '100%', height: '80px', border: '2px dashed #aaa', borderRadius: '8px' }}></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Box 4: Fractions */}
              <div className="activity-box" style={{ background: 'white', border: '4px solid #FF9800', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#FF9800', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>4 FRACCIONES</span>
                </div>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>{isInteractive ? "¿Qué fracción representa la pizza?" : `Colorea la fracción que se indica: ${kit.fractions.text}`}</p>
                  
                  {/* SVG Fraction Drawer */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <svg width="150" height="150" viewBox="-1 -1 2 2" style={{ border: '4px solid #333', borderRadius: '50%', background: '#fff' }}>
                      {Array.from({ length: kit.fractions.den }).map((_, i) => {
                        const angle = (2 * Math.PI) / kit.fractions.den;
                        const startAngle = i * angle;
                        const endAngle = (i + 1) * angle;
                        const x1 = Math.cos(startAngle);
                        const y1 = Math.sin(startAngle);
                        const x2 = Math.cos(endAngle);
                        const y2 = Math.sin(endAngle);
                        // Large arc flag
                        const largeArc = angle > Math.PI ? 1 : 0;
                        const d = `M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`;
                        
                        const isFilled = i < kit.fractions.num;
                        const fill = isInteractive && isFilled ? '#FF5722' : 'transparent';
                        
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
                    <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                      {kit.fractions.options.map((opt, idx) => {
                        const isSelected = answers[kit.fractions.id] === opt;
                        let btnBg = isSelected ? '#FCE029' : '#eee';
                        if (isSubmitted) {
                          if (opt === kit.fractions.answer) btnBg = '#4CAF50';
                          else if (isSelected) btnBg = '#f44336';
                        }
                        return (
                          <button 
                            key={idx} 
                            onClick={() => handleSelectAnswer(kit.fractions.id, opt)}
                            style={{ padding: '15px 25px', border: '3px solid #333', borderRadius: '8px', background: btnBg, cursor: isSubmitted ? 'default' : 'pointer', fontWeight: 'bold', fontSize: '1.3rem' }}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {isInteractive && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          {!isSubmitted ? (
            <button onClick={checkAnswers} className="block-btn" style={{ fontSize: '1.5rem', padding: '15px 40px' }}>
              Calificar Kit Mágico
            </button>
          ) : (
            <div className="block-panel" style={{ display: 'inline-block', background: score === totalQuestions ? '#4CAF50' : '#FF9800', color: 'white' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>
                {score === totalQuestions ? '¡PERFECTO!' : '¡CASI!'}
              </h2>
              <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Has acertado {score} de {totalQuestions} ejercicios.</p>
              <button onClick={generateKit} className="block-btn secondary" style={{ fontSize: '1.2rem', border: '2px solid white' }}>
                Jugar con números nuevos
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
