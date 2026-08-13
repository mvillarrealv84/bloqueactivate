import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    };
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id, session.user.email);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id, email) => {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('id', id).single();
    if (data) {
      setCurrentUser({ ...data, email });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return false;
    return true;
  };

  const register = async (email, password, name, role = 'student') => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, message: error.message };
    
    if (data.user) {
      const newUserProfile = {
        id: data.user.id,
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
      const { error: profileError } = await supabase.from('user_profiles').insert([newUserProfile]);
      if (!profileError) {
        setCurrentUser({ ...newUserProfile, email });
        return { success: true };
      } else {
        return { success: false, message: `Error en perfil: ${profileError.message}` };
      }
    }
    return { success: false, message: "Error desconocido" };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const markMissionComplete = async (missionId) => {
    if (!currentUser || currentUser.role === 'teacher') return;
    if (currentUser.progress.includes(missionId)) return;

    const newProgress = [...currentUser.progress, missionId];
    
    // Optimistic UI update
    setCurrentUser({ ...currentUser, progress: newProgress });

    await supabase.from('user_profiles').update({ progress: newProgress }).eq('id', currentUser.id);
  };

  const addMathXP = async (category, xpPoints) => {
    if (!currentUser || currentUser.role === 'teacher') return;

    const currentStats = currentUser.mathStats || {
      sumas: 0, restas: 0, multiplicaciones: 0, tablas: 0, problemas: 0, fracciones: 0
    };
    const newCategoryXP = (currentStats[category] || 0) + xpPoints;
    
    const newMathStats = { ...currentStats, [category]: newCategoryXP };

    // Optimistic UI update
    setCurrentUser({ ...currentUser, mathStats: newMathStats });

    await supabase.from('user_profiles').update({ mathStats: newMathStats }).eq('id', currentUser.id);
  };

  const getAllStudents = async () => {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('role', 'student');
    if (error) return [];
    return data;
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, login, register, logout, markMissionComplete, addMathXP, getAllStudents }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

