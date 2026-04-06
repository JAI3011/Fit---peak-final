import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed w-full z-50 top-0 left-0 border-b border-white/10 bg-darkBg/60 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gradient">
              FitPeak
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest text-[10px]">Home</Link>
            {/* <Link to="#features" className="text-gray-300 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest text-[10px]">Features</Link> */}
          </div>

          {/* Right Action */}
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/signin')} className="hidden sm:block text-sm font-medium text-gray-300 hover:text-white transition">
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="neon-button px-6 py-2.5 text-sm font-bold text-white tracking-wide">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
