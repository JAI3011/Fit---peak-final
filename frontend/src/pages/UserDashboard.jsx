import React, { useState, useEffect } from "react";
import Card from "../components/Card";
import Checklist from "../components/Checklist";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, MessageSquare, Flame, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import ProfileModal from "../components/ProfileModal";
import BmiRing from "../components/BmiRing";
import CalorieTracker from "../components/CalorieTracker";
import MacroSummary from "../components/MacroSummary";
import Counter from "../components/Counter";
import ProgressChart from "../components/ProgressChart";
import { useFitness } from "../context/FitnessContext";
import { userAPI } from "../services/api";
import { Check, Camera, Utensils } from "lucide-react";
import toast from "react-hot-toast";

const DEFAULT_ACHIEVEMENTS = [
  { id: "streak-7", title: "7 Day Streak", icon: "flame", unlocked: true },
  { id: "first-workout", title: "First Workout", icon: "trophy", unlocked: true },
  { id: "mission-master", title: "Mission Master", icon: "medal", unlocked: false },
];

const getAchievementVisual = (achievement) => {
  const icon = achievement?.icon;
  const unlocked = Boolean(achievement?.unlocked);

  if (!unlocked) {
    return {
      Icon: Trophy,
      className: "w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center opacity-40 grayscale",
      iconClassName: "w-6 h-6 text-zinc-500",
    };
  }

  if (icon === "flame") {
    return {
      Icon: Flame,
      className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-110 transition-transform cursor-help",
      iconClassName: "w-6 h-6 text-white",
    };
  }

  return {
    Icon: Trophy,
    className: "w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:scale-110 transition-transform cursor-help",
    iconClassName: "w-6 h-6 text-white",
  };
};

const formatGoalLabel = (goal) => {
  if (!goal) return "Not Set";
  return goal
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getGoalMilestoneText = (goal) => {
  switch (goal) {
    case "weight_loss":
      return "Next milestone: 5% body weight reduction";
    case "endurance":
      return "Next milestone: longer steady-state sessions";
    case "muscle_gain":
      return "Next milestone: 5kg gain";
    default:
      return "Next milestone: keep building consistency";
  }
};

export default function UserDashboard() {
  const { user, updateProfile } = useFitness();
  const [open, setOpen] = useState(false);
  // ✅ AI Tip now comes from the backend dashboard data (user.daily_tip)
  const [aiTip, setAiTip] = useState("Loading tip...");
  
  useEffect(() => {
    if (user?.dailyTip) {
      setAiTip(user.dailyTip);
    }
  }, [user?.dailyTip]);

  const handleSave = async (updatedData) => {
    return updateProfile(updatedData);
  };

  if (!user || !user.name) {
    return (
      <DashboardLayout role="user">
        <div className="flex-1 p-8 text-center text-white">
          Loading user dashboard…
        </div>
      </DashboardLayout>
    );
  }

  const calculateBMI = () => {
    if (!user.height || !user.weight) {
      return { value: "N/A", status: "No data", color: "text-zinc-500" };
    }

    const rawBMI = user.weight / ((user.height / 100) ** 2);
    if (!Number.isFinite(rawBMI)) {
      return { value: "N/A", status: "No data", color: "text-zinc-500" };
    }

    const bmiVal = Number(rawBMI.toFixed(1));
    let status = "Normal";
    let color = "text-green-400";

    if (bmiVal < 18.5) { status = "Underweight"; color = "text-yellow-400"; }
    else if (bmiVal >= 25 && bmiVal < 30) { status = "Overweight"; color = "text-orange-400"; }
    else if (bmiVal >= 30) { status = "Obese"; color = "text-red-400"; }

    return { value: bmiVal, status, color };
  };

  const bmiData = calculateBMI();

  const chartData = user.progressData?.map(entry => ({
    day: new Date(entry.date).toLocaleDateString('en-US', { weekday: 'short' }),
    calories: entry.calories || 0
  })) || [];

  const achievements = (user.achievements && user.achievements.length > 0)
    ? user.achievements.slice(0, 3)
    : DEFAULT_ACHIEVEMENTS;

  return (
    <DashboardLayout role="user">
      <div className="flex-1 space-y-6">

        {/* 🔥 HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, <span className="text-cyan-400">{user.name}</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Track your fitness journey 🚀
            </p>
          </div>
        </motion.div>

        {/* 🔥 GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

          {/* PROFILE CARD */}
          <Card>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm text-zinc-400">Profile</h3>
                <p className="text-lg font-semibold">{user.name}</p>
                <p className="text-xs text-zinc-500">
                  Age: {user.age} • {user.gender}
                </p>
              </div>

              <button
                onClick={() => setOpen(true)}
                className="text-cyan-400 text-sm hover:underline"
              >
                Edit
              </button>
            </div>
          </Card>

          {/* BMI CARD */}
          <Card className="flex flex-col items-center justify-center text-center">
            <div className="flex justify-between w-full mb-2">
              <h3 className="text-sm text-zinc-400 text-left">BMI Status</h3>
              <span className={`text-xs font-bold uppercase ${bmiData.color}`}>{bmiData.status}</span>
            </div>
            <BmiRing bmi={bmiData.value} />
            <p className="mt-2 text-xs text-zinc-500 italic">
              {bmiData.status === "Normal" ? "You're in the healthy range!" : "Keep tracking your progress!"}
            </p>
          </Card>

          {/* CALORIE TRACKER */}
          <Card>
            <h3 className="text-sm text-zinc-400">Calories</h3>
            <div className="text-2xl font-bold text-cyan-400 mt-1">
              <Counter value={user.caloriesConsumed} /> <span className="text-xs text-zinc-500 font-normal">/ {user.caloriesGoal} kcal</span>
            </div>
            <CalorieTracker current={user.caloriesConsumed} goal={user.caloriesGoal} />
          </Card>

          {/* GOAL PROGRESS */}
          <Card>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm text-zinc-400">Goal: {formatGoalLabel(user.goal)}</h3>
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span>Overall Progress</span>
                <span className="font-bold text-purple-400"><Counter value={user.overallProgress} />%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${user.overallProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_10px_#d946ef]" 
                />
              </div>
                <p className="text-[10px] text-zinc-500 italic">{getGoalMilestoneText(user.goal)}</p>
            </div>
          </Card>

          {/* TRAINER */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-sm text-zinc-400">Your Trainer</h3>
                <p className="text-lg font-bold">{user.trainerName || "Not Assigned"}</p>
              </div>
              <button className="p-2 bg-cyan-500/10 rounded-xl hover:bg-cyan-500/20 transition-colors">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
              </button>
            </div>
          </Card>

          {/* MACRO SUMMARY */}
          <Card>
            <h3 className="text-sm text-zinc-400">Macros 🍽️</h3>
            <MacroSummary 
              protein={user.macros?.protein ?? 0} 
              carbs={user.macros?.carbs ?? 0} 
              fats={user.macros?.fats ?? 0} 
            />
          </Card>

          {/* TODAY'S MEALS CHECKLIST */}
          <Card className="md:col-span-2 xl:col-span-1">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm text-zinc-400 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-cyan-400" />
                  Today's Meals
                </h3>
                <Link to="/user/diet" className="text-[10px] text-cyan-400 hover:underline uppercase font-bold tracking-widest">
                  View Full Plan
                </Link>
             </div>
             <TodayMealSummary user={user} />
          </Card>

          {/* WEEKLY ACTIVITY CHART */}
          <Card className="md:col-span-2">
            <h3 className="text-sm text-zinc-400">Weekly Calorie Progress</h3>
            <ProgressChart data={chartData} />
          </Card>

          {/* AI SUGGESTION */}
          <Card className="md:col-span-2">
            <h3 className="mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span> AI Personalized Tip
            </h3>
            <div className="h-10">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={aiTip}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="text-sm text-zinc-300 leading-relaxed"
                >
                  {aiTip}
                </motion.p>
              </AnimatePresence>
            </div>
          </Card>

          {/* ACHIEVEMENTS */}
          <Card>
            <h3 className="text-sm text-zinc-400 mb-3 font-bold uppercase tracking-wider">Achievements</h3>
            <div className="flex gap-4">
              {achievements.map((achievement) => {
                const visual = getAchievementVisual(achievement);
                return (
                  <div
                    key={achievement.id}
                    className={visual.className}
                    title={achievement.title}
                  >
                    <visual.Icon className={visual.iconClassName} />
                  </div>
                );
              })}
            </div>
          </Card>

          {/* CHECKLIST (FULL WIDTH) */}
          <div className="col-span-1 md:col-span-2 xl:col-span-3">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🚀 Daily Missions
            </h3>
            <Checklist />
          </div>
        </div>
      </div>

      <ProfileModal
        open={open}
        setOpen={setOpen}
        user={user}
        onSave={handleSave}
      />
    </DashboardLayout>
  );
}

// ========== HELPER: TODAY'S MEAL SUMMARY ==========
function TodayMealSummary({ user }) {
  const { refreshUser } = useFitness();
  const todayStrFull = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayPlan = user?.diet_schedule?.[todayStrFull] || user?.assignedDiet;
  const assignedMeals = todayPlan?.meals || [];
  
  const [localMeals, setLocalMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayLog = async () => {
      try {
        const res = await userAPI.getDietHistory();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayLog = (res.data || []).find(log => log.date.startsWith(todayStr));

        if (todayLog && todayLog.meals) {
          setLocalMeals(todayLog.meals);
        } else {
          // If no log yet, show assigned plan as default (all not eaten)
          setLocalMeals(assignedMeals.map(m => ({
            ...m,
            eaten: false
          })));
        }
      } catch (err) {
        console.error("Failed to fetch today's log for dashboard:", err);
        setLocalMeals(assignedMeals.map(m => ({ ...m, eaten: false })));
      } finally {
        setLoading(false);
      }
    };

    fetchTodayLog();
  }, [assignedMeals.length, user]);

  const handleToggle = async (index) => {
    const updatedMeals = [...localMeals];
    updatedMeals[index].eaten = !updatedMeals[index].eaten;
    setLocalMeals(updatedMeals);

    try {
      const todayISO = new Date().toISOString().split('T')[0];
      await userAPI.logDiet({
        date: `${todayISO}T12:00:00Z`,
        meals: updatedMeals.map(m => ({
          name: m.name,
          eaten: m.eaten,
          photo_uploaded: m.photoUploaded,
          calories: m.calories || 0,
          protein: m.protein || 0,
          carbs: m.carbs || 0,
          fats: m.fats || 0,
          items: m.items || []
        }))
      });
      refreshUser();
    } catch (err) {
      console.error("Failed to log meal from dashboard:", err);
      // Revert optimistic update
      setLocalMeals(localMeals);
      toast.error('Failed to log meal. Please try again.');
    }
  };

  if (loading) return <div className="text-[10px] text-zinc-500 animate-pulse">Checking today's log...</div>;
  if (localMeals.length === 0) {
    return <p className="text-xs text-zinc-500 italic">No meals assigned for today.</p>;
  }

  return (
    <div className="space-y-3">
      {localMeals.map((meal, idx) => (
        <div 
          key={idx} 
          onClick={() => handleToggle(idx)}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            meal.eaten 
              ? 'bg-emerald-500/10 border-emerald-500/30' 
              : 'bg-white/2 border-white/5 hover:border-white/10'
          }`}
        >
          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 ${
            meal.eaten ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-white/10 group-hover:border-emerald-500/50'
          }`}>
            {meal.eaten && <Check className="w-4 h-4 text-darkBg font-black" />}
          </div>
          <div className="flex-1 min-w-0">
             <p className={`text-xs font-bold truncate ${meal.eaten ? 'text-zinc-500 line-through' : 'text-white'}`}>
                {meal.name}
             </p>
             <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                {meal.calories} kcal
             </p>
          </div>
        </div>
      ))}
    </div>
  );
}