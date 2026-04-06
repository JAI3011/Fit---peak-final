import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, Save, X, Search, ArrowLeft, Loader } from "lucide-react";
import { useTrainer } from "../context/TrainerContext";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";

export default function CreateWorkout() {
  const navigate = useNavigate();
  const { addWorkout } = useTrainer();
  const [workoutName, setWorkoutName] = useState("");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [exercises, setExercises] = useState([]);
  const [errors, setErrors] = useState({ workoutName: "", exercises: [] });
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Exercise library
  const exerciseLibrary = [
    { id: '1', name: "Squats", category: "Legs", equipment: "Barbell" },
    { id: '2', name: "Bench Press", category: "Chest", equipment: "Barbell" },
    { id: '3', name: "Deadlift", category: "Back", equipment: "Barbell" },
    { id: '4', name: "Overhead Press", category: "Shoulders", equipment: "Barbell" },
    { id: '5', name: "Barbell Row", category: "Back", equipment: "Barbell" },
    { id: '6', name: "Pull-ups", category: "Back", equipment: "Bodyweight" },
    { id: '7', name: "Dips", category: "Chest", equipment: "Bodyweight" },
    { id: '8', name: "Leg Press", category: "Legs", equipment: "Machine" },
    { id: '9', name: "Lat Pulldown", category: "Back", equipment: "Machine" },
    { id: '10', name: "Bicep Curls", category: "Arms", equipment: "Dumbbell" }
  ];

  const filteredExercises = exerciseLibrary.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const validateField = (name, value, index = null) => {
    if (name === 'workoutName') {
      if (!value) return "Workout name is required";
      if (value.length < 3) return "Name must be at least 3 characters";
    }
    
    if (name === 'exercise') {
      const eErrors = {};
      if (!value.sets || value.sets < 1) eErrors.sets = "Min 1 set";
      if (!value.reps || value.reps < 1) eErrors.reps = "Min 1 rep";
      if (!value.rest || value.rest < 0) eErrors.rest = "Invalid rest";
      return Object.keys(eErrors).length > 0 ? eErrors : null;
    }

    return "";
  };

  const addExercise = (exercise) => {
    const newEx = {
      ...exercise,
      sets: 3,
      reps: 12,
      rest: 60
    };
    setExercises([...exercises, newEx]);
    setErrors(prev => ({
      ...prev,
      exercises: [...prev.exercises, null]
    }));
    setShowExerciseLibrary(false);
    setSearchQuery("");
  };

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
    setErrors(prev => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index)
    }));
  };

  const updateExercise = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);

    // Validate specific exercise
    const exError = validateField('exercise', updated[index]);
    const newExErrors = [...errors.exercises];
    newExErrors[index] = exError;
    setErrors(prev => ({ ...prev, exercises: newExErrors }));
  };

  const validateForm = () => {
    const nameError = validateField('workoutName', workoutName);
    const exErrors = exercises.map(ex => validateField('exercise', ex));
    
    setErrors({
      workoutName: nameError,
      exercises: exErrors
    });

    const hasExErrors = exErrors.some(e => e !== null);
    return !nameError && !hasExErrors && exercises.length > 0;
  };

  const saveWorkout = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const workout = {
        name: workoutName,
        day: selectedDay,
        exercises: exercises,
        createdAt: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await addWorkout(workout);
      
      // Clear form
      setWorkoutName("");
      setExercises([]);
      setErrors({ workoutName: "", exercises: [] });
      
      navigate("/trainer/dashboard");
    } catch (error) {
      console.error("Failed to save workout:", error);
      setIsSaving(false);
    }
  };

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
            <h1 className="text-2xl font-semibold">Create Workout Program</h1>
            <p className="text-zinc-400 text-sm mt-1">
              Design a custom workout plan for your client
            </p>
          </div>
        </motion.div>

        {/* WORKOUT DETAILS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
          <Card>
            <label className="block text-sm text-zinc-400 mb-2">Workout Name</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => {
                setWorkoutName(e.target.value);
                setErrors(prev => ({ ...prev, workoutName: validateField('workoutName', e.target.value) }));
              }}
              disabled={isSaving}
              placeholder="e.g., Chest + Triceps Day"
              className={`w-full bg-zinc-800 border ${errors.workoutName ? 'border-red-400/50' : 'border-zinc-700'} rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 disabled:opacity-50`}
            />
            {errors.workoutName && <p className="text-red-400 text-xs mt-1">{errors.workoutName}</p>}
          </Card>

          <Card>
            <label className="block text-sm text-zinc-400 mb-2">Select Day</label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              disabled={isSaving}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 cursor-pointer disabled:opacity-50"
            >
              {days.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </Card>
        </div>

        {/* EXERCISES */}
        <Card className="text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Exercises ({exercises.length})</h2>
            <button
              onClick={() => setShowExerciseLibrary(true)}
              disabled={isSaving}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
          </div>

          {exercises.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-lg">
              <p className="text-zinc-400 mb-4">No exercises added yet</p>
              <button
                onClick={() => setShowExerciseLibrary(true)}
                disabled={isSaving}
                className="text-cyan-400 hover:underline disabled:no-underline disabled:opacity-50"
              >
                Add your first exercise
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={index}>
                  <ExerciseCard
                    exercise={exercise}
                    index={index}
                    errors={errors.exercises[index]}
                    onUpdate={updateExercise}
                    onRemove={removeExercise}
                    disabled={isSaving}
                  />
                </div>
              ))}
            </div>
          )}
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
            onClick={saveWorkout}
            disabled={isSaving || exercises.length === 0}
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
                <span className="text-white">Save Workout</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* EXERCISE LIBRARY MODAL */}
      <AnimatePresence>
        {showExerciseLibrary && (
          <ExerciseLibraryModal
            exercises={filteredExercises}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelect={addExercise}
            onClose={() => {
              setShowExerciseLibrary(false);
              setSearchQuery("");
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

// EXERCISE CARD
function ExerciseCard({ exercise, index, onUpdate, onRemove, disabled, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 bg-zinc-800/50 rounded-lg border ${errors ? 'border-red-400/30' : 'border-zinc-800'} ${disabled ? 'opacity-70 pointer-events-none' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white">{exercise.name}</h3>
          <p className="text-xs text-zinc-500">{exercise.category} • {exercise.equipment}</p>
        </div>
        {!disabled && (
          <button
            onClick={() => onRemove(index)}
            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group"
          >
            <Trash2 className="w-4 h-4 text-red-500/50 group-hover:text-red-400" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Sets</label>
          <input
            type="number"
            value={exercise.sets}
            disabled={disabled}
            onChange={(e) => onUpdate(index, "sets", parseInt(e.target.value) || 0)}
            className={`w-full bg-zinc-900 border ${errors?.sets ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400`}
          />
          {errors?.sets && <p className="text-red-400 text-[10px]">{errors.sets}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Reps</label>
          <input
            type="number"
            value={exercise.reps}
            disabled={disabled}
            onChange={(e) => onUpdate(index, "reps", parseInt(e.target.value) || 0)}
            className={`w-full bg-zinc-900 border ${errors?.reps ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400`}
          />
          {errors?.reps && <p className="text-red-400 text-[10px]">{errors.reps}</p>}
        </div>
        <div className="space-y-1">
          <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Rest (sec)</label>
          <input
            type="number"
            value={exercise.rest}
            disabled={disabled}
            onChange={(e) => onUpdate(index, "rest", parseInt(e.target.value) || 0)}
            className={`w-full bg-zinc-900 border ${errors?.rest ? 'border-red-400/50' : 'border-zinc-700'} rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-400`}
          />
          {errors?.rest && <p className="text-red-400 text-[10px]">{errors.rest}</p>}
        </div>
      </div>
    </motion.div>
  );
}

// EXERCISE LIBRARY MODAL
function ExerciseLibraryModal({ exercises, searchQuery, setSearchQuery, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[80vh] flex flex-col text-white"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold">Exercise Library</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
              autoFocus
            />
          </div>
        </div>

        {/* Exercise List */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
          <div className="grid grid-cols-1 gap-2">
            {exercises.map(exercise => (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise)}
                className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/30 rounded-lg text-left transition-all"
              >
                <h3 className="font-semibold">{exercise.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  {exercise.category} • {exercise.equipment}
                </p>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}