import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Activity, 
  Utensils, 
  Users, 
  User,
  Plus, 
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Calendar,
  BookOpen,
  BarChart3,
  Dumbbell,
  Shield,
  Youtube
} from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';

const DashboardLayout = ({ children, role = "user" }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // USER NAVIGATION
  const userNavigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/user/dashboard" },
    { name: "Workouts", icon: Activity, path: "/user/workouts" },
    { name: "Diet Plan", icon: Utensils, path: "/user/diet" },
    { name: "Weekly Report", icon: BarChart3, path: "/user/report" },
    { name: "Library", icon: BookOpen, path: "/user/library" },
    { name: "Messages", icon: MessageSquare, path: "/user/messages", disabled: true }
  ];

  // TRAINER NAVIGATION
  const trainerNavigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/trainer/dashboard" },
    { name: "Manage Clients", icon: Users, path: "/trainer/clients" },
    { name: "Build Workout", icon: Dumbbell, path: "/trainer/workout/create" },
    { name: "Draft Meal Plan", icon: Utensils, path: "/trainer/diet/create" },
    { name: "My Profile", icon: User, path: "/trainer/profile" },
    { name: "Messages", icon: MessageSquare, path: "/trainer/messages", disabled: true }
  ];

  // ADMIN NAVIGATION
  const adminNavigation = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Users", icon: Users, path: "/admin/users" },
    { name: "Trainers", icon: Shield, path: "/admin/trainers" },
    { name: "Analytics", icon: BarChart3, path: "/admin/analytics" },
    { name: "Highlights", icon: Youtube, path: "/admin/highlights" },
    { name: "Feedback", icon: MessageSquare, path: "/admin/feedback" },
    { name: "Settings", icon: Settings, path: "/admin/settings" }
  ];

  const navigation = role === "admin" ? adminNavigation : (role === "trainer" ? trainerNavigation : userNavigation);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#020617] to-black">
      
      {/* ========== SIDEBAR - DESKTOP ========== */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-zinc-900/50 backdrop-blur-xl border-r border-zinc-800 flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-white">
              Fit<span className="text-cyan-400">Peak</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            if (item.disabled) {
              return (
                <div
                  key={item.name}
                  title="Coming Soon"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 cursor-not-allowed group opacity-50 select-none"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  <span className="text-[10px] ml-auto bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">Soon</span>
                </div>
              );
            }
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-800 space-y-1">
          {role !== 'admin' && (
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="font-medium">Submit Feedback</span>
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ========== MOBILE HEADER ========== */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-white">
            Fit<span className="text-cyan-400">Peak</span>
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6 text-white" />}
        </button>
      </header>

      {/* ========== MOBILE SIDEBAR OVERLAY ========== */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setSidebarOpen(false)} 
          />
          
          {/* Sidebar */}
          <aside className="absolute left-0 top-16 bottom-0 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-y-auto">
            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
                if (item.disabled) {
                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-600 cursor-not-allowed opacity-50"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                      <span className="text-[10px] ml-auto bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-md font-bold">SOON</span>
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-zinc-800 space-y-1">
              {role !== 'admin' && (
                <button
                  onClick={() => {
                    setIsFeedbackOpen(true);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Submit Feedback</span>
                </button>
              )}

              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="flex-1 overflow-y-auto relative md:ml-64">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Content */}
        <div className="relative z-10 p-4 md:p-8 min-h-full mt-16 md:mt-0">
          {children}
        </div>
      </main>

      {/* ========== FEEDBACK MODAL ========== */}
      <FeedbackModal 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </div>
  );
};

export default DashboardLayout;