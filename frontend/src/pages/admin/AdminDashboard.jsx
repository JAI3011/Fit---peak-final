import React from 'react';
import Card from '../../components/Card';
import { motion } from 'framer-motion';
import { Users, Server, ShieldPlus, ChevronRight, Activity } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { useAdmin } from '../../contexts/AdminContext';

const AdminDashboard = () => {
  const { users, trainers } = useAdmin();

  // Computed Statistics
  const totalUsers = users.length;
  const totalTrainers = trainers.length;
  const activeUsersCount = users.filter(u => u.status === 'active').length;
  // For "Active Now", we'll use activeUsersCount as a proxy or a slightly randomized version for "real-time" feel
  const activeNow = activeUsersCount;

  return (
    <DashboardLayout role="admin">
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">System Overview</h1>
          <p className="text-gray-400">Total control and analytics for the FitPeak platform.</p>
        </div>
        <button className="neon-button px-6 py-2 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)]">
          Generate Full Report
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Total Users</h3>
            <p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-2xl">
            <Users className="w-8 h-8 text-cyan-400" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Total Trainers</h3>
            <p className="text-3xl font-bold">{totalTrainers.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-2xl">
            <ShieldPlus className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Server Status</h3>
            <p className="text-3xl font-bold text-green-400">99.9%</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-2xl">
            <Server className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <h3 className="text-gray-400 text-sm mb-1">Active Now</h3>
            <p className="text-3xl font-bold text-pink-400">{activeNow.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-pink-500/10 rounded-2xl animate-pulse">
            <Activity className="w-8 h-8 text-pink-400" />
          </div>
        </Card>
      </div>

      {/* Complex Data Table */}
      <h2 className="text-xl font-bold mt-10 mb-4">Platform Users</h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 uppercase text-xs font-semibold tracking-wider text-gray-400">
              <th className="p-4 rounded-tl-xl">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
              <th className="p-4 rounded-tr-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500 italic">
                  No users found in the system.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <motion.tr 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="p-4 font-mono text-sm text-gray-400">
                    #{String(user.id).slice(-4)}
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${
                      user.role === 'admin' ? 'bg-fuchsia-500/20 text-fuchsia-400' :
                      user.role === 'trainer' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-2 capitalize ${user.status === 'active' ? 'text-green-400' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-gray-500'}`} />
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm whitespace-nowrap">{user.joined}</td>
                  <td className="p-4 text-right">
                    <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
