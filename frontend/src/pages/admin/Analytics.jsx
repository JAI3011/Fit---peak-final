import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Users, Activity, Loader } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import { useAdmin } from '../../contexts/AdminContext';

const Analytics = () => {
  const { fetchUserGrowth, fetchActiveUsers, fetchWorkoutLogs } = useAdmin();

  const [userGrowth, setUserGrowth] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'

  // Fetch all data when timeRange changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ug, au, wl] = await Promise.all([
          fetchUserGrowth(timeRange),
          fetchActiveUsers(timeRange),
          fetchWorkoutLogs(timeRange),
        ]);
        setUserGrowth(ug);
        setActiveUsers(au);
        setWorkoutLogs(wl);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [timeRange, fetchUserGrowth, fetchActiveUsers, fetchWorkoutLogs]);

  // Helper to format chart data based on range
  const formatChartData = (data, type) => {
    if (type === 'userGrowth') {
      // data has either 'date' (for week/month) or 'month' (for year)
      if (timeRange === 'year') return data;
      return data.map(item => ({
        ...item,
        label: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      }));
    }
    return data;
  };

  // Derived stats
  const totalUsers = userGrowth.reduce((sum, item) => sum + (item.users || 0), 0);
  const totalActive = activeUsers.length ? activeUsers[activeUsers.length - 1]?.active || 0 : 0;
  const totalLogs = workoutLogs.reduce((sum, item) => sum + (item.logs || 0), 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none focus:border-cyan-400"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last month</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Users className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Total New Users</p>
                <p className="text-2xl font-bold">{totalUsers.toLocaleString()}</p>
                <p className="text-xs text-green-400">+{Math.round(totalUsers * 0.2)}%</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Active Users (cumulative)</p>
                <p className="text-2xl font-bold">{totalActive.toLocaleString()}</p>
                <p className="text-xs text-green-400">End of period</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">Workouts Logged</p>
                <p className="text-2xl font-bold">{totalLogs.toLocaleString()}</p>
                <p className="text-xs text-green-400">Total sessions</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">User Growth</h3>
            <div className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : userGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {timeRange === 'year' ? (
                    <LineChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" stroke="#52525b" axisLine={false} tickLine={false} />
                      <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="users" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', r: 4 }} />
                    </LineChart>
                  ) : (
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="date" stroke="#52525b" axisLine={false} tickLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                      <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="users" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">No data</div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Active Users (Cumulative)</h3>
            <div className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : activeUsers.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {timeRange === 'year' ? (
                    <AreaChart data={activeUsers}>
                      <defs>
                        <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" stroke="#52525b" axisLine={false} tickLine={false} />
                      <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="active" stroke="#a855f7" fill="url(#activeGradient)" strokeWidth={3} />
                    </AreaChart>
                  ) : (
                    <LineChart data={activeUsers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#52525b" axisLine={false} tickLine={false} />
                      <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="active" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 4 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">No data</div>
              )}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="text-lg font-bold mb-4">Workout Logs (Estimated)</h3>
            <div className="h-[300px]">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader className="w-8 h-8 animate-spin text-cyan-400" />
                </div>
              ) : workoutLogs.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={workoutLogs}>
                    <defs>
                      <linearGradient id="logsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="day" stroke="#52525b" axisLine={false} tickLine={false} />
                    <YAxis stroke="#52525b" axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="logs" stroke="#22d3ee" fill="url(#logsGradient)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">No data</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;