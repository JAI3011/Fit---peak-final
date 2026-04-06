import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const FeedbackContext = createContext();

export const FeedbackProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch real feedback from backend (admin only)
  const fetchFeedback = useCallback(async () => {
    if (!isAuthenticated || user?.role !== 'admin') return;
    setLoading(true);
    try {
      const res = await api.get('/feedback');
      setFeedbackList(res.data);
    } catch (err) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.role]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // ✅ Submit feedback via API, then update local list
  const addFeedback = useCallback(async (feedbackData) => {
    try {
      const res = await api.post('/feedback', feedbackData);
      // Only prepend to list if admin is viewing
      if (user?.role === 'admin') {
        setFeedbackList(prev => [res.data, ...prev]);
      }
      return res.data;
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  }, [user?.role]);

  // ✅ Delete feedback via API, then remove from local list
  const deleteFeedback = useCallback(async (id) => {
    try {
      await api.delete(`/feedback/${id}`);
      setFeedbackList(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      console.error('Failed to delete feedback:', err);
      throw err;
    }
  }, []);

  return (
    <FeedbackContext.Provider value={{
      feedbackList,
      loading,
      addFeedback,
      deleteFeedback,
      refetch: fetchFeedback,
    }}>
      {children}
    </FeedbackContext.Provider>
  );
};

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback must be used within FeedbackProvider');
  return context;
};