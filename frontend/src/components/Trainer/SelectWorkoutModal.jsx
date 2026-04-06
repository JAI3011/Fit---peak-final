import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Dumbbell, Loader } from 'lucide-react';
import { useTrainer } from '../../context/TrainerContext';

const SelectWorkoutModal = ({ isOpen, onClose, onAssign }) => {
  const { workouts } = useTrainer();
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlanId) return;

    setIsAssigning(true);
    try {
      const selectedPlan = workouts.find(p => p.id === selectedPlanId);
      if (selectedPlan) {
        // Simulate assignment delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await onAssign({
          ...selectedPlan,
          assignedAt: new Date().toISOString(),
        });
        
        onClose();
        setSelectedPlanId('');
      }
    } catch (error) {
      console.error("Assignment failed:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md glass-panel p-8 rounded-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Dumbbell className="w-6 h-6 text-cyan-400" />
                Assign Workout Plan
              </h2>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-50"
                disabled={isAssigning}
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1">
                  Select Template
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  disabled={isAssigning}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                  required
                >
                  <option value="" disabled className="bg-zinc-900">Choose a workout...</option>
                  {workouts.length > 0 ? (
                    workouts.map(plan => (
                      <option key={plan.id} value={plan.id} className="bg-zinc-900">
                        {plan.name} ({plan.duration})
                      </option>
                    ))
                  ) : (
                    <option disabled className="bg-zinc-900">No templates found</option>
                  )}
                </select>
                {workouts.length === 0 && (
                  <p className="text-xs text-amber-400 mt-2">
                    You haven't created any workout templates yet.
                  </p>
                )}
              </div>

              {selectedPlanId && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-sm text-zinc-400">
                    {workouts.find(p => p.id === selectedPlanId)?.description}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isAssigning}
                  className="flex-1 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedPlanId || isAssigning}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg font-semibold flex items-center justify-center gap-2 hover:from-cyan-400 hover:to-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAssigning ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-white" />
                      <span className="text-white">Assigning...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span className="text-white">Assign Plan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SelectWorkoutModal;
