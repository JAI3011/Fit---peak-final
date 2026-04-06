import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, Loader, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, role: authRole } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user'
  });
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // ✅ Only redirect AFTER login action
    if (isAuthenticated && authRole) {
      navigate(`/${authRole}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, authRole, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      await login(formData.email, formData.password, formData.role);
      // The navigate logic is handled by the useEffect above when isAuthenticated becomes true
    } catch (error) {
      console.error("Login failed:", error);
      const detail = error.response?.data?.detail || error.message || "Login failed. Please check credentials and role.";
      setErrorMsg(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative py-12">
      {/* Background blur effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Back Button - Moved to a stable relative position above the card */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-all text-sm font-semibold mb-4 group px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">

          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-center text-gray-400 mb-6">Sign in to continue your fitness journey</p>
          
          <div className="flex p-1 bg-white/5 rounded-xl mb-6">
            {['user', 'trainer', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize transition-all duration-300 relative`}
              >
                {formData.role === r && (
                  <motion.div
                    layoutId="activeTabSignin"
                    className="absolute inset-0 bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.1)] rounded-lg"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className={`relative z-10 ${formData.role === r ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {r}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                placeholder="Email Address"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500"
                placeholder="Password"
              />
            </div>

            <div className="flex justify-end -mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full neon-button py-3.5 rounded-xl font-bold text-white flex justify-center items-center gap-2 group mt-6"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <button onClick={() => navigate('/signup')} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign Up
            </button>
          </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignIn;