import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import api from '../services/api';

const AuthContext = createContext();

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

const parseTokenPayload = (token) => {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    return JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole]                   = useState(null);
  const [loading, setLoading]             = useState(true); // ✅ loading until token verified
  const [isUnreachable, setIsUnreachable] = useState(false); // ✅ backend down

  // ✅ On mount — verify stored token with backend, restore session
  useEffect(() => {
    const restoreSession = async () => {
      // One-time migration for users who were previously on localStorage
      const sessionToken = sessionStorage.getItem('fitpeak-token');
      const legacyToken = localStorage.getItem('fitpeak-token');
      if (!sessionToken && legacyToken) {
        sessionStorage.setItem('fitpeak-token', legacyToken);
        localStorage.removeItem('fitpeak-token');
      }

      const token = sessionStorage.getItem('fitpeak-token');
      console.log('[AUTH Session Restore] Token from sessionStorage:', token ? `${token.substring(0, 20)}...` : 'NONE');
      if (!token) {
        console.log('[AUTH Session Restore] No token found, skipping restore');
        setLoading(false);
        return;
      }

      if (isTokenExpired(token)) {
        console.warn('[AUTH Session Restore] Token expired. Clearing session.');
        sessionStorage.removeItem('fitpeak-token');
        localStorage.removeItem('fitpeak-token');
        setUser(null);
        setRole(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      try {
        console.log('[AUTH Session Restore] Attempting to restore session with token...');
        const tokenPayload = parseTokenPayload(token);
        const tokenRole = tokenPayload?.role;
        const endpoint = tokenRole === 'user' ? '/dashboard' : '/auth/me';
        const res = await api.get(endpoint);
        const userData = res.data;
        console.log('[AUTH Session Restore] ✓ Successfully restored session');
        setUser(userData);
        setRole(userData.role || tokenRole);
        setIsAuthenticated(true);
      } catch (err) {
        // ✅ Differentiate between token issues (401/403) and infrastructure issues (Network Error/500)
        const isAuthError = err.response && (err.response.status === 401 || err.response.status === 403);
        
        if (isAuthError) {
          console.error('[AUTH Session Restore] ❌ Token invalid/expired. Clearing session:', err);
          sessionStorage.removeItem('fitpeak-token');
          localStorage.removeItem('fitpeak-token');
          setUser(null);
          setRole(null);
          setIsAuthenticated(false);
          setIsUnreachable(false);
        } else {
          // It's a network error or server (500) — keep token
          console.warn('[AUTH Session Restore] ⚠️ Backend unreachable or server error. Preserving token:', err);
          setIsAuthenticated(false);
          setIsUnreachable(true); // ✅ Mark as unreachable
        }
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  // ✅ Login — call backend, store token, set user state
  const login = useCallback(async (email, password, userRole) => {
    console.log('[AUTH Login] Starting login with:', { email, userRole });
    try {
      const res = await authAPI.login({ email, password, role: userRole });
      console.log('[AUTH Login] Response received:', {
        status: res.status,
        dataKeys: Object.keys(res.data),
        data: res.data,
      });
      
      // ✅ FIX: Use camelCase because axios response interceptor converts snake_case → camelCase
      const { accessToken, user: userData } = res.data;
      console.log('[AUTH Login] Destructured response:', {
        tokenExists: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.substring(0, 30)}...` : null,
        userDataExists: !!userData,
      });

      if (!accessToken) {
        throw new Error('No accessToken in response');
      }

      console.log('[AUTH Login] Storing token in sessionStorage...');
      sessionStorage.setItem('fitpeak-token', accessToken);
      localStorage.removeItem('fitpeak-token');
      console.log('[AUTH Login] ✓ Token stored, verifying...');
      
      const storedToken = sessionStorage.getItem('fitpeak-token');
      console.log('[AUTH Login] Verification:', {
        stored: !!storedToken,
        matches: storedToken === accessToken,
        preview: storedToken ? `${storedToken.substring(0, 30)}...` : null,
      });

      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
      
      console.log('[AUTH Login] ✓ Authentication state updated');
      return userData;
    } catch (error) {
      console.error('[AUTH Login] ❌ Login failed:', error);
      throw error;
    }
  }, []);

  // ✅ Register — call backend only (do NOT set authenticated to true)
  const register = useCallback(async (payload) => {
    console.log('[AUTH Register] Starting registration...');
    try {
      const res = await authAPI.register(payload);
      console.log('[AUTH Register] Response received:', {
        dataKeys: Object.keys(res.data),
      });
      
      console.log('[AUTH Register] ✓ Registration successful');
      return res.data;
    } catch (error) {
      console.error('[AUTH Register] ❌ Registration failed:', error);
      throw error;
    }
  }, []);

  // ✅ Logout — clear token and all state
  const logout = useCallback(() => {
    sessionStorage.removeItem('fitpeak-token');
    localStorage.removeItem('fitpeak-token');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  }, []);

  // ✅ Update user profile in state after profile edits
  const updateUserState = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      role,
      loading,       // ✅ expose loading so ProtectedRoute can wait
      login,
      register,
      logout,
      updateUserState,
      isUnreachable, // ✅ Expose this
    }}>
      {/* ✅ Handle states: loading -> unreachable -> authenticated */}
      {loading ? (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : isUnreachable ? (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Backend Connection Lost</h1>
          <p className="text-zinc-400 max-w-sm mb-8">
            We're having trouble reaching the FitPeak server. Please ensure the backend is running and click retry.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold text-white hover:opacity-90 transition-all"
          >
            Retry Connection
          </button>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
