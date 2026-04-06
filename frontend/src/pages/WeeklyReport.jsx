import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { TrendingUp, Flame, Target, Trophy, Sparkles, BarChart3, Dumbbell } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import { useFitness } from '../context/FitnessContext';

const WeeklyReport = () => {
  const { user } = useFitness();
  const progressData = user?.progressData || [];

  // Summary Metrics Derived from Data
  const recentData = progressData.slice(-7);
  const totalWorkouts = recentData.reduce((acc, curr) => acc + (curr.workouts || 0), 0);
  const totalVolume = recentData.reduce((acc, curr) => acc + (curr.volume || 0), 0);
  const totalCals = recentData.reduce((acc, curr) => acc + (curr.calories || 0), 0);
  const totalSets = Math.round(totalVolume / 185); // Estimated sets based on volume

  // Chart Data Transformations
  const workoutData = recentData.map(entry => ({
    day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
    volume: entry.volume || (entry.workouts * 1000) || 0,
    intensity: Math.min(100, (entry.volume / 6000) * 100) || 0
  }));

  const weightData = progressData.map((entry, idx) => ({
    week: `Wk ${idx + 1}`,
    weight: entry.weight
  }));

  // Macro Radar Data (Using latest entry or user defaults)
  const latestEntry = progressData[progressData.length - 1] || {};
  const macroData = [
    { subject: 'Protein', A: latestEntry.protein || user?.macros?.protein || 0, B: 160, fullMark: 200 },
    { subject: 'Carbs', A: latestEntry.carbs || user?.macros?.carbs || 0, B: 250, fullMark: 300 },
    { subject: 'Fats', A: latestEntry.fats || user?.macros?.fats || 0, B: 70, fullMark: 100 },
    { subject: 'Energy', A: Math.round((latestEntry.calories || user?.caloriesConsumed || 0) / 20), B: 120, fullMark: 150 },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-4 border border-white/10 rounded-xl">
          <p className="text-zinc-400 text-xs uppercase font-black mb-1">{label}</p>
          <p className="text-cyan-400 font-bold">
            {payload[0].value} {payload[0].name === 'volume' ? 'Volume' : 'kg'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (progressData.length === 0) {
    return (
      <DashboardLayout role="user">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6">
          <div className="p-6 rounded-full bg-white/5 border border-white/10">
            <BarChart3 className="w-12 h-12 text-zinc-500" />
          </div>
          <div className="max-w-md">
            <h2 className="text-2xl font-black text-white mb-2">No Report Data Yet</h2>
            <p className="text-zinc-400">
              Start logging your workouts and meals in the dashboard to generate your first weekly performance wrap!
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            className="neon-button px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest"
          >
            Log Today's Activity
          </motion.button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* 🏆 HERO SUMMARY */}
        <section className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-cyan-400/20 via-purple-500/20 to-darkBg">
          <div className="relative z-10 bg-darkBg/90 backdrop-blur-xl p-8 rounded-[22px] border border-white/5">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold mb-4">
                  <Sparkles className="w-3 h-3" />
                  WEEKLY PERFORMANCE WRAP
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                  You crushed <span className="text-gradient">{totalWorkouts} workouts</span> this week! 🔥
                </h1>
                <p className="text-zinc-400 text-lg max-w-xl">
                  Your volume reached <span className="text-cyan-400 font-bold">{totalVolume.toLocaleString()} lbs</span>. You're edging closer to your goal weight.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="glass-panel p-6 rounded-2xl border-white/5 text-center min-w-[120px]">
                  <p className="text-xs font-black text-zinc-500 uppercase mb-1">Weekly Volume</p>
                  <p className="text-3xl font-black text-white">{(totalVolume / 1000).toFixed(1)}k</p>
                </div>
                <div className="glass-panel p-6 rounded-2xl border-white/5 text-center min-w-[120px]">
                  <p className="text-xs font-black text-zinc-500 uppercase mb-1">Est. Sets</p>
                  <p className="text-3xl font-black text-white">{totalSets}</p>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 📊 WORKOUT VOLUME */}
          <Card className="p-8 group">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-400" />
                  Workout Volume
                </h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Volume per session</p>
              </div>
              <div className="flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-2 py-1 rounded-md text-xs font-bold">
                <Dumbbell className="w-3 h-3" /> Lift Heavy
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workoutData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar 
                    dataKey="volume" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 📈 WEIGHT TREND */}
          <Card className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  Body Composition
                </h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Weight Trend (KG)</p>
              </div>
              <div className="text-purple-400 bg-purple-400/10 px-2 py-1 rounded-md text-xs font-bold leading-none flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Tracked {weightData.length} weeks
              </div>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                  <XAxis 
                    dataKey="week" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }}
                  />
                  <YAxis 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#c084fc" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#lineColor)" 
                    dot={{ r: 4, fill: '#c084fc', strokeWidth: 2, stroke: '#020617' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 🎯 MACRO RADAR */}
          <Card className="p-8">
            <div className="mb-8">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Macro Adherence
              </h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Daily Average vs. Target</p>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={macroData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#71717a', fontSize: 12, fontWeight: 700 }} 
                  />
                  <PolarRadiusAxis angle={30} domain={[0, 300]} hide />
                  <Radar
                    name="Target"
                    dataKey="B"
                    stroke="#71717a"
                    fill="#71717a"
                    fillOpacity={0.1}
                  />
                  <Radar
                    name="Actual"
                    dataKey="A"
                    stroke="#22d3ee"
                    fill="#22d3ee"
                    fillOpacity={0.3}
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* 🧠 AI COACH INSIGHTS */}
          <div className="space-y-6">
            <Card className="p-8 border-cyan-400/20 bg-cyan-400/[0.02]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-cyan-400/10 border border-cyan-400/20">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">AI Analysis: Progress Trends</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Based on your last {progressData.length} entries, your strength levels are following an upward trajectory. Your consistency in {user.goal || 'your plan'} is remarkable. Suggestion: Keep focusing on progressive overload.
                  </p>
                  <button className="text-xs font-black text-cyan-400 uppercase tracking-widest hover:underline">
                    View Adjustment Plan →
                  </button>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-purple-400/20 bg-purple-400/[0.02]">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-400/10 border border-purple-400/20">
                  <Trophy className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white mb-2 uppercase tracking-tighter">Milestone Status</h4>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    You've logged {totalWorkouts} sessions this week. At this rate, you'll reach your next milestone in less than 10 days!
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WeeklyReport;
