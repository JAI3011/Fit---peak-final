import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Create a base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Debug initial state
console.log('[API INIT] api instance created with baseURL:', API_BASE_URL);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
  // ✅ NEW: Create first admin account (only works if no admins exist)
  createAdminSetup: (data) => api.post('/auth/admin/create', data),
};

export const userAPI = {
  getDashboard: () => api.get('/dashboard'),
  getUserProfile: (id) => api.get(`/users/${id}`),
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
  updateProgress: (data) => api.post('/users/progress', data),
  skipWorkout: (userId) => api.post(`/users/${userId}/skip-workout`),
  // Logs
  logWorkout: (data) => api.post('/workout-logs', data),
  getWorkoutHistory: () => api.get('/workout-logs/my-history'),
  logDiet: (data) => api.post('/diet-logs', data),
  getDietHistory: () => api.get('/diet-logs/my-history'),
};

export const trainerAPI = {
  // Clients
  getClients:             ()                   => api.get('/users/my-clients'),

  // Workouts
  getWorkouts:            ()                   => api.get('/workouts'),
  createWorkout:          (data)               => api.post('/workouts', data),
  updateWorkout:          (id, data)           => api.put(`/workouts/${id}`, data),
  deleteWorkout:          (id)                 => api.delete(`/workouts/${id}`),
  assignWorkoutToClient:  (clientId, workoutId) => api.post(`/workouts/${workoutId}/assign/${clientId}`),

  // Diet Plans
  getDietPlans:           ()                   => api.get('/diet-plans'),
  createDietPlan:         (data)               => api.post('/diet-plans', data),
  updateDietPlan:         (id, data)           => api.put(`/diet-plans/${id}`, data),
  deleteDietPlan:         (id)                 => api.delete(`/diet-plans/${id}`),
  assignDietToClient:     (clientId, planId)   => api.post(`/diet-plans/${planId}/assign/${clientId}`),

  // Sessions
  getSessions:            (startDate, endDate) => api.get(`/trainer/sessions?start_date=${startDate}&end_date=${endDate}`),
  createSession:          (data)               => api.post('/trainer/sessions', data),
  deleteSession:          (sessionId)          => api.delete(`/trainer/sessions/${sessionId}`),
  assignDailyMissions:    (payload)            => api.post('/trainer/tasks/assign', payload),
  clearDailyMissions:     (payload)            => api.post('/trainer/tasks/clear', payload),
};

export const adminAPI = {
  getUsers: () => api.get('/users'),
  getTrainers: () => api.get('/trainers'),
  getTrainerClients: (trainerId) => api.get(`/trainers/${trainerId}/clients`),
  createUser: (data) => api.post('/admin/users', data),
  addTrainer: (data) => api.post('/trainers', data),
  createAdmin: (data) => api.post('/users/admin', data),  // ✅ NEW: [Admin-only] Create additional admin
  updateUser: (id, data) => api.put(`/users/${id}/admin-edit`, data),
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/users/${id}`),
  approveTrainer: (id) => api.put(`/trainers/${id}/approve`),
  rejectTrainer: (id) => api.put(`/trainers/${id}/reject`),
};

export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
};

export const taskAPI = {
  getToday: () => api.get('/tasks/today'),
  toggle: (taskId) => api.patch(`/tasks/${taskId}/toggle`),
};

export const highlightAPI = {
  getAll: () => api.get('/highlights'),
  getOne: (id) => api.get(`/highlights/${id}`),
  create: (data) => api.post('/highlights', data),
  update: (id, data) => api.put(`/highlights/${id}`, data),
  delete: (id) => api.delete(`/highlights/${id}`),
};

// ==================== KEY TRANSFORMATION UTILITIES ====================

// snake_case → camelCase  (for responses from backend)
// e.g. "trainer_id" → "trainerId", "assigned_workout" → "assignedWorkout"
const toCamelCase = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const transformKeys = (data) => {
  if (data === null || data === undefined || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => transformKeys(item));
  if (data instanceof Date) return data; // keep Date objects intact

  const newObj = {};
  for (const [key, value] of Object.entries(data)) {
    newObj[toCamelCase(key)] = transformKeys(value);
  }
  return newObj;
};

// camelCase → snake_case  (for requests sent to backend)
// e.g. "trainerId" → "trainer_id", "assignedWorkout" → "assigned_workout"
const toSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const transformRequestKeys = (data) => {
  if (data === null || data === undefined || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map((item) => transformRequestKeys(item));
  if (data instanceof Date) return data;

  const newObj = {};
  for (const [key, value] of Object.entries(data)) {
    newObj[toSnakeCase(key)] = transformRequestKeys(value);
  }
  return newObj;
};

const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return true;
    const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
    if (!decodedPayload.exp) return true;
    return decodedPayload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

// ==================== REQUEST INTERCEPTOR ====================
// Attaches Bearer token AND converts outbound camelCase body → snake_case
api.interceptors.request.use(
  (config) => {
    // 1. Get auth token from sessionStorage
    const rawToken = sessionStorage.getItem('fitpeak-token');
    const token = rawToken && !isTokenExpired(rawToken) ? rawToken : null;

    if (rawToken && !token) {
      sessionStorage.removeItem('fitpeak-token');
      localStorage.removeItem('fitpeak-token');
      console.warn('[AXIOS REQUEST] Expired token removed from storage');
    }
    
    // Debug: Always log what we're doing
    console.log('[AXIOS REQUEST]', {
      url: config.url,
      method: config.method,
      tokenExists: !!token,
      tokenPreview: token ? `${token.substring(0, 30)}...` : null,
      currentHeaders: Object.keys(config.headers || {}),
    });

    // 2. Ensure headers object exists
    if (!config.headers) {
      config.headers = {};
    }

    // 3. Set Authorization header if we have a token
    if (token) {
      const bearerToken = `Bearer ${token}`;
      config.headers.Authorization = bearerToken;
      console.log('[AXIOS REQUEST]', {
        action: 'Added Authorization header',
        headerValue: bearerToken.substring(0, 30) + '...',
        allHeaders: config.headers,
      });
    } else {
      console.warn('[AXIOS REQUEST]', {
        action: 'NO TOKEN FOUND',
        sessionStorage: Object.keys(sessionStorage),
        message: '⚠️ Request will fail with 401 if endpoint requires auth',
      });
      // Explicitly remove Authorization header if no token
      delete config.headers.Authorization;
    }

    // 4. Convert request body keys camelCase → snake_case for POST / PUT / PATCH
    if (
      config.data &&
      typeof config.data === 'object' &&
      ['post', 'put', 'patch'].includes(config.method)
    ) {
      config.data = transformRequestKeys(config.data);
    }

    return config;
  },
  (error) => {
    console.error('[AXIOS REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
// Converts all response keys snake_case → camelCase before they reach components
api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object') {
      response.data = transformKeys(response.data);
    }
    return response;
  },
  (error) => Promise.reject(error)
);

export default api;

// ==================== DIAGNOSTIC UTILITIES ====================
// Expose diagnostic functions in console for debugging
export const authDiagnostics = {
  checkToken: () => {
    const token = sessionStorage.getItem('fitpeak-token');
    console.log('[DIAGNOSTICS] Token Status:', {
      exists: !!token,
      length: token ? token.length : 0,
      preview: token ? `${token.substring(0, 50)}...` : 'NO TOKEN',
      expired: token ? isTokenExpired(token) : true,
      storageKeys: Object.keys(sessionStorage),
    });
    return token;
  },
  
  clearToken: () => {
    sessionStorage.removeItem('fitpeak-token');
    localStorage.removeItem('fitpeak-token');
    console.log('[DIAGNOSTICS] Token cleared from sessionStorage');
  },
  
  testAuthRequest: async () => {
    console.log('[DIAGNOSTICS] Testing authenticated request...');
    try {
      const res = await api.get('/dashboard');
      console.log('[DIAGNOSTICS] ✓ Dashboard request successful:', res.data);
      return res.data;
    } catch (err) {
      console.error('[DIAGNOSTICS] ✗ Dashboard request failed:', {
        status: err.response?.status,
        detail: err.response?.data?.detail,
        error: err.message,
      });
      return null;
    }
  },
};

// Make diagnostics available globally for console debugging
if (typeof window !== 'undefined') {
  window.authDiagnostics = authDiagnostics;
  console.log('[API] Diagnostics available at window.authDiagnostics');
}
