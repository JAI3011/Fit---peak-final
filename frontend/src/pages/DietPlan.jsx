import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Camera, User, Calendar, Utensils } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import { useFitness } from "../context/FitnessContext";

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
  if (!raw) return null;
  // Already a keyed object (fallback / mock)
  if (!Array.isArray(raw)) return raw;
  // Convert array → keyed object using index-based keys
  const keyMap = ["breakfast", "midMorning", "lunch", "evening", "dinner"];
  const result = {};
  raw.forEach((meal, i) => {
    const key = keyMap[i] || `meal_${i}`;
    result[key] = {
      ...meal,
      icon: meal.icon || getIcon(meal.name),
      carbs: meal.carbs || 0,
      fats: meal.fats || 0,
      calories: meal.calories || 0,
      protein: meal.protein || 0,
      // Normalise items: objects → display strings
      items: Array.isArray(meal.items)
        ? meal.items.map(itemToString)
        : [],
    };
  });
  return result;
};

export default function DietPlan() {
  const { user, addCalories, updateMacros } = useFitness();
  const [selectedDay, setSelectedDay] = useState("Thu");
  
  // Dynamic meal plan from record or null if not assigned
  const mealPlan = normaliseMeals(user?.assignedDiet?.meals);

  const [meals, setMeals] = useState({
    breakfast: { eaten: false, photoUploaded: false },
    midMorning: { eaten: false, photoUploaded: false },
    lunch: { eaten: false, photoUploaded: false },
    evening: { eaten: false, photoUploaded: false },
    dinner: { eaten: false, photoUploaded: false }
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trainer = user?.trainerName || "Trainer";

  // Sync meals keys with mealPlan to avoid undefined access
  React.useEffect(() => {
    if (mealPlan) {
      setMeals((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(mealPlan).forEach((key) => {
          if (!next[key]) {
            next[key] = { eaten: false, photoUploaded: false };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [Object.keys(mealPlan).join(',')]);

  // Goals
  // Goals – derive from assigned diet totals if no explicit goals field
  const diet = user?.assignedDiet;
  const goals = diet?.goals || {
    calories: diet?.dailyCalories || 2800,
    protein: diet?.dailyProtein || 160,
    carbs: 280,
    fats: 65
  };

  // Calculate consumed based on checked meals
  const consumed = {
    calories: Object.keys(meals).reduce((sum, key) => 
      meals[key]?.eaten ? sum + (mealPlan[key]?.calories || 0) : sum, 0),
    protein: Object.keys(meals).reduce((sum, key) => 
      meals[key]?.eaten ? sum + (mealPlan[key]?.protein || 0) : sum, 0),
    carbs: Object.keys(meals).reduce((sum, key) => 
      meals[key]?.eaten ? sum + (mealPlan[key]?.carbs || 0) : sum, 0),
    fats: Object.keys(meals).reduce((sum, key) => 
      meals[key]?.eaten ? sum + (mealPlan[key]?.fats || 0) : sum, 0)
  };

  const toggleMeal = async (mealKey) => {
    const currentMealState = meals[mealKey] || { eaten: false, photoUploaded: false };
    const isNowEaten = !currentMealState.eaten;
    const meal = mealPlan[mealKey];
    if (!meal) return;
    
    // 1. Update local state for immediate feedback
    const nextMeals = {
      ...meals,
      [mealKey]: { ...currentMealState, eaten: isNowEaten }
    };
    setMeals(nextMeals);

    // 2. Sync with global context (temporary local macros)
    const multiplier = isNowEaten ? 1 : -1;
    addCalories(meal.calories * multiplier);
    updateMacros({
      protein: meal.protein * multiplier,
      carbs: meal.carbs * multiplier,
      fats: meal.fats * multiplier
    });

    // 3. Persist full daily state to backend
    try {
      await userAPI.logDiet({
        meals: Object.entries(nextMeals).map(([k, m]) => ({
          name: mealPlan[k]?.name || k,
          eaten: m.eaten,
          photo_uploaded: m.photoUploaded,
          calories: mealPlan[k]?.calories || 0,
          protein: mealPlan[k]?.protein || 0,
          carbs: mealPlan[k]?.carbs || 0,
          fats: mealPlan[k]?.fats || 0,
          items: mealPlan[k]?.items || []
        }))
      });
    } catch (err) {
      console.error('Failed to log diet entry:', err);
    }
  };

  const handlePhotoUpload = (mealKey) => {
    setMeals((prev) => ({
      ...prev,
      [mealKey]: { ...(prev[mealKey] || { eaten: false, photoUploaded: false }), photoUploaded: true }
    }));
  };

  const weeklyOverview = {
    Mon: { planned: true, completed: true },
    Tue: { planned: true, completed: true },
    Wed: { planned: true, completed: false },
    Thu: { planned: true, completed: false },
    Fri: { planned: true, completed: false },
    Sat: { planned: true, completed: false },
    Sun: { planned: true, completed: false }
  };

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
            <span className="text-[10px] text-zinc-600 font-black italic bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">Read-Only</span>
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
                const isToday = day === "Thu";
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
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
               🔥 Today's Meal Plan
            </h2>
          </div>

          <div className="space-y-4">
            {Object.entries(mealPlan).map(([key, meal]) => {
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
            })}
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
      <button
        onClick={onToggle}
        className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all shrink-0 ${
          isEaten
            ? "bg-green-500 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
            : "border-white/10 hover:border-cyan-400"
        }`}
      >
        {isEaten && <Check className="w-5 h-5 text-darkBg font-black" />}
      </button>

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
