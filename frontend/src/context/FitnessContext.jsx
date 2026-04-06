import React, {
  createContext, useContext, useState,
  useEffect, useCallback
} from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch full dashboard data from backend on mount / login
  useEffect(() => {
    const fetchDashboard = async () => {
      console.log('[FITNESS] useEffect triggered | isAuthenticated:', isAuthenticated);
      if (!isAuthenticated) {
        console.log('[FITNESS] User not authenticated, skipping dashboard fetch');
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        console.log('[FITNESS] Fetching dashboard data...');
        const res = await api.get('/dashboard');
        console.log('[FITNESS] ✓ Dashboard data fetched successfully');
        setUser(res.data);
      } catch (err) {
        console.error('[FITNESS] ❌ Failed to fetch dashboard:', err);
        if (err.response?.status === 401) {
          console.error('[FITNESS] ❌ Got 401 Unauthorized - token may be invalid or expired');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAuthenticated]);

  // ✅ Update profile — persist to backend
  const updateProfile = useCallback(async (updatedData) => {
    if (!user?.id) return;
    try {
      const res = await api.put(`/users/${user.id}`, updatedData);
      setUser(prev => ({ ...prev, ...res.data }));
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw new Error(err.response?.data?.detail || 'Failed to update profile');
    }
  }, [user?.id]);

  // ✅ Add calories — persist to backend via diet log
  const addCalories = useCallback(async (amount) => {
    if (!user) return;
    const newAmount = Math.max(0, (user.caloriesConsumed || 0) + amount);
    try {
      // Update local state for immediate feedback
      setUser(prev => prev ? { ...prev, caloriesConsumed: newAmount } : prev);
      
      // Update backend via diet log entry (minimal update)
      // Note: In a full app, we'd send the full meal list, 
      // but for quick context adds, we update the user profile or a summary log.
      await api.put(`/users/${user.id}`, { calories_consumed: newAmount });
    } catch (err) {
      console.error('Failed to sync calories:', err);
    }
  }, [user]);

  // ✅ Update macros — persist to backend
  const updateMacros = useCallback(async (delta) => {
    if (!user) return;
    const newMacros = {
      protein: Math.max(0, (user.macros?.protein || 0) + (delta.protein || 0)),
      carbs:   Math.max(0, (user.macros?.carbs   || 0) + (delta.carbs   || 0)),
      fats:    Math.max(0, (user.macros?.fats    || 0) + (delta.fats    || 0)),
    };
    try {
      setUser(prev => prev ? { ...prev, macros: newMacros } : prev);
      await api.put(`/users/${user.id}`, { macros: newMacros });
    } catch (err) {
      console.error('Failed to sync macros:', err);
    }
  }, [user]);

  // ✅ Add progress — persist to backend
  const addProgress = useCallback(async (amount) => {
    if (!user?.id) return;
    try {
      const newProgress = Math.min(100, (user.overallProgress || 0) + amount);
      await api.put(`/users/${user.id}`, { overall_progress: newProgress });
      setUser(prev => ({
        ...prev,
        overallProgress: newProgress,
      }));
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  }, [user?.id, user?.overallProgress]);

  return (
    <FitnessContext.Provider value={{
      user,
      loading,
      updateProfile,
      addCalories,
      updateMacros,
      addProgress,
    }}>
      {children}
    </FitnessContext.Provider>
  );
};

export const useFitness = () => {
  const context = useContext(FitnessContext);
  if (!context) throw new Error('useFitness must be used within FitnessProvider');
  return context;
};