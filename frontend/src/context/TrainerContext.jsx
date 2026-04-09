import React, {
  createContext, useContext, useState,
  useEffect, useCallback
} from 'react';
import { useAuth } from './AuthContext';
import { trainerAPI } from '../services/api';
import api from '../services/api';

const TrainerContext = createContext();

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const mondayStart = new Date(today);
  const currentDay = today.getDay();
  const deltaToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  mondayStart.setDate(today.getDate() + deltaToMonday + weekOffset * 7);
  return DAY_NAMES.map((_, index) => {
    const date = new Date(mondayStart);
    date.setDate(mondayStart.getDate() + index);
    return date;
  });
};

export const TrainerProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();

  const [clients,   setClients]   = useState([]);
  const [workouts,  setWorkouts]  = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');

  // ✅ Fetch all trainer data from backend when trainer logs in
  useEffect(() => {
    const fetchTrainerData = async () => {
      if (!isAuthenticated || authUser?.role !== 'trainer') return;

      setLoading(true);
      try {
        // Fetch clients, workouts, and diet plans in parallel
        const [clientsRes, workoutsRes, dietPlansRes] = await Promise.all([
          api.get('/users/my-clients'),
          trainerAPI.getWorkouts(),
          trainerAPI.getDietPlans(),
        ]);
        setClients(clientsRes.data);
        setWorkouts(workoutsRes.data);
        setDietPlans(dietPlansRes.data);

        const weekDates = getWeekDates();
        const sessionsRes = await trainerAPI.getSessions(
          formatDateKey(weekDates[0]),
          formatDateKey(weekDates[6])
        );
        setSessions(sessionsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch trainer data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainerData();
  }, [isAuthenticated, authUser?.role]);

  const fetchSessions = useCallback(async (startDate, endDate) => {
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const res = await trainerAPI.getSessions(startDate, endDate);
      setSessions(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error('Failed to fetch trainer sessions:', err);
      setSessionsError(err.response?.data?.detail || 'Failed to load sessions.');
      setSessions([]);
      return [];
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const createSession = useCallback(async (sessionData) => {
    const res = await trainerAPI.createSession(sessionData);
    setSessions(prev => [...prev, res.data]);
    return res.data;
  }, []);

  const deleteSession = useCallback(async (sessionId) => {
    await trainerAPI.deleteSession(sessionId);
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  }, []);

  const assignDailyMissions = useCallback(async ({ clientId, tasks, date }) => {
    try {
      const res = await trainerAPI.assignDailyMissions({ clientId, tasks, date });
      setClients(prev =>
        prev.map(c => c.id === clientId
          ? { ...c, hasTrainerMissionToday: true }
          : c
        )
      );
      return res.data;
    } catch (err) {
      console.error('Failed to assign daily missions:', err);
      throw err;
    }
  }, []);

  const clearDailyMissions = useCallback(async ({ clientId, date }) => {
    try {
      const res = await trainerAPI.clearDailyMissions({ clientId, date });
      setClients(prev =>
        prev.map(c => c.id === clientId
          ? { ...c, hasTrainerMissionToday: false }
          : c
        )
      );
      return res.data;
    } catch (err) {
      console.error('Failed to clear daily missions:', err);
      throw err;
    }
  }, []);

  // ✅ Create workout — persist to backend then update local state
  const addWorkout = useCallback(async (workoutData) => {
    try {
      const res = await trainerAPI.createWorkout({
        name:        workoutData.name,
        description: workoutData.description || '',
        day:         workoutData.day || null,
        exercises:   workoutData.exercises || [],
        duration:    workoutData.duration || '45-60 min',
        intensity:   workoutData.intensity || 'Medium',
      });
      setWorkouts(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to create workout:', err);
      throw err;
    }
  }, []);

  // ✅ Create diet plan — persist to backend then update local state
  const addDietPlan = useCallback(async (planData) => {
    try {
      const res = await trainerAPI.createDietPlan({
        name:           planData.name,
        description:    planData.description || '',
        daily_calories: planData.dailyCalories || 2000,
        daily_protein:  planData.dailyProtein  || 120,
        daily_carbs:    planData.dailyCarbs    || 250,
        daily_fats:     planData.dailyFats     || 60,
        duration:       planData.duration      || 'Flexible',
        day:            planData.day           || null,
        meals:          planData.meals         || [],
      });
      setDietPlans(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Failed to create diet plan:', err);
      throw err;
    }
  }, []);

  // ✅ Assign workout to client — calls backend endpoint
  const assignWorkoutToClient = useCallback(async (clientId, workoutId) => {
    try {
      const res = await trainerAPI.assignWorkoutToClient(clientId, workoutId);
      // Update client in local state
      setClients(prev =>
        prev.map(c => c.id === clientId
          ? { ...c, assignedWorkout: res.data.assignedWorkout }
          : c
        )
      );
      return res.data;
    } catch (err) {
      console.error('Failed to assign workout:', err);
      throw err;
    }
  }, []);

  // ✅ Assign diet plan to client — calls backend endpoint
  const assignDietToClient = useCallback(async (clientId, planId) => {
    try {
      const res = await trainerAPI.assignDietToClient(clientId, planId);
      // Update client in local state
      setClients(prev =>
        prev.map(c => c.id === clientId
          ? { ...c, assignedDiet: res.data.assignedDiet }
          : c
        )
      );
      return res.data;
    } catch (err) {
      console.error('Failed to assign diet plan:', err);
      throw err;
    }
  }, []);

  // ✅ Delete workout — persist to backend
  const removeWorkout = useCallback(async (workoutId) => {
    try {
      await api.delete(`/workouts/${workoutId}`);
      setWorkouts(prev => prev.filter(w => w.id !== workoutId));
    } catch (err) {
      console.error('Failed to delete workout:', err);
      throw err;
    }
  }, []);

  // ✅ Delete diet plan — persist to backend
  const removeDietPlan = useCallback(async (planId) => {
    try {
      await api.delete(`/diet-plans/${planId}`);
      setDietPlans(prev => prev.filter(p => p.id !== planId));
    } catch (err) {
      console.error('Failed to delete diet plan:', err);
      throw err;
    }
  }, []);

  return (
    <TrainerContext.Provider value={{
      clients,
      workouts,
      dietPlans,
      sessions,
      loading,
      sessionsLoading,
      sessionsError,
      addWorkout,
      addDietPlan,
      fetchSessions,
      createSession,
      deleteSession,
      assignDailyMissions,
      clearDailyMissions,
      assignWorkoutToClient,
      assignDietToClient,
      removeWorkout,
      removeDietPlan,
    }}>
      {children}
    </TrainerContext.Provider>
  );
};

export const useTrainer = () => {
  const context = useContext(TrainerContext);
  if (!context) throw new Error('useTrainer must be used within TrainerProvider');
  return context;
};
