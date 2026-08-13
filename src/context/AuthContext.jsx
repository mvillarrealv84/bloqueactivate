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
    if (error) return { success: false, message: error.message };
    
    if (data.user) {
      const { data: profileData, error: profileError } = await supabase.from('user_profiles').select('*').eq('id', data.user.id).single();
      if (profileData) {
        setCurrentUser({ ...profileData, email: data.user.email });
        return { success: true };
      } else {
        return { success: false, message: `Error perfil: ${profileError ? profileError.message : 'No encontrado'}` };
      }
    }
    return { success: false, message: 'Error desconocido al iniciar sesión' };
  };

  const register = async (email, password, name, role = 'student') => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { success: false, message: error.message };
    
    if (data.user) {
      const newUserProfile = {
        id: data.user.id,
        email,
        name,
        role,
        school_id: null,
        course_id: null,
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

  const createSchool = async (name) => {
    const { data, error } = await supabase.from('schools').insert([{ name }]).select().single();
    if (error) {
      console.error('Error creating school:', error);
      return null;
    }
    return data;
  };

  const getSchools = async () => {
    const { data, error } = await supabase.from('schools').select('*').order('name');
    if (error) {
      console.error('Error fetching schools:', error);
      return [];
    }
    return data;
  };

  const createCourse = async (name, schoolId, teacherId = null) => {
    const finalTeacherId = teacherId || (currentUser?.role === 'teacher' ? currentUser.id : null);
    const { data, error } = await supabase.from('courses').insert([{ 
      name, 
      school_id: schoolId,
      teacher_id: finalTeacherId
    }]).select().single();
    if (error) {
      console.error('Error creating course:', error);
      return null;
    }
    return data;
  };

  const getCourses = async (schoolId) => {
    const { data, error } = await supabase.from('courses').select('*').eq('school_id', schoolId).order('name');
    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
    return data;
  };

  const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase.from('user_profiles').update(updates).eq('id', userId).select().single();
    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error };
    }
    return { success: true, data };
  };

  const getTeachers = async () => {
    const { data, error } = await supabase.from('user_profiles').select('*').eq('role', 'teacher').order('name');
    if (error) {
      console.error('Error fetching teachers:', error);
      return [];
    }
    return data;
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      register, 
      logout, 
      markMissionComplete, 
      addMathXP, 
      getAllStudents,
      createSchool,
      getSchools,
      createCourse,
      getCourses,
      updateProfile,
      getTeachers
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

