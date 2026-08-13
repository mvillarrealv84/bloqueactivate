import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ActivityDetail from './pages/ActivityDetail';
import MathKit from './pages/MathKit';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherLogin from './pages/TeacherLogin';
import TeacherRegister from './pages/TeacherRegister';
import TeacherDashboard from './pages/TeacherDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '20vh' }}>Cargando Mundo...</div>;
  if (!currentUser) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/maestros/login" element={<TeacherLogin />} />
          <Route path="/maestros/register" element={<TeacherRegister />} />
          <Route path="/maestros/dashboard" element={<TeacherDashboard />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/activity/:id" element={<ProtectedRoute><ActivityDetail /></ProtectedRoute>} />
          <Route path="/math-kit" element={<ProtectedRoute><MathKit /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
