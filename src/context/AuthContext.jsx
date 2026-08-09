import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const register = (email, password, name, role = 'student') => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.email === email)) {
      return false; // Email already exists
    }
    const newUser = { 
      email, 
      password, 
      name, 
      role, 
      progress: [],
      mathStats: {
        sumas: 0,
        restas: 0,
        multiplicaciones: 0,
        tablas: 0,
        problemas: 0,
        fracciones: 0
      }
    };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const markMissionComplete = (missionId) => {
    if (!currentUser || currentUser.role === 'teacher') return;
    if (currentUser.progress.includes(missionId)) return;

    const updatedUser = { ...currentUser, progress: [...currentUser.progress, missionId] };
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const addMathXP = (category, xpPoints) => {
    if (!currentUser || currentUser.role === 'teacher') return;

    const currentStats = currentUser.mathStats || {
      sumas: 0, restas: 0, multiplicaciones: 0, tablas: 0, problemas: 0, fracciones: 0
    };

    const newCategoryXP = (currentStats[category] || 0) + xpPoints;

    const updatedUser = {
      ...currentUser,
      mathStats: {
        ...currentStats,
        [category]: newCategoryXP
      }
    };

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => u.email === updatedUser.email ? updatedUser : u);
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const getAllStudents = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Return users with role 'student' or undefined (legacy accounts before roles existed)
    return users.filter(u => u.role === 'student' || !u.role);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, markMissionComplete, addMathXP, getAllStudents }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
