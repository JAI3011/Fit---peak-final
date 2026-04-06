import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Check } from 'lucide-react';
import { useTrainer } from '../context/TrainerContext';

const WorkoutBuilder = () => {
  const { addWorkout } = useTrainer();
  const [exercises, setExercises] = useState([
    { id: 1, name: 'Barbell Squat', sets: 4, reps: 10, rest: '90s' }
  ]);
  const [planName, setPlanName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  const addExercise = () => {
    setExercises([...exercises, { id: Date.now(), name: '', sets: 3, reps: 12, rest: '60s' }]);
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const updateExercise = (id, field, value) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      alert("Please enter a plan name");
      return;
    }

    setIsSaving(true);
    setSaveStatus(null);
    try {
      // ✅ addWorkout now calls backend (fixed in TrainerContext Fix 14)
      await addWorkout({
        name:        planName,
        description: description,
        exercises:   exercises.map(ex => ({
          name:     ex.name,
          category: ex.category  || null,
          equipment: ex.equipment || null,
          sets:     parseInt(ex.sets) || 3,
          reps:     parseInt(ex.reps) || 12,
          rest:     parseInt(ex.rest) || 60,
        })),
        duration:  "45-60 min",
        intensity: "Medium",
      });

      setSaveStatus('success');
      // ✅ Clear form after successful save
      setPlanName('');
      setDescription('');
      setExercises([{ id: Date.now(), name: '', sets: 3, reps: 12, rest: '60s' }]);
      setTimeout(() => setSaveStatus(null), 3000);

    } catch (err) {
      console.error('Failed to save workout:', err);
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
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400">Content Engine</p>
            <input 
              type="text" 
              placeholder="Untitled Workout Plan"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="text-4xl font-black bg-transparent border-none outline-none text-white placeholder-white/20 tracking-tighter italic w-full"
            />
          </div>
          <input 
            type="text"
            placeholder="Add a brief description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-400 focus:border-cyan-400/50 outline-none"
          />
        </div>
        <div className="flex flex-col items-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 py-4 ${saveStatus === 'success' ? 'bg-green-500 text-white' : 'bg-cyan-400 text-black'} font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50`}
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

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Exercise Sequence</h3>
          <button 
            onClick={addExercise}
            className="flex items-center gap-2 text-[10px] font-black uppercase text-cyan-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Exercise
          </button>
        </div>

        <div className="space-y-3">
          {exercises.map((ex, index) => (
            <motion.div 
              key={ex.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-panel p-4 flex items-center gap-6 border-white/5 group hover:border-white/10"
            >
              <div className="text-zinc-700 font-black text-xl italic w-8">{index + 1}</div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Exercise Name</p>
                  <input 
                    type="text" 
                    value={ex.name}
                    onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                    placeholder="e.g. Deadlift"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400/50 outline-none"
                  />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Sets</p>
                  <input 
                    type="number" 
                    value={ex.sets}
                    onChange={(e) => updateExercise(ex.id, 'sets', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400/50 outline-none"
                  />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Reps/Int.</p>
                  <input 
                    type="text" 
                    value={ex.reps}
                    onChange={(e) => updateExercise(ex.id, 'reps', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400/50 outline-none"
                  />
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase text-zinc-500 mb-1">Rest</p>
                  <input 
                    type="text" 
                    value={ex.rest}
                    onChange={(e) => updateExercise(ex.id, 'rest', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-cyan-400/50 outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => removeExercise(ex.id)}
                className="p-3 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutBuilder;
