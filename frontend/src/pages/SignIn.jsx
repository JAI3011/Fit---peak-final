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
    } catch (error) {
      const detail = error.response?.data?.detail || error.message || "Login failed.";
      setErrorMsg(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="signin-container"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=2070&auto=format&fit=crop')`
      }}
    >

      {/* BACK LINK - TOP LEFT */}
      <Link 
        to="/"
        className="back-link"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </Link>

      {/* MOTIVATIONAL CONTENT */}
      <div className="signin-left-content">
        <h1>Peak Performance Starts Here</h1>
        <p>Your journey to excellence begins now.</p>

        <div>
          <p>🏋️ Track your workouts and progress</p>
          <p>📋 Access workout plans and tips</p>
          <p>🔥 Stay motivated and achieve your goals</p>
        </div>
      </div>

      {/* CENTERED FORM SECTION */}
      <div className="signin-right">

        {/* Background glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-md relative z-10">

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>

            <div className="glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl">

              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                  <Activity className="w-8 h-8 text-cyan-400" />
                </div>
              </div>

              <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
              <p className="text-center text-gray-400 mb-6">
                Sign in to continue your fitness journey
              </p>

              {/* Role Selector */}
              <div className="flex p-1 bg-white/5 rounded-xl mb-6">
                {['user', 'trainer', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: r }))}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg capitalize`}
                  >
                    <span className={formData.role === r ? 'text-white' : 'text-gray-500'}>
                      {r}
                    </span>
                  </button>
                ))}
              </div>

              {/* FORM */}
              <form onSubmit={handleSubmit} className="space-y-5">

                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    placeholder="Email Address"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white"
                    placeholder="Password"
                  />
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-sm text-cyan-400">
                    Forgot Password?
                  </Link>
                </div>

                {errorMsg && (
                  <div className="text-red-400 text-sm text-center">{errorMsg}</div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full neon-button py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2"
                >
                  {isSubmitting ? <Loader className="animate-spin" /> : "Sign In"}
                </button>

              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Don't have an account?{" "}
                <button onClick={() => navigate('/signup')} className="text-cyan-400">
                  Sign Up
                </button>
              </p>

            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;