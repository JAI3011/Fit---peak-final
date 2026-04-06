import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Utensils, PieChart, Check } from 'lucide-react';
import { useTrainer } from '../context/TrainerContext';

const MealPlanBuilder = () => {
  const { addDietPlan } = useTrainer();
  const [meals, setMeals] = useState([
    { id: 1, name: 'Breakfast', items: 'Oatmeal, Berries, Protein Powder', protein: 30, carbs: 45, fats: 10 }
  ]);
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const addMeal = () => {
    setMeals([...meals, { id: Date.now(), name: '', items: '', protein: 0, carbs: 0, fats: 0 }]);
  };

  const removeMeal = (id) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const updateMeal = (id, field, value) => {
    setMeals(meals.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const totals = meals.reduce((acc, current) => ({
    protein: acc.protein + Number(current.protein),
    carbs: acc.carbs + Number(current.carbs),
    fats: acc.fats + Number(current.fats),
    calories: acc.calories + (Number(current.protein) * 4) + (Number(current.carbs) * 4) + (Number(current.fats) * 9)
  }), { protein: 0, carbs: 0, fats: 0, calories: 0 });

  const handleSave = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    try {
      // ✅ addDietPlan now calls backend (fixed in TrainerContext Fix 14)
      await addDietPlan({
        name:           planName,
        description:    description,
        dailyCalories:  totals.calories || 2000,
        dailyProtein:   totals.protein  || 120,
        duration:       "Flexible",
        meals:          meals.map(meal => ({
          name:     meal.name,
          time:     meal.time || null,
          calories: Number(meal.calories) || 0,
          protein:  Number(meal.protein)  || 0,
          items:    (meal.items || []).split(',').map(item => ({
            name:     item.trim() || '',
            quantity: '',
            calories: 0,
            protein:  0,
          })),
        })),
      });

      setSaveStatus('success');
      // ✅ Clear form after successful save
      setPlanName('');
      setDescription('');
      setMeals([{ id: Date.now(), name: '', items: '', protein: 0, carbs: 0, fats: 0 }]);
      setTimeout(() => setSaveStatus(null), 3000);

    } catch (err) {
      console.error('Failed to save diet plan:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end border-b border-white/5 pb-8">
        <div className="space-y-4 flex-1 pr-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">Nutrition Engine</p>
            <input 
              type="text" 
              placeholder="Untitled Meal Plan"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="text-4xl font-black bg-transparent border-none outline-none text-white placeholder-white/20 tracking-tighter italic w-full"
            />
          </div>
          <input 
            type="text"
            placeholder="Plan description (e.g. 2500kcal Muscle Gain)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-400 focus:border-purple-400/50 outline-none"
          />
        </div>
        <div className="flex flex-col items-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-4 ${saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-purple-500 text-white'} font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50`}
          >
            {saveStatus === 'success' ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Template'}</>}
          </button>
          {/* Add below save button */}
          {saveStatus === 'error' && (
            <p className="text-red-400 text-sm mt-2 text-center">
              Failed to save. Please try again.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Meal Structure</h3>
            <button 
              onClick={addMeal}
              className="flex items-center gap-2 text-[10px] font-black uppercase text-purple-400 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Meal
            </button>
          </div>

          <div className="space-y-3">
            {meals.map((meal) => (
              <motion.div 
                key={meal.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel p-6 border-white/5 group hover:border-white/10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Meal Title</p>
                    <input 
                      type="text" 
                      value={meal.name}
                      onChange={(e) => updateMeal(meal.id, 'name', e.target.value)}
                      placeholder="e.g. Pre-Workout Breakfast"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-400/50 outline-none font-bold"
                    />
                  </div>
                  <div className="flex justify-end pt-5">
                    <button 
                      onClick={() => removeMeal(meal.id)}
                      className="p-3 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Ingredients / Food Items</p>
                    <textarea 
                      value={meal.items}
                      onChange={(e) => updateMeal(meal.id, 'items', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-400 focus:border-purple-400/50 outline-none min-h-[80px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Protein (g)</p>
                      <input 
                        type="number" 
                        value={meal.protein}
                        onChange={(e) => updateMeal(meal.id, 'protein', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-purple-400/50 outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Carbs (g)</p>
                      <input 
                        type="number" 
                        value={meal.carbs}
                        onChange={(e) => updateMeal(meal.id, 'carbs', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-purple-400/50 outline-none"
                      />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Fats (g)</p>
                      <input 
                        type="number" 
                        value={meal.fats}
                        onChange={(e) => updateMeal(meal.id, 'fats', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-purple-400/50 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Macro Dashboard</h3>
          <div className="glass-panel p-8 rounded-[2.5rem] bg-gradient-to-br from-purple-500/10 to-transparent sticky top-8">
            <div className="text-center mb-8">
              <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Estimated Daily Total</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-black text-white tracking-tighter">{Math.round(totals.calories)}</span>
                <span className="text-sm font-bold text-purple-400 uppercase tracking-widest">Kcal</span>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { label: 'Protein', value: totals.protein, color: 'bg-cyan-400', unit: 'g' },
                { label: 'Carbs', value: totals.carbs, color: 'bg-emerald-400', unit: 'g' },
                { label: 'Fats', value: totals.fats, color: 'bg-orange-400', unit: 'g' },
              ].map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span className="text-zinc-500">{m.label}</span>
                    <span className="text-white">{m.value}{m.unit}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (m.value / 300) * 100)}%` }} // Arbitrary max for visualization
                      className={`h-full ${m.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <PieChart className="w-5 h-5 text-purple-400" />
              <p className="text-[10px] text-zinc-400 font-medium leading-relaxed uppercase tracking-tighter">Automatic macro-split calculated based on manual inputs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanBuilder;
