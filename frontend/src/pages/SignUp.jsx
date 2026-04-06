import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, Mail, ArrowRight, Loader, User, Ruler, Weight, Calendar, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { register, logout } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    height: '',
    weight: '',
    gender: 'male',
    goal: 'weight_loss',
    role: 'user'  // ✅ Fixed to 'user' only - no role selector needed
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value) return "Name is required";
        if (value.length < 2) return "Name must be at least 2 characters";
        return "";
      case 'email':
        if (!value) return "Email is required";
        if (!/\S+@\S+\.\S+/.test(value)) return "Invalid email format";
        return "";
      case 'password':
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        return "";
      case 'age':
        if (!value) return "Age is required";
        const ageNum = parseInt(value);
        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return "Age must be between 1 and 120";
        return "";
      case 'height':
        if (!value) return "Height is required";
        const heightNum = parseFloat(value);
        if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) return "Height must be between 50 and 300 cm";
        return "";
      case 'weight':
        if (!value) return "Weight is required";
        const weightNum = parseFloat(value);
        if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) return "Weight must be between 10 and 500 kg";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        role: 'user'
      };
      
      await register(payload);

      // ✅ FORCE LOGOUT AFTER REGISTER (ensure clean state)
      logout();
      navigate('/signin', { replace: true });
      
    } catch (error) {
      console.error("Registration failed:", error);
      setErrors(prev => ({ ...prev, submit: error.message || "Registration failed" }));
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative py-12">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="glass-panel p-8 sm:p-10 rounded-[2rem] shadow-2xl">
          
          <div className="flex justify-center mb-6">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-center text-gray-400 mb-6">Join FitPeak and start your fitness journey</p>
          
          {/* ✅ Success Message */}
          {registrationSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-green-400 font-semibold">Registration Successful!</p>
                <p className="text-green-400/70 text-sm">Redirecting to sign-in page...</p>
              </div>
            </motion.div>
          )}
          
          {/* ✅ REMOVED Role Selector - No longer needed */}
          {/* Users can only register as 'user' role */}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={registrationSuccess}
                className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${errors.name ? 'border-red-400/50' : 'border-white/10'} rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Full Name"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={registrationSuccess}
                className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${errors.email ? 'border-red-400/50' : 'border-white/10'} rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Email Address"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-cyan-400 transition-colors" />
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={registrationSuccess}
                className={`w-full pl-11 pr-4 py-3 bg-white/5 border ${errors.password ? 'border-red-400/50' : 'border-white/10'} rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                placeholder="Password (min. 6 characters)"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Age, Height, Weight - 3 columns */}
            <div className="grid grid-cols-3 gap-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={registrationSuccess}
                  className={`w-full pl-8 pr-2 py-3 bg-white/5 border ${errors.age ? 'border-red-400/50' : 'border-white/10'} rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Age"
                />
                {errors.age && <p className="text-red-400 text-[10px] mt-1">{errors.age}</p>}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Ruler className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  disabled={registrationSuccess}
                  className={`w-full pl-8 pr-2 py-3 bg-white/5 border ${errors.height ? 'border-red-400/50' : 'border-white/10'} rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Height (cm)"
                />
                {errors.height && <p className="text-red-400 text-[10px] mt-1">{errors.height}</p>}
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Weight className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  disabled={registrationSuccess}
                  className={`w-full pl-8 pr-2 py-3 bg-white/5 border ${errors.weight ? 'border-red-400/50' : 'border-white/10'} rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white placeholder-gray-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
                  placeholder="Weight (kg)"
                />
                {errors.weight && <p className="text-red-400 text-[10px] mt-1">{errors.weight}</p>}
              </div>
            </div>

            {/* Gender and Goal - 2 columns */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={registrationSuccess}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  disabled={registrationSuccess}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-cyan-400/50 focus:bg-white/10 transition-all text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="weight_loss">Weight Loss</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="endurance">Endurance</option>
                </select>
              </div>
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-red-400 text-sm text-center">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || registrationSuccess}
              className="w-full neon-button py-3.5 rounded-xl font-bold text-white flex justify-center items-center gap-2 group mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <button onClick={() => navigate("/signin")} className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUp;