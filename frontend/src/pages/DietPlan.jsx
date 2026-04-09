import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Camera, User, Calendar, Utensils, Plus } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import { useFitness } from "../context/FitnessContext";
import { userAPI } from "../services/api";

// Helper: pick an icon based on meal name
const mealIcons = {
  breakfast: "☀️", lunch: "🍽️", dinner: "🌙",
  snack: "🍎", "pre-workout": "🥤", "post-workout": "💪",
};
const getIcon = (name = "") => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(mealIcons)) {
    if (lower.includes(key)) return icon;
  }
  return "🍽️";
};

// Helper: normalise a single item to display string
const itemToString = (item) => {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const qty = item.quantity ? `${item.quantity} ` : "";
    return `${qty}${item.name || "Unknown"}`;
  }
  return String(item);
};

// Helper: convert backend meals ARRAY to keyed object the UI expects
const normaliseMeals = (raw) => {
  if (!raw) return {};
  if (!Array.isArray(raw)) return raw;
  const result = {};
  raw.forEach((meal, idx) => {
    // Use a safe key based on meal name or index
    let key = meal.name ? meal.name.toLowerCase().replace(/\s/g, '') : `meal_${idx}`;
    // Avoid duplicate keys
    if (result[key]) key = `${key}_${idx}`;
    result[key] = {
      ...meal,
      name: meal.name || `Meal ${idx+1}`,
      icon: meal.icon || getIcon(meal.name || `Meal ${idx+1}`),
      calories: Number(meal.calories) || 0,
      protein: Number(meal.protein) || 0,
      carbs: Number(meal.carbs) || 0,
      fats: Number(meal.fats) || 0,
      items: Array.isArray(meal.items) ? meal.items.map(itemToString) : [],
      time: meal.time || '',
    };
  });
  return result;
};

export default function DietPlan() {
  const { user, refreshUser } = useFitness();
  const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'short' }));
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customMeal, setCustomMeal] = useState({ name: "", calories: 0 });
  
  // Fetch history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await userAPI.getDietHistory();
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to fetch diet history:", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user?.id]);
  
  const trainer = user?.trainerName || "Trainer";
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayFullNames = {
    "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday",
    "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"
  };

  // 0. Active Diet based on schedule
  const activeDiet = useMemo(() => {
    const dayName = dayFullNames[selectedDay];
    return (user?.diet_schedule && user.diet_schedule[dayName]) 
      || user?.assignedDiet;
  }, [user, selectedDay]);
  
  // Dynamic meal plan from record or null if not assigned
  const mealPlan = useMemo(() => normaliseMeals(activeDiet?.meals), [activeDiet]);

  const [meals, setMeals] = useState({
    breakfast: { eaten: false, photoUploaded: false },
    midMorning: { eaten: false, photoUploaded: false },
    lunch: { eaten: false, photoUploaded: false },
    evening: { eaten: false, photoUploaded: false },
    dinner: { eaten: false, photoUploaded: false }
  });

  // 1. Calculate dates for the current week (Monday-Sunday)
  const weekDates = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    // Adjust to Monday: getDay() returns 0 for Sunday, 1 for Monday
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);

    const map = {};
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].forEach((wd, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      map[wd] = d.toISOString().split('T')[0];
    });
    return map;
  }, []);

  const selectedDate = weekDates[selectedDay];

  // Sync meals state based on selectedDate's log or default plan
  useEffect(() => {
    if (!mealPlan) return;

    // Find if we have a log for this specific date (YYYY-MM-DD)
    const logForDay = history.find(log => log.date.startsWith(selectedDate));

    if (logForDay && logForDay.meals) {
      const newMealsState = {};
      Object.keys(mealPlan).forEach((key, index) => {
        // match by index or name
        const loggedMeal = logForDay.meals[index] || logForDay.meals.find(m => m.name === mealPlan[key].name);
        newMealsState[key] = {
          eaten: loggedMeal ? loggedMeal.eaten : false,
          photoUploaded: loggedMeal ? loggedMeal.photoUploaded : false
        };
      });
      setMeals(newMealsState);
    } else {
      const resetMeals = {};
      Object.keys(mealPlan).forEach(key => {
        resetMeals[key] = { eaten: false, photoUploaded: false };
      });
      setMeals(resetMeals);
    }
  }, [selectedDate, history, mealPlan]);

  // Goals
  const goals = activeDiet?.goals || {
    calories: activeDiet?.daily_calories || 2800,
    protein: activeDiet?.daily_protein || 160,
    carbs: activeDiet?.daily_carbs || 300,
    fats: activeDiet?.daily_fats || 70
  };

  // Calculate consumed based on actual history log (includes assigned + custom meals)
  const currentLog = history.find(log => log.date.startsWith(selectedDate));
  const consumed = {
    calories: currentLog?.total_calories || 0,
    protein: currentLog?.total_protein || 0,
    carbs: currentLog?.total_carbs || 0,
    fats: currentLog?.total_fats || 0
  };

  const toggleMeal = async (mealKey) => {
    if (!mealPlan || !mealPlan[mealKey]) {
      console.warn('Meal not found in plan', mealKey);
      return;
    }
    const currentMealState = meals[mealKey] || { eaten: false, photoUploaded: false };
    const isNowEaten = !currentMealState.eaten;
    const meal = mealPlan[mealKey];
    
    // Optimistic update
    const nextMeals = {
      ...meals,
      [mealKey]: { ...currentMealState, eaten: isNowEaten }
    };
    setMeals(nextMeals);

    // Prepare payload
    const payloadDate = `${selectedDate}T12:00:00Z`;
    const mealsArray = Object.entries(nextMeals).map(([k, m]) => ({
      name: mealPlan[k]?.name || k,
      eaten: m.eaten,
      photo_uploaded: m.photoUploaded,
      calories: mealPlan[k]?.calories || 0,
      protein: mealPlan[k]?.protein || 0,
      carbs: mealPlan[k]?.carbs || 0,
      fats: mealPlan[k]?.fats || 0,
      items: mealPlan[k]?.items || []
    }));

    try {
      await userAPI.logDiet({ date: payloadDate, meals: mealsArray });
      await refreshUser();  // ✅ await to ensure context updates
      const res = await userAPI.getDietHistory();
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to log diet entry:', err);
      // Revert optimistic update
      setMeals(meals);
      // Show user-friendly error
      toast.error('Failed to save. Please try again.');
    }
  };

  const handlePhotoUpload = (mealKey) => {
    setMeals((prev) => ({
      ...prev,
      [mealKey]: { ...(prev[mealKey] || { eaten: false, photoUploaded: false }), photoUploaded: true }
    }));
  };

  const handleAddCustomMeal = async () => {
    if (!customMeal.name) return;
    
    // Construct the new meal list (existing + new custom)
    const payloadDate = `${selectedDate}T12:00:00Z`;
    
    // Combine current meals with the new custom one
    const currentMeals = Object.entries(meals).map(([k, m]) => ({
      name: mealPlan[k]?.name || k,
      eaten: m.eaten,
      photo_uploaded: m.photoUploaded,
      calories: mealPlan[k]?.calories || 0,
      protein: mealPlan[k]?.protein || 0,
      carbs: mealPlan[k]?.carbs || 0,
      fats: mealPlan[k]?.fats || 0,
      items: mealPlan[k]?.items || []
    }));

    const nextMeals = [
      ...currentMeals,
      {
        name: customMeal.name,
        eaten: true,
        photo_uploaded: false,
        calories: Number(customMeal.calories) || 0,
        protein: Number(customMeal.protein) || 0,
        carbs: Number(customMeal.carbs) || 0,
        fats: Number(customMeal.fats) || 0,
        items: []
      }
    ];

    try {
      await userAPI.logDiet({
        date: payloadDate,
        meals: nextMeals
      });
      
      setIsAddingCustom(false);
      setCustomMeal({ name: "", calories: 0 });
      refreshUser();
      
      // Update history
      const res = await userAPI.getDietHistory();
      setHistory(res.data || []);
    } catch (err) {
      console.error("Failed to add custom meal:", err);
    }
  };

  // Derive weekly overview from actual history
  const weeklyOverview = useMemo(() => {
    const overview = {};
    days.forEach(day => {
      const log = history.find(l => l.date.startsWith(weekDates[day]));
      overview[day] = {
        planned: true, 
        completed: log ? log.meals.some(m => m.eaten) : false
      };
    });
    return overview;
  }, [history, days]);

  if (!user?.assignedDiet) {
    return (
      <DashboardLayout role="user">
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
            <Utensils className="w-10 h-10 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No Diet Plan Assigned</h2>
          <p className="text-zinc-400 max-w-sm">
            Your nutritionist/trainer hasn't assigned a specific meal plan to you yet. 
            Check back soon or contact your trainer {trainer}!
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const currentDayIndex = days.indexOf(selectedDay);

  return (
    <DashboardLayout role="user">
      <div className="flex-1 space-y-6 pb-10">
        
        {/* ========== HEADER ========== */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              🍽️ My Meal Plan
            </h1>
            <p className="text-zinc-400 text-sm flex items-center gap-2 mt-1">
              <User className="w-4 h-4" />
              Assigned by: <span className="text-cyan-400 font-bold">{trainer}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10">
              Goal: <span className="text-white font-black">Muscle Gain 💪</span>
            </div>
            <div className="px-3 py-1 bg-cyan-400/10 rounded-full border border-cyan-400/20 text-cyan-400 font-black">
              {goals.calories} cal/day
            </div>
          </div>
        </motion.div>

        {/* ========== WEEKLY MEAL PLAN SELECTOR ========== */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold flex items-center gap-2 uppercase tracking-widest text-[10px] text-zinc-500">
              <Calendar className="w-4 h-4 text-cyan-400" />
              Weekly Meal Plan Overview
            </h3>
            <span className="text-[10px] text-emerald-400/80 font-black italic bg-emerald-400/5 border border-emerald-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">Interactive</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => {
                const newIndex = Math.max(0, currentDayIndex - 1);
                setSelectedDay(days[newIndex]);
              }}
              disabled={currentDayIndex === 0}
              className="p-3 hover:bg-white/5 rounded-2xl disabled:opacity-20 transition-all border border-white/5"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>

            <div className="flex-1 grid grid-cols-7 gap-3">
              {days.map((day) => {
                const overview = weeklyOverview[day];
                const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'short' });
                const isSelected = selectedDay === day;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`py-4 px-2 rounded-2xl text-xs font-bold transition-all relative border ${
                      isSelected
                        ? "bg-cyan-400 border-cyan-400 text-darkBg shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                        : "bg-white/2 text-zinc-500 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="uppercase tracking-widest text-[10px] mb-2">{day}</div>
                    
                    {/* Status Indicator */}
                    <div className="flex justify-center">
                      {overview.completed ? (
                        <Check className={`w-4 h-4 ${isSelected ? 'text-darkBg' : 'text-green-400'}`} />
                      ) : isToday ? (
                        <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-darkBg' : 'bg-orange-500 animate-pulse'}`} />
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                const newIndex = Math.min(days.length - 1, currentDayIndex + 1);
                setSelectedDay(days[newIndex]);
              }}
              disabled={currentDayIndex === days.length - 1}
              className="p-3 hover:bg-white/5 rounded-2xl disabled:opacity-20 transition-all border border-white/5"
            >
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </Card>

        {/* ========== TODAY'S MACRO PROGRESS ========== */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-black text-white">📊 Today's Macros: <span className="text-cyan-400">{selectedDay}</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <MacroCard
              label="Calories"
              consumed={consumed.calories}
              goal={goals.calories}
              color="cyan"
              unit="cal"
            />
            <MacroCard
              label="Protein"
              consumed={consumed.protein}
              goal={goals.protein}
              color="blue"
              unit="g"
            />
            <MacroCard
              label="Carbs"
              consumed={consumed.carbs}
              goal={goals.carbs}
              color="green"
              unit="g"
            />
            <MacroCard
              label="Fats"
              consumed={consumed.fats}
              goal={goals.fats}
              color="orange"
              unit="g"
            />
          </div>
        </section>

        {/* ========== TODAY'S MEALS ========== */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
               🔥 Today's Meal Plan
            </h2>
            <button 
              onClick={() => setIsAddingCustom(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-darkBg font-black rounded-xl text-xs flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Log Extra Meal
            </button>
          </div>

          {isAddingCustom && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 border border-cyan-400/30 bg-cyan-400/5 rounded-3xl space-y-4"
            >
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">Adding Custom Meal Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Meal Name (e.g., Evening Protein Shake)" 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400"
                  value={customMeal.name}
                  onChange={(e) => setCustomMeal({ ...customMeal, name: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder="Calories" 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400"
                  value={customMeal.calories}
                  onChange={(e) => setCustomMeal({ ...customMeal, calories: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder="Protein (g)" 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400"
                  value={customMeal.protein}
                  onChange={(e) => setCustomMeal({ ...customMeal, protein: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder="Carbs (g)" 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400"
                  value={customMeal.carbs}
                  onChange={(e) => setCustomMeal({ ...customMeal, carbs: e.target.value })}
                />
                <input 
                  type="number" 
                  placeholder="Fats (g)" 
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-cyan-400"
                  value={customMeal.fats}
                  onChange={(e) => setCustomMeal({ ...customMeal, fats: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsAddingCustom(false)} className="px-4 py-2 text-zinc-500 text-xs font-bold uppercase tracking-widest hover:text-white">Cancel</button>
                <button onClick={handleAddCustomMeal} className="px-6 py-2 bg-emerald-500 text-darkBg font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-emerald-400">Save Entry</button>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            {mealPlan && Object.keys(mealPlan).length > 0 ? (
              Object.entries(mealPlan).map(([key, meal]) => {
                const mealState = meals[key] || { eaten: false, photoUploaded: false };
                return (
                  <MealCard
                    key={key}
                    meal={meal}
                    isEaten={mealState.eaten}
                    hasPhoto={mealState.photoUploaded}
                    onToggle={() => toggleMeal(key)}
                    onPhotoUpload={() => handlePhotoUpload(key)}
                  />
                );
              })
            ) : (
              <div className="py-12 text-center text-zinc-400">
                No meals defined for this day. Contact your trainer.
              </div>
            )}
            
            {/* Display custom meals from the history if any */}
            {history.find(log => log.date.startsWith(selectedDate))?.meals?.slice(Object.keys(mealPlan).length).map((custom, idx) => (
              <MealCard
                key={`custom-${idx}`}
                meal={{
                  ...custom,
                  items: custom.items || [],
                  icon: "🍎",
                  time: "Extra"
                }}
                isEaten={true}
                hasPhoto={false}
                onToggle={() => {}} // Custom meals are logged as eaten
                onPhotoUpload={() => {}}
              />
            ))}
          </div>
        </section>

        {/* ========== BOTTOM SECTION ========== */}
        <div className="grid grid-cols-1 gap-8">
           {/* TRAINER'S NOTES */}
           <Card className="p-8 bg-gradient-to-br from-[#1e1b4b]/50 to-darkBg border border-purple-500/20 relative overflow-hidden">
             <div className="relative z-10">
               <div className="p-3 bg-purple-500/20 w-fit rounded-2xl mb-6">
                 <span className="text-3xl">💡</span>
               </div>
               <h3 className="font-black text-2xl text-white mb-2 tracking-tight">Trainer's Insight</h3>
               <p className="text-zinc-400 leading-relaxed text-sm italic">
                 {user?.assignedDiet?.note || "Follow your personalized diet plan for best results. Remember to stay hydrated!"}
               </p>
               <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div>
                    <p className="text-white font-bold text-sm">{trainer}</p>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Head Nutritionist</p>
                  </div>
               </div>
             </div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
           </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ========== MACRO CARD COMPONENT ==========
function MacroCard({ label, consumed, goal, color, unit }) {
  const percentage = Math.min((consumed / goal) * 100, 100);
  
  const colors = {
    cyan: "from-cyan-400 to-blue-500 shadow-cyan-400/30 text-cyan-400",
    blue: "from-indigo-400 to-purple-500 shadow-indigo-400/30 text-indigo-400",
    green: "from-emerald-400 to-green-500 shadow-emerald-400/30 text-emerald-400",
    orange: "from-orange-400 to-red-500 shadow-orange-400/30 text-orange-400"
  };

  return (
    <Card className="p-5 border-white/5 group hover:border-white/10 transition-all">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">{label}</span>
          <span className={`text-[10px] font-black uppercase tracking-tighter ${colors[color].split(' ').pop()}`}>
            {Math.round(percentage)}% Full
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white">{consumed}</span>
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">/ {goal}{unit}</span>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
            className={`h-full bg-gradient-to-r ${colors[color].split(' ').slice(0, 2).join(' ')} shadow-[0_0_10px_currentColor]`}
          />
        </div>
      </div>
    </Card>
  );
}

// ========== MEAL CARD COMPONENT ==========
function MealCard({ meal, isEaten, hasPhoto, onToggle, onPhotoUpload }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass flex flex-col md:flex-row items-center gap-6 p-6 transition-all border ${
        isEaten
          ? "border-green-500/30 bg-green-500/5 shadow-[0_0_30px_rgba(34,197,94,0.05)]"
          : "border-white/5 hover:border-white/10"
      }`}
    >
      <div className="flex flex-col items-center gap-3 shrink-0 self-stretch justify-center">
        <button
          onClick={onToggle}
          className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all ${
            isEaten
              ? "bg-green-500 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
              : "border-white/10 hover:border-cyan-400 hover:bg-cyan-400/5 group/mark"
          }`}
        >
          {isEaten ? (
            <Check className="w-6 h-6 text-darkBg font-black" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover/mark:bg-cyan-400 transition-colors" />
          )}
        </button>
        <span className={`text-[10px] font-black uppercase tracking-widest ${isEaten ? 'text-green-400' : 'text-zinc-600'}`}>
          {isEaten ? 'Eaten' : 'Mark'}
        </span>
      </div>

      <div className="flex-1 w-full text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
          <span className="text-3xl">{meal.icon}</span>
          <div>
            <h3 className="font-bold text-xl tracking-tight">{meal.name}</h3>
            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{meal.time}</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
          {meal.items.map((item, index) => (
            <span key={index} className="text-xs bg-white/5 border border-white/5 px-3 py-1 rounded-full text-zinc-400">
               {item}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5">
          <MacroStat label="Cals" val={meal.calories} color="text-white" />
          <MacroStat label="Protein" val={`${meal.protein}g`} color="text-blue-400" />
          <MacroStat label="Carbs" val={`${meal.carbs}g`} color="text-green-400" />
          <MacroStat label="Fats" val={`${meal.fats}g`} color="text-orange-400" />
        </div>
      </div>

      <button
        onClick={onPhotoUpload}
        className={`p-5 rounded-2xl border-2 border-dashed transition-all group shrink-0 ${
          hasPhoto
            ? "bg-cyan-400/10 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
            : "border-white/10 hover:border-cyan-400/50"
        }`}
      >
        <Camera className={`w-6 h-6 ${hasPhoto ? "text-cyan-400" : "text-zinc-600 group-hover:text-cyan-400"}`} />
        {hasPhoto && (
           <motion.div 
             initial={{ opacity: 0, y: 5 }} 
             animate={{ opacity: 1, y: 0 }} 
             className="text-[8px] font-black uppercase tracking-tighter text-cyan-400 mt-1"
           >
             Uploaded
           </motion.div>
        )}
      </button>
    </motion.div>
  );
}

function MacroStat({ label, val, color }) {
  return (
    <div>
      <p className="text-[8px] font-black text-zinc-600 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{val}</p>
    </div>
  );
}
