import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, BookOpen, Plus, LogOut, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { currentUser, logout, getSchools, getCourses, createSchool, createCourse } = useAuth();
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    loadSchools();
  }, [currentUser, navigate]);

  useEffect(() => {
    if (selectedSchool) {
      loadCourses(selectedSchool);
    } else {
      setCourses([]);
    }
  }, [selectedSchool]);

  const loadSchools = async () => {
    if (getSchools) {
      const data = await getSchools();
      setSchools(data || []);
    }
  };

  const loadCourses = async (schoolId) => {
    if (getCourses) {
      const data = await getCourses(schoolId);
      setCourses(data || []);
    }
  };

  const handleCreateSchool = async (e) => {
    e.preventDefault();
    if (newSchoolName.trim() && createSchool) {
      await createSchool({ name: newSchoolName });
      setNewSchoolName('');
      loadSchools();
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (newCourseName.trim() && selectedSchool && createCourse) {
      await createCourse({ name: newCourseName, schoolId: selectedSchool });
      setNewCourseName('');
      loadCourses(selectedSchool);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!currentUser || currentUser.role !== 'admin') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: 'white', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1 style={{ margin: 0, color: '#F44336', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={32} /> Panel de Administrador
        </h1>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#333', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
          <LogOut size={20} /> Cerrar Sesión
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Schools Section */}
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '12px', border: '1px solid #444' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4AEEEA', marginBottom: '20px' }}>
            <Building size={24} /> Escuelas
          </h2>
          
          <form onSubmit={handleCreateSchool} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              value={newSchoolName}
              onChange={e => setNewSchoolName(e.target.value)}
              placeholder="Nombre de nueva escuela"
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: 'white' }}
            />
            <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#4AEEEA', color: '#1a1a1a', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              <Plus size={20} /> Añadir
            </button>
          </form>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {schools.map(school => (
              <li key={school.id || school._id} style={{ background: '#333', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {school.name}
              </li>
            ))}
            {schools.length === 0 && <p style={{ color: '#888' }}>No hay escuelas registradas.</p>}
          </ul>
        </div>

        {/* Courses Section */}
        <div style={{ background: '#2a2a2a', padding: '20px', borderRadius: '12px', border: '1px solid #444' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#FCE029', marginBottom: '20px' }}>
            <BookOpen size={24} /> Cursos
          </h2>

          <div style={{ marginBottom: '20px' }}>
            <select 
              value={selectedSchool} 
              onChange={e => setSelectedSchool(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: 'white' }}
            >
              <option value="">Selecciona una escuela...</option>
              {schools.map(school => (
                <option key={school.id || school._id} value={school.id || school._id}>{school.name}</option>
              ))}
            </select>
          </div>
          
          <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input 
              type="text" 
              value={newCourseName}
              onChange={e => setNewCourseName(e.target.value)}
              placeholder="Nombre de nuevo curso"
              disabled={!selectedSchool}
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #555', background: '#1a1a1a', color: 'white', opacity: !selectedSchool ? 0.5 : 1 }}
            />
            <button type="submit" disabled={!selectedSchool} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#FCE029', color: '#1a1a1a', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: selectedSchool ? 'pointer' : 'not-allowed', fontWeight: 'bold', opacity: !selectedSchool ? 0.5 : 1 }}>
              <Plus size={20} /> Añadir
            </button>
          </form>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {courses.map(course => (
              <li key={course.id || course._id} style={{ background: '#333', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                {course.name}
              </li>
            ))}
            {courses.length === 0 && selectedSchool && <p style={{ color: '#888' }}>No hay cursos en esta escuela.</p>}
            {!selectedSchool && <p style={{ color: '#888' }}>Selecciona una escuela para ver sus cursos.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
