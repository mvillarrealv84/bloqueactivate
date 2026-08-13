import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Trophy, Users, X, Printer, Shield, Sword, Award, Star, BookOpen, Calculator, BrainCircuit, UserPlus, Book } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import { supabase } from '../supabaseClient';

export default function TeacherDashboard() {
  const { currentUser, loading, logout, updateProfile } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [printingTrophy, setPrintingTrophy] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [emailInput, setEmailInput] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);
  const [addMessage, setAddMessage] = useState('');
  const printRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('teacher_id', currentUser.id);
      
      if (!error && data) {
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0]);
        }
      }
    };

    if (currentUser?.role === 'teacher') {
      fetchCourses();
    }
  }, [currentUser]);

  const fetchStudentsForCourse = async (courseId) => {
    setLoadingStudents(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'student')
      .eq('course_id', courseId);
    
    if (!error && data) {
      setStudents(data);
    } else {
      setStudents([]);
    }
    setLoadingStudents(false);
  };

  useEffect(() => {
    if (selectedCourse) {
      fetchStudentsForCourse(selectedCourse.id);
    } else {
      setStudents([]);
      setLoadingStudents(false);
    }
  }, [selectedCourse]);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !selectedCourse) return;

    setAddingStudent(true);
    setAddMessage('');
    
    // Find student by email
    const { data: studentData, error: studentError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', emailInput.trim())
      .single();

    if (studentError || !studentData) {
      setAddMessage('No se encontró un alumno con ese email.');
      setAddingStudent(false);
      return;
    }

    // Update student's course and school
    const { success } = await updateProfile(studentData.id, { 
      course_id: selectedCourse.id, 
      school_id: selectedCourse.school_id 
    });

    if (success) {
      setAddMessage('¡Alumno añadido con éxito!');
      setEmailInput('');
      fetchStudentsForCourse(selectedCourse.id);
    } else {
      setAddMessage('Error al añadir al alumno.');
    }
    
    setAddingStudent(false);
    setTimeout(() => setAddMessage(''), 3000);
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>Cargando Panel...</div>;
  }

  if (currentUser?.role !== 'teacher') {
    return <Navigate to="/maestros/login" />;
  }

  const handlePrintCertificate = (trophy) => {
    setPrintingTrophy(trophy);
    setTimeout(() => {
      const element = printRef.current;
      if (!element) return;
      
      const opt = {
        margin:       10,
        filename:     `Certificado_${selectedStudent.name}_${trophy.title}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };
      html2pdf().set(opt).from(element).save().then(() => {
        setPrintingTrophy(null);
      });
    }, 100);
  };

  const getTrophies = (student) => {
    const stats = student.mathStats || {};
    const missions = student.progress?.length || 0;
    
    return [
      { id: 'm50', title: 'Aventurero Medio', desc: '50 Misiones de Historia', unlocked: missions >= 50, img: '/trophies/sword.jpg', color: '#607D8B' },
      { id: 'm100', title: 'Héroe de Bloques', desc: '100 Misiones Completadas', unlocked: missions >= 100, img: '/trophies/armor.jpg', color: '#FFC107' },
      { id: 'sum', title: 'Maestro Sumador', desc: '500 XP en Sumas', unlocked: (stats.sumas || 0) >= 500, img: '/trophies/potion.jpg', color: '#4CAF50' },
      { id: 'res', title: 'Arquero de Restas', desc: '500 XP en Restas', unlocked: (stats.restas || 0) >= 500, img: '/trophies/bow.jpg', color: '#E91E63' },
      { id: 'mul', title: 'Minero Multiplicador', desc: '500 XP en Multiplicaciones', unlocked: (stats.multiplicaciones || 0) >= 500, img: '/trophies/pickaxe.jpg', color: '#9C27B0' },
      { id: 'div', title: 'Cerebro Lógico', desc: '500 XP en Problemas', unlocked: (stats.problemas || 0) >= 500, img: '/trophies/compass.jpg', color: '#2196F3' },
      { id: 'fra', title: 'Chef de Fracciones', desc: '500 XP en Fracciones', unlocked: (stats.fracciones || 0) >= 500, img: '/trophies/apple.jpg', color: '#FF9800' },
      { id: 'all', title: 'LEYENDA MATEMÁTICA', desc: 'Todos los Trofeos Obtenidos', unlocked: false, img: '/trophies/epic.jpg', color: '#FFD700', isUltimate: true }
    ];
  };

  return (
    <div className="app-container" style={{ paddingBottom: '50px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ color: '#F44336', fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={32} /> Panel de Profesor: {currentUser.name}
        </div>
        <button onClick={logout} className="block-btn secondary" style={{ padding: '8px 16px', fontSize: '1rem' }}>
          <LogOut size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>
          Cerrar Sesión
        </button>
      </div>

      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 className="block-title" style={{ fontSize: '3rem', color: '#F44336' }}>Libro de Calificaciones y Premios</h1>
        <h2 style={{ color: 'white', marginTop: '1rem' }}>Métricas de Progreso y Trofeos (XP)</h2>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '2rem', background: '#222', padding: '20px', borderRadius: '12px', border: '4px solid #444' }}>
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <Book size={20} color="#2196F3" /> Seleccionar Curso
          </h3>
          {courses.length === 0 ? (
            <p style={{ color: '#aaa' }}>No tienes cursos asignados.</p>
          ) : (
            <select 
              className="block-input" 
              value={selectedCourse?.id || ''} 
              onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value))}
              style={{ width: '100%', padding: '10px', fontSize: '1rem' }}
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          )}
        </div>

        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <UserPlus size={20} color="#4CAF50" /> Añadir Alumno al Curso
          </h3>
          <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="email" 
              className="block-input" 
              placeholder="Email del alumno..." 
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              style={{ flex: '1', padding: '10px', fontSize: '1rem' }}
              disabled={addingStudent || !selectedCourse}
            />
            <button 
              type="submit" 
              className="block-btn primary" 
              disabled={addingStudent || !selectedCourse || !emailInput.trim()}
              style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              {addingStudent ? 'Añadiendo...' : 'Añadir'}
            </button>
          </form>
          {addMessage && (
            <p style={{ marginTop: '10px', color: addMessage.includes('éxito') ? '#4CAF50' : '#F44336', fontSize: '0.9rem' }}>
              {addMessage}
            </p>
          )}
        </div>
      </div>

      <div className="block-panel" style={{ background: 'white', color: 'black', overflowX: 'auto' }}>
        {loadingStudents ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#666' }}>Cargando alumnos...</h3>
          </div>
        ) : !selectedCourse ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#666' }}>Selecciona un curso para ver a tus alumnos.</h3>
          </div>
        ) : students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3 style={{ color: '#666' }}>No hay alumnos en este curso.</h3>
            <p>Utiliza la herramienta de arriba para añadir alumnos por su correo electrónico.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ background: '#333', color: 'white' }}>
                <th style={{ padding: '15px', border: '1px solid #ddd' }}>Alumno</th>
                <th style={{ padding: '15px', border: '1px solid #ddd' }}>Historia</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#4CAF50' }}>Sumas</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#E91E63' }}>Restas</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#9C27B0' }}>Mult</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#2196F3' }}>Prob</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#FF9800' }}>Frac</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#F44336' }}>Tablas</th>
                <th style={{ padding: '15px', border: '1px solid #ddd', background: '#FFC107', color: 'black' }}>Premios</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, idx) => {
                const stats = student.mathStats || {};
                
                return (
                  <tr key={idx} style={{ background: idx % 2 === 0 ? '#f9f9f9' : 'white' }}>
                    <td style={{ padding: '15px', border: '1px solid #ddd', fontWeight: 'bold' }}>{student.name}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <div style={{ background: '#eee', borderRadius: '10px', overflow: 'hidden', width: '100px', height: '20px', margin: '0 auto', border: '1px solid #ccc' }}>
                        <div style={{ width: `${student.progress?.length || 0}%`, height: '100%', background: '#4CAF50' }}></div>
                      </div>
                      <span style={{ fontSize: '0.8rem' }}>{student.progress?.length || 0}/100</span>
                    </td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#4CAF50' }}>{stats.sumas || 0}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#E91E63' }}>{stats.restas || 0}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#9C27B0' }}>{stats.multiplicaciones || 0}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#2196F3' }}>{stats.problemas || 0}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#FF9800' }}>{stats.fracciones || 0}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center', fontWeight: 'bold', color: '#F44336' }}>{stats.tablas || 0}</td>
                    <td style={{ padding: '15px', border: '1px solid #ddd', textAlign: 'center' }}>
                      <button 
                        onClick={() => setSelectedStudent(student)}
                        className="block-btn" 
                        style={{ padding: '8px 15px', fontSize: '0.9rem', background: '#FFC107', color: 'black', display: 'flex', alignItems: 'center', gap: '5px', margin: '0 auto' }}
                      >
                        <Trophy size={16} /> Ver Trofeos
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Trophies Modal */}
      {selectedStudent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="block-panel" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', background: '#222', border: '6px solid #FFC107', position: 'relative' }}>
            
            <button onClick={() => setSelectedStudent(null)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={32} />
            </button>

            <h2 style={{ color: '#FFC107', fontSize: '2.5rem', textAlign: 'center', margin: '0 0 10px 0' }}>Bóveda de Trofeos</h2>
            <h3 style={{ color: 'white', textAlign: 'center', margin: '0 0 30px 0', fontSize: '1.5rem' }}>{selectedStudent.name}</h3>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
              {(() => {
                const trophies = getTrophies(selectedStudent);
                // Check if all normal trophies are unlocked
                const allUnlocked = trophies.filter(t => !t.isUltimate).every(t => t.unlocked);
                if (allUnlocked) {
                  trophies.find(t => t.isUltimate).unlocked = true;
                }

                return trophies.map(t => (
                  <div key={t.id} style={{ 
                    width: '200px', 
                    background: t.unlocked ? 'white' : '#444', 
                    border: `4px solid ${t.unlocked ? t.color : '#666'}`, 
                    borderRadius: '12px', 
                    padding: '20px', 
                    textAlign: 'center',
                    opacity: t.unlocked ? 1 : 0.5,
                    position: 'relative',
                    boxShadow: t.unlocked ? `0 0 15px ${t.color}` : 'none'
                  }}>
                    {!t.unlocked && <div style={{ position: 'absolute', top: '5px', right: '5px' }}><LogOut size={20} color="#999" /></div>}
                    <div style={{ marginBottom: '10px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img 
                        src={t.img} 
                        alt={t.title} 
                        style={{ 
                          maxHeight: '100%', 
                          maxWidth: '100%', 
                          objectFit: 'contain', 
                          mixBlendMode: 'multiply',
                          filter: t.unlocked ? 'none' : 'grayscale(100%) opacity(50%)'
                        }} 
                      />
                    </div>
                    <h4 style={{ color: t.unlocked ? 'black' : '#999', margin: '0 0 5px 0', fontSize: '1.2rem' }}>{t.title}</h4>
                    <p style={{ color: t.unlocked ? '#555' : '#888', margin: 0, fontSize: '0.9rem' }}>{t.desc}</p>
                    
                    {t.unlocked && (
                      <button 
                        onClick={() => handlePrintCertificate(t)}
                        style={{ marginTop: '15px', width: '100%', background: t.color, color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
                      >
                        <Printer size={16} /> Imprimir
                      </button>
                    )}
                  </div>
                ));
              })()}
            </div>

            {/* Hidden Printable Certificate Template */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
              <div ref={printRef} style={{ width: '297mm', height: '210mm', background: '#F0F0F0', padding: '20mm', boxSizing: 'border-box' }}>
                <div style={{ width: '100%', height: '100%', border: `15px solid ${printingTrophy ? printingTrophy.color : '#FFC107'}`, background: 'white', padding: '40px', boxSizing: 'border-box', textAlign: 'center', position: 'relative' }}>
                  <div style={{ border: '4px solid #333', padding: '40px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '3rem', color: printingTrophy ? printingTrophy.color : '#F44336', textTransform: 'uppercase', marginBottom: '10px', textShadow: '2px 2px 0 #000' }}>¡CERTIFICADO DE LOGRO!</h1>
                    <h2 style={{ fontSize: '1.5rem', color: '#555', marginBottom: '20px' }}>MUNDO DE BLOQUES</h2>
                    
                    <p style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Se otorga el presente reconocimiento a:</p>
                    <h1 style={{ fontSize: '4.5rem', color: '#2196F3', margin: '0 0 20px 0', borderBottom: '4px solid #333', display: 'inline-block', paddingBottom: '10px' }}>{selectedStudent.name}</h1>
                    
                    <p style={{ fontSize: '1.5rem', maxWidth: '800px' }}>Por haber demostrado valentía y perseverancia al desbloquear la recompensa:</p>
                    <h2 style={{ fontSize: '2.5rem', color: printingTrophy ? printingTrophy.color : '#000', margin: '10px 0 20px 0' }}>{printingTrophy ? printingTrophy.title : ''}</h2>
                    
                    <div style={{ position: 'absolute', bottom: '40px', left: '40px', textAlign: 'center' }}>
                      <div style={{ width: '200px', borderBottom: '2px solid #333', marginBottom: '10px' }}></div>
                      <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Firma del Profesor</p>
                    </div>

                    <div style={{ position: 'absolute', bottom: '40px', right: '40px' }}>
                      <div style={{ width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {printingTrophy && <img src={printingTrophy.img} alt={printingTrophy.title} style={{ maxWidth: '100%', maxHeight: '100%', mixBlendMode: 'multiply' }} />}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
