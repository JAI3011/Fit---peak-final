import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { adminAPI } from '../services/api';

const AdminContext = createContext();

const DEFAULT_SETTINGS = {
  appName: 'FitPeak',
  supportEmail: 'support@fitpeak.com',
  defaultCalorieGoal: 2400,
  features: {
    trainerPlanCreation: true,
    userLibrary: true,
  },
};

const DEFAULT_USER_SCHEMA = {
  name: '',
  email: '',
  role: 'user',
  status: 'active',
  joined: new Date().toISOString().split('T')[0],
  goal: 'Maintenance',
  progress: 0,
  assignedWorkout: null,
  assignedDiet: null,
  progressData: [],
  macros: { protein: 0, carbs: 0, fats: 0 },
  caloriesGoal: 2000,
  caloriesConsumed: 0
};

// Helper for normalizing user data with defaults
// api.js interceptor already converts snake_case → camelCase
// So we only need camelCase keys here. snake_case fallbacks removed.
const normalizeUser = (user) => ({
  ...DEFAULT_USER_SCHEMA,
  ...user,
  // id: api.js transforms _id → id already, but keep String() cast for safety
  id: user.id ? String(user.id) : undefined,
  // trainerId: api.js transforms trainer_id → trainerId already
  trainerId: user.trainerId ? String(user.trainerId) : null,
  // assignedWorkout: api.js transforms assigned_workout → assignedWorkout already
  assignedWorkout: user.assignedWorkout ?? null,
  // assignedDiet: api.js transforms assigned_diet → assignedDiet already
  assignedDiet: user.assignedDiet ?? null,
  macros: user.macros ?? DEFAULT_USER_SCHEMA.macros,
  // progressData: api.js transforms progress_data → progressData already
  progressData: user.progressData ?? [],
  // caloriesGoal: api.js transforms calories_goal → caloriesGoal already
  caloriesGoal: user.caloriesGoal ?? DEFAULT_USER_SCHEMA.caloriesGoal,
  caloriesConsumed: user.caloriesConsumed ?? DEFAULT_USER_SCHEMA.caloriesConsumed,
});

export const AdminProvider = ({ children }) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ NEW — settings state
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoading, setSettingsLoading] = useState(false);

  // ✅ NEW — fetch settings from backend on mount
  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated || authUser?.role !== 'admin') return;
      try {
        const res = await api.get('/settings');
        // Response keys are already camelCase via api.js interceptor
        setSettings({
          appName: res.data.appName || DEFAULT_SETTINGS.appName,
          supportEmail: res.data.supportEmail || DEFAULT_SETTINGS.supportEmail,
          defaultCalorieGoal: res.data.defaultCalorieGoal || DEFAULT_SETTINGS.defaultCalorieGoal,
          features: {
            trainerPlanCreation: res.data.features?.trainerPlanCreation ?? true,
            userLibrary: res.data.features?.userLibrary ?? true,
          },
        });
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, [isAuthenticated, authUser]);

  // ✅ NEW — update settings via API
  const updateSettings = useCallback(async (newSettings) => {
    setSettingsLoading(true);
    try {
      // Convert camelCase → snake_case for backend
      const payload = {
        app_name: newSettings.appName,
        support_email: newSettings.supportEmail,
        default_calorie_goal: newSettings.defaultCalorieGoal,
        features: {
          trainer_plan_creation: newSettings.features?.trainerPlanCreation,
          user_library: newSettings.features?.userLibrary,
        },
      };
      const res = await api.put('/settings', payload);
      setSettings(newSettings); // optimistic update
      return res.data;
    } catch (err) {
      console.error('Failed to update settings:', err);
      throw err;
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // Fetch users if admin is logged in
  useEffect(() => {
    const fetchUsers = async () => {
      if (isAuthenticated && authUser?.role === 'admin') {
        try {
          const res = await adminAPI.getUsers();
          setUsers(res.data.map(normalizeUser));
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      }
      setLoading(false);
    };
    fetchUsers();
  }, [isAuthenticated, authUser]);

  const trainers = useMemo(() => users.filter(u => u.role === 'trainer'), [users]);

  const addUser = useCallback(async (userData) => {
    try {
      let res;
      if (userData.role === 'trainer') {
        // ✅ Trainers are added via the trainer endpoint
        res = await adminAPI.addTrainer({
          name: userData.name,
          email: userData.email,
          specialization: userData.specialization || null,
          experience: userData.experience || null,
          certification: userData.certification || null,
          password: userData.password || null,  // ✅ FIX: Send password to backend!
          status: userData.status || 'active',
        });
      } else {
        // ✅ Regular users via admin create endpoint
        res = await adminAPI.createUser(userData);
      }
      setUsers(prev => [...prev, normalizeUser(res.data)]);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to add user');
    }
  }, []);

  const updateUser = useCallback(async (userId, updatedData) => {
    try {
      // ✅ Strip to only fields the backend AdminUserEditRequest accepts
      const allowedFields = {
        name: updatedData.name,
        email: updatedData.email,
        role: updatedData.role,
        status: updatedData.status,
        // ✅ Convert camelCase trainerId → snake_case trainer_id for backend
        trainer_id: updatedData.trainerId ?? updatedData.trainer_id ?? undefined,
      };

      // Remove undefined keys so backend doesn't receive nulls for unchanged fields
      const payload = Object.fromEntries(
        Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
      );

      const res = await adminAPI.updateUser(userId, payload);
      setUsers(prev =>
        prev.map(u => u.id === userId ? normalizeUser(res.data) : u)
      );
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  }, []);

  const toggleUserStatus = useCallback(async (userId) => {
    try {
      const res = await adminAPI.toggleUserStatus(userId);
      setUsers(prev => prev.map(u => u.id === userId ? normalizeUser(res.data) : u));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  }, []);

  const approveTrainer = useCallback(async (trainerId) => {
    try {
      const res = await adminAPI.approveTrainer(trainerId);
      setUsers(prev => prev.map(u => u.id === trainerId ? normalizeUser(res.data) : u));
    } catch (error) {
       console.error("Error approving trainer:", error);
    }
  }, []);

  const rejectTrainer = useCallback(async (trainerId) => {
    if (window.confirm('Reject this trainer application?')) {
      try {
        const res = await adminAPI.rejectTrainer(trainerId);
        setUsers(prev => prev.map(u => u.id === trainerId ? normalizeUser(res.data) : u));
      } catch (error) {
        console.error("Error rejecting trainer:", error);
      }
    }
  }, []);

  const getUserById = useCallback((id) => users.find(u => String(u.id) === String(id)), [users]);

  const getUserGrowthData = useCallback(() => {
    // Derived from users array
    const growth = {};
    users.forEach(user => {
      if (!user.joined) return;
      const jDate = new Date(user.joined);
      const key = `${jDate.getFullYear()}-${String(jDate.getMonth() + 1).padStart(2, '0')}`;
      growth[key] = (growth[key] || 0) + 1;
    });
    return Object.keys(growth).sort().map(k => {
      const [y, m] = k.split('-');
      return { month: `${new Date(y, m-1).toLocaleString('default', {month:'short'})} ${y}`, users: growth[k] };
    });
  }, [users]);

  const getActiveUsersData = useCallback(() => {
    // Dummy active users data based on users array
    return [
      { day: 'Mon', active: Math.floor(users.length * 0.4) },
      { day: 'Tue', active: Math.floor(users.length * 0.5) },
      { day: 'Wed', active: Math.floor(users.length * 0.6) },
      { day: 'Thu', active: Math.floor(users.length * 0.45) },
      { day: 'Fri', active: Math.floor(users.length * 0.7) },
      { day: 'Sat', active: Math.floor(users.length * 0.8) },
      { day: 'Sun', active: Math.floor(users.length * 0.9) },
    ];
  }, [users]);

  const getWorkoutLogsData = useCallback(() => {
    return [
      { day: 'Mon', logs: 12 },
      { day: 'Tue', logs: 19 },
      { day: 'Wed', logs: 15 },
      { day: 'Thu', logs: 22 },
      { day: 'Fri', logs: 30 },
      { day: 'Sat', logs: 10 },
      { day: 'Sun', logs: 8 },
    ];
  }, []);

  const fetchUserGrowth = useCallback(async (range = 'month') => {
    try {
      const res = await api.get(`/analytics/user-growth?range=${range}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch user growth', err);
      return [];
    }
  }, []);

  const fetchActiveUsers = useCallback(async (range = 'week') => {
    try {
      const res = await api.get(`/analytics/active-users?range=${range}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch active users', err);
      return [];
    }
  }, []);

  const fetchWorkoutLogs = useCallback(async (range = 'week') => {
    try {
      const res = await api.get(`/analytics/workout-logs?range=${range}`);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch workout logs', err);
      return [];
    }
  }, []);

  return (
    <AdminContext.Provider 
      value={{ 
        users, 
        trainers, 
        addUser, 
        updateUser, 
        deleteUser, 
        toggleUserStatus, 
        approveTrainer, 
        rejectTrainer, 
        getUserById, 
        getUserGrowthData, 
        getActiveUsersData, 
        getWorkoutLogsData, 
        fetchUserGrowth,
        fetchActiveUsers,
        fetchWorkoutLogs,
        loading,
        settings,
        updateSettings,
        settingsLoading
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
