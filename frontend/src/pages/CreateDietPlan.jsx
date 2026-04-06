import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, ArrowLeft, Loader, X } from "lucide-react";
import { useTrainer } from "../context/TrainerContext";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";

export default function CreateDietPlan() {
  const navigate = useNavigate();
  const { addDietPlan } = useTrainer();
  const [planName, setPlanName] = useState("");
  const [dailyCalories, setDailyCalories] = useState(2500);
  const [dailyProtein, setDailyProtein] = useState(160);
  const [meals, setMeals] = useState([
    { id: '1', name: "Breakfast", time: "07:00", items: [], calories: 0, protein: 0 }
  ]);
  const [errors, setErrors] = useState({ planName: "", dailyCalories: "", dailyProtein: "", meals: [] });
  const [isSaving, setIsSaving] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case 'planName':
        if (!value) return "Plan name is required";
        if (value.length < 3) return "Name must be at least 3 characters";
        break;
      case 'dailyCalories':
        if (isNaN(value) || value < 500 || value > 10000) return "Must be 500 - 10,000 kcal";
        break;
      case 'dailyProtein':
        if (isNaN(value) || value < 0 || value > 500) return "Must be 0 - 500g";
        break;
      case 'meal':
        const mErrors = {};
        if (!value.name) mErrors.name = "Meal name required";
        if (value.items.length === 0) mErrors.items = "Add at least one food item";
        const itemErrors = value.items.map(item => {
          const iErrors = {};
          if (!item.name) iErrors.name = "Required";
          if (!item.quantity) iErrors.quantity = "Req";
          if (item.calories < 0) iErrors.calories = "Min 0";
          if (item.protein < 0) iErrors.protein = "Min 0";
          return Object.keys(iErrors).length > 0 ? iErrors : null;
        });
        if (itemErrors.some(e => e !== null)) mErrors.foodItems = itemErrors;
        return Object.keys(mErrors).length > 0 ? mErrors : null;
      default:
        return "";
    }
    return "";
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        id: Date.now().toString(),
        name: `Meal ${meals.length + 1}`,
        time: "",
        items: [],
        calories: 0,
        protein: 0
      }
    ]);
    setErrors(prev => ({ ...prev, meals: [...prev.meals, null] }));
  };

  const removeMeal = (id) => {
    const index = meals.findIndex(m => m.id === id);
    setMeals(meals.filter(meal => meal.id !== id));
    setErrors(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  const updateMeal = (id, field, value) => {
    const updatedMeals = meals.map(meal =>
      meal.id === id ? { ...meal, [field]: value } : meal
    );
    setMeals(updatedMeals);
    
    // Validate meal
    const meal = updatedMeals.find(m => m.id === id);
    const mealError = validateField('meal', meal);
    const index = meals.findIndex(m => m.id === id);
    const newMealErrors = [...errors.meals];
    newMealErrors[index] = mealError;
    setErrors(prev => ({ ...prev, meals: newMealErrors }));
  };

  const addFoodItem = (mealId) => {
    setMeals(meals.map(meal =>
      meal.id === mealId
        ? {
            ...meal,
            items: [...meal.items, { name: "", quantity: "", calories: 0, protein: 0 }]
          }
        : meal
    ));
  };

  const removeFoodItem = (mealId, itemIndex) => {
    setMeals(meals.map(meal =>
      meal.id === mealId
        ? {
            ...meal,
            items: meal.items.filter((_, i) => i !== itemIndex)
          }
        : meal
    ));
  };

  const updateFoodItem = (mealId, itemIndex, field, value) => {
    const updatedMeals = meals.map(meal =>
      meal.id === mealId
        ? {
            ...meal,
            items: meal.items.map((item, i) =>
              i === itemIndex ? { ...item, [field]: value } : item
            )
          }
        : meal
    );
    setMeals(updatedMeals);
    
    // Validate meal
    const meal = updatedMeals.find(m => m.id === mealId);
    const mealError = validateField('meal', meal);
    const index = meals.findIndex(m => m.id === mealId);
    const newMealErrors = [...errors.meals];
    newMealErrors[index] = mealError;
    setErrors(prev => ({ ...prev, meals: newMealErrors }));
  };

  const validateForm = () => {
    const pError = validateField('planName', planName);
    const cError = validateField('dailyCalories', dailyCalories);
    const prError = validateField('dailyProtein', dailyProtein);
    const mErrors = meals.map(meal => validateField('meal', meal));

    setErrors({
      planName: pError,
      dailyCalories: cError,
      dailyProtein: prError,
      meals: mErrors
    });

    const hasMErrors = mErrors.some(e => e !== null);
    return !pError && !cError && !prError && !hasMErrors && meals.length > 0;
  };

  const saveDietPlan = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const plan = {
        name: planName,
        dailyCalories,
        dailyProtein,
        meals,
        createdAt: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await addDietPlan(plan);
      setPlanName("");
      setMeals([{ id: '1', name: "Breakfast", time: "07:00", items: [], calories: 0, protein: 0 }]);
      setErrors({ planName: "", dailyCalories: "", dailyProtein: "", meals: [] });
      
      navigate("/trainer/dashboard");
    } catch (error) {
      console.error("Failed to save diet plan:", error);
      setIsSaving(false);
    }
  };

  const totalCalories = meals.reduce((sum, meal) =>
    sum + meal.items.reduce((mealSum, item) => mealSum + (item.calories || 0), 0), 0
  );

  const totalProtein = meals.reduce((sum, meal) =>
    sum + meal.items.reduce((mealSum, item) => mealSum + (item.protein || 0), 0), 0
  );

  return (
    <DashboardLayout role="trainer">
      <div className="flex-1 space-y-6">
        
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <button 
            onClick={() => navigate(-1)}
            disabled={isSaving}
            className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Create Diet Plan</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Design a custom nutrition plan for your client
            </p>
          </div>
        </motion.div>

        {/* PLAN DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <Card>
            <label className="block text-sm text-zinc-400 mb-2 font-bold uppercase tracking-tighter">Plan Name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => {
                setPlanName(e.target.value);
                setErrors(prev => ({ ...prev, planName: validateField('planName', e.target.value) }));
              }}
              disabled={isSaving}
              placeholder="e.g., High Protein Meal Plan"
              className={`w-full bg-zinc-800 border ${errors.planName ? 'border-red-400/50' : 'border-zinc-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50 transition-all`}
            />
            {errors.planName && <p className="text-red-400 text-xs mt-1">{errors.planName}</p>}
          </Card>

          <Card>
            <label className="block text-sm text-zinc-400 mb-2 font-bold uppercase tracking-tighter">Daily Calories</label>
            <input
              type="number"
              value={dailyCalories}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setDailyCalories(val);
                setErrors(prev => ({ ...prev, dailyCalories: validateField('dailyCalories', val) }));
              }}
              disabled={isSaving}
              className={`w-full bg-zinc-800 border ${errors.dailyCalories ? 'border-red-400/50' : 'border-zinc-700'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50`}
            />
            {errors.dailyCalories && <p className="text-red-400 text-xs mt-1">{errors.dailyCalories}</p>}
          </Card>

          <Card>
            <label className="block text-sm text-zinc-400 mb-2 font-bold uppercase tracking-tighter">Daily Protein (g)</label>
            <input
              type="number"
              value={dailyProtein}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setDailyProtein(val);
                setErrors(prev => ({ ...prev, dailyProtein: validateField('dailyProtein', val) }));
              }}
              disabled={isSaving}
              className={`w-full bg-zinc-800 border ${errors.dailyProtein ? 'border-red-400/50' : 'border-zinc-700'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50`}
            />
            {errors.dailyProtein && <p className="text-red-400 text-xs mt-1">{errors.dailyProtein}</p>}
          </Card>
        </div>

        {/* DAILY TOTALS */}
        <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30 text-white">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Total Calories</p>
              <p className="text-2xl font-bold">
                {totalCalories} <span className="text-sm text-zinc-500">/ {dailyCalories}</span>
              </p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full bg-gradient-to-r ${totalCalories > dailyCalories ? 'from-red-500 to-red-600' : 'from-cyan-500 to-cyan-600'} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((totalCalories / dailyCalories) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Total Protein</p>
              <p className="text-2xl font-bold">
                {totalProtein}g <span className="text-sm text-zinc-500">/ {dailyProtein}g</span>
              </p>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full bg-gradient-to-r ${totalProtein > dailyProtein ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600'} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min((totalProtein / dailyProtein) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* MEALS */}
        <Card className="text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Meals ({meals.length})</h2>
            <button
              onClick={addMeal}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Meal
            </button>
          </div>

          <div className="space-y-4">
            {meals.map((meal, index) => (
              <MealCard
                key={meal.id}
                meal={meal}
                errors={errors.meals[index]}
                onUpdate={updateMeal}
                onRemove={removeMeal}
                onAddFood={addFoodItem}
                onRemoveFood={removeFoodItem}
                onUpdateFood={updateFoodItem}
                disabled={isSaving}
              />
            ))}
          </div>
        </Card>

        {/* SAVE BUTTON */}
        <div className="flex justify-end gap-3 pb-8">
          <button 
            disabled={isSaving}
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={saveDietPlan}
            disabled={isSaving || meals.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed rounded-lg font-semibold transition-all flex items-center gap-2 text-white shadow-xl shadow-green-500/10 min-w-[160px] justify-center"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin text-white" />
                <span className="text-white">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-white" />
                <span className="text-white">Save Diet Plan</span>
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// MEAL CARD
function MealCard({ meal, onUpdate, onRemove, onAddFood, onRemoveFood, onUpdateFood, disabled, errors }) {
  const totalCalories = meal.items.reduce((sum, item) => sum + (item.calories || 0), 0);
  const totalProtein = meal.items.reduce((sum, item) => sum + (item.protein || 0), 0);

  return (
    <div className={`p-4 bg-zinc-800/50 rounded-lg border ${errors ? 'border-red-400/30' : 'border-zinc-800'} ${disabled ? 'opacity-70 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <input
              type="text"
              value={meal.name}
              disabled={disabled}
              onChange={(e) => onUpdate(meal.id, "name", e.target.value)}
              placeholder="Meal name"
              className={`w-full bg-zinc-900 border ${errors?.name ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all`}
            />
            {errors?.name && <p className="text-red-400 text-[10px]">{errors.name}</p>}
          </div>
          <input
            type="time"
            value={meal.time}
            disabled={disabled}
            onChange={(e) => onUpdate(meal.id, "time", e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all font-mono"
          />
        </div>
        {!disabled && (
          <button
            onClick={() => onRemove(meal.id)}
            className="ml-3 p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
          >
            <Trash2 className="w-4 h-4 text-red-500/50 group-hover:text-red-400" />
          </button>
        )}
      </div>

      {errors?.items && <p className="text-red-400 text-xs mb-2 mt-[-4px] ml-1">{errors.items}</p>}

      {/* Food Items */}
      <div className="space-y-2 mb-3 text-white">
        {meal.items.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="grid grid-cols-5 gap-2">
              <input
                type="text"
                value={item.name}
                disabled={disabled}
                onChange={(e) => onUpdateFood(meal.id, index, "name", e.target.value)}
                placeholder="Food item"
                className={`col-span-2 bg-zinc-900 border ${errors?.foodItems?.[index]?.name ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all`}
              />
              <input
                type="text"
                value={item.quantity}
                disabled={disabled}
                onChange={(e) => onUpdateFood(meal.id, index, "quantity", e.target.value)}
                placeholder="Qty"
                className={`bg-zinc-900 border ${errors?.foodItems?.[index]?.quantity ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all`}
              />
              <input
                type="number"
                value={item.calories}
                disabled={disabled}
                onChange={(e) => onUpdateFood(meal.id, index, "calories", parseInt(e.target.value) || 0)}
                placeholder="Cal"
                className={`bg-zinc-900 border ${errors?.foodItems?.[index]?.calories ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all`}
              />
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={item.protein}
                  disabled={disabled}
                  onChange={(e) => onUpdateFood(meal.id, index, "protein", parseInt(e.target.value) || 0)}
                  placeholder="Protein"
                  className={`flex-1 bg-zinc-900 border ${errors?.foodItems?.[index]?.protein ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-all`}
                />
                {!disabled && (
                  <button
                    onClick={() => onRemoveFood(meal.id, index)}
                    className="p-1.5 hover:bg-red-500/10 rounded transition-colors group"
                  >
                    <Trash2 className="w-3 h-3 text-red-500/50 group-hover:text-red-400" />
                  </button>
                )}
              </div>
            </div>
            {errors?.foodItems?.[index] && (
              <div className="flex gap-2 ml-1">
                {Object.values(errors.foodItems[index]).map((err, i) => (
                  <span key={i} className="text-red-400 text-[9px] uppercase font-bold">{err}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => onAddFood(meal.id)}
        disabled={disabled}
        className="text-cyan-400 text-[11px] font-bold uppercase tracking-wider hover:text-cyan-300 transition-colors mb-3 flex items-center gap-1 disabled:opacity-50"
      >
        <Plus className="w-3 h-3" />
        Add Food Item
      </button>

      {/* Meal Totals */}
      <div className="pt-3 border-t border-zinc-700 flex justify-between text-xs font-medium uppercase tracking-widest">
        <span className="text-zinc-500">Meal Totals</span>
        <span className="text-white">
          <strong className="text-cyan-400">{totalCalories}</strong> kcal • 
          <strong className="text-blue-400 ml-2">{totalProtein}g</strong> protein
        </span>
      </div>
    </div>
  );
}