import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Activity, Utensils, Dumbbell, LogOut, MessageSquare, BarChart3, BookOpen, Shield, Settings, Youtube } from 'lucide-react';

const Sidebar = ({ role = 'user', onLogout, onFeedback }) => {
  const getLinks = () => {
    switch(role) {
      case 'admin':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
          { name: 'Users', icon: Users, path: '/admin/users' },
          { name: 'Trainers', icon: Shield, path: '/admin/trainers' },
          { name: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
          { name: 'Highlights', icon: Youtube, path: '/admin/highlights' },
          { name: 'Feedback', icon: MessageSquare, path: '/admin/feedback' },
          { name: 'Settings', icon: Settings, path: '/admin/settings' },
        ];
      case 'trainer':
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/trainer/dashboard' },
          { name: 'My Clients', icon: Users, path: '/trainer/clients' },
          { name: 'Build Workout', icon: Dumbbell, path: '/trainer/workout/create' },
          { name: 'Draft Meal Plan', icon: Utensils, path: '/trainer/diet/create' },
        ];
      case 'user':
      default:
        return [
          { name: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
          { name: 'Workouts', icon: Activity, path: '/user/workouts' },
          { name: 'Diet Plan', icon: Utensils, path: '/user/diet' },
          { name: 'Weekly Report', icon: BarChart3, path: '/user/report' },
          { name: 'Library', icon: BookOpen, path: '/user/library' },
        ];
    }
  };

  const links = getLinks();

  return (
    <motion.div 
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="w-64 flex flex-col h-full border-r border-white/10 bg-darkBg/40 backdrop-blur-xl p-4"
    >
      <div className="flex items-center gap-2 px-2 mb-10 pt-4">
        <div className="p-2 rounded-xl bg-white/5 border border-white/10">
          <Activity className="w-5 h-5 text-purple-400" />
        </div>
        <span className="text-xl font-black tracking-tighter text-gradient">
          FitPeak
        </span>
      </div>

      <nav className="flex-1 space-y-2 relative z-10">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive ? 'bg-white/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium text-sm">{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-8 border-t border-white/10 mt-auto space-y-2">
        {role !== 'trainer' && (
          <button 
            onClick={onFeedback}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-cyan-400 transition-colors group"
          >
            <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="font-medium text-sm">Feedback</span>
          </button>
        )}

        <button 
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors group"
        >
          <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
