import React, { useState, useEffect, useMemo } from 'react';
import { useFitness } from '../context/FitnessContext';
import { useAuth } from '../context/AuthContext';           // ✅ new import
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, Play, Info, Calendar as CalendarIcon,
  Award, User, Plus, Dumbbell, SkipForward, CheckCircle2, X
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';                  // ✅ new import

/* ─── weekly schedule fallback ─── */
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const FALLBACK_SCHEDULE = [
  {
    day: 'Mon',
    focus: 'Chest',
    status: 'done',
    summary: 'Heavy compound pushing with short finishers.',
    exercises: ['Barbell bench press', 'Incline dumbbell press', 'Cable flyes'],
    note: 'Completed with strong control and full range of motion.',
  },
  {
    day: 'Tue',
    focus: 'Back',
    status: 'done',
    summary: 'Pull strength, lats, and posture focus.',
    exercises: ['Lat pulldown', 'Chest-supported row', 'Face pulls'],
    note: 'Keep scapular control on every rep.',
  },
  {
    day: 'Wed',
    focus: 'Rest',
    status: 'rest',
    summary: 'Recovery day for mobility and reset.',
    exercises: ['Light walking', 'Mobility flow', 'Breathing work'],
    note: 'Use this day to recover and prepare for the next block.',
  },
  {
    day: 'Thu',
    focus: 'Legs',
    status: 'today',
    summary: 'Main session of the week: squat pattern plus posterior chain.',
    exercises: ['Back squat', 'Romanian deadlift', 'Walking lunges'],
    note: 'Today is the highest-priority session.',
  },
  {
    day: 'Fri',
    focus: 'Shoulder',
    status: 'pending',
    summary: 'Shoulder volume with stable pressing and raises.',
    exercises: ['Seated overhead press', 'Lateral raises', 'Rear delt flyes'],
    note: 'Moderate load, high quality reps.',
  },
  {
    day: 'Sat',
    focus: 'Arms',
    status: 'pending',
    summary: 'Arm pump work with controlled tempo.',
    exercises: ['Barbell curls', 'Skull crushers', 'Cable pushdowns'],
    note: 'Use this day for accessory volume.',
  },
  {
    day: 'Sun',
    focus: 'Rest',
    status: 'rest',
    summary: 'Full rest and mental reset.',
    exercises: ['Optional stretch', 'Easy walk', 'Meal prep'],
    note: 'Focus on sleep and recovery.',
  },
];

const normalizeScheduleItem = (item, index) => ({
  date: item?.date || `fallback-${index}`,
  day: item?.day || WEEKDAY_LABELS[index] || 'Day',
  focus: item?.focus || item?.title || 'Rest',
  status: item?.status || 'pending',
  summary: item?.summary || 'Tap to view details.',
  note: item?.note || item?.title || 'No additional notes provided.',
  time: item?.time || null,
  type: item?.type || 'workout',
  title: item?.title || item?.focus || 'Session',
  exercises: Array.isArray(item?.exercises) ? item.exercises : [],
});

const INITIAL_EXERCISES = [];

const normalise = (exercises) =>
  exercises.map((ex, i) => ({
    ...ex,
    id: ex.id ? String(ex.id) : String(i + 1),
    setsData: ex.setsData || [],
  }));

/* ─── Skip Confirmation Modal ─── */
function SkipModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex justify-between items-start mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center">
            <SkipForward className="w-6 h-6 text-red-400" />
          </div>
          <button onClick={onCancel} className="p-1 hover:bg-zinc-800 rounded-lg">
            <X className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Skip Today's Workout?</h3>
        <p className="text-zinc-400 text-sm mb-5">
          This will mark today as skipped. Your streak may be affected. Are you sure?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-medium transition-colors"
          >
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 
                      text-red-400 rounded-xl text-sm font-bold transition-colors"
          >
            Yes, Skip
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, ChevronRight } from 'lucide-react';

/* ─── Workout Complete Banner ─── */
function CompleteBanner({ workoutName, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-8 p-6 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-transparent 
                border border-green-500/20 rounded-3xl relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-[50px] rounded-full -mr-10 -mt-10" />
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Workout Complete! 🎉</h3>
            <p className="text-zinc-400 text-sm">Great intensity today, {workoutName} logged.</p>
          </div>
        </div>

        {/* Synergy: Post-Workout Knowledge */}
        <div className="flex-1 max-w-sm">
          <Link 
            to="/user/article/why-standards-define-everything"
            className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/30 transition-all group/synergy"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                <Sparkles size={10} /> Pro Tip
              </p>
              <p className="text-xs font-bold text-white truncate">Why Standards Define Everything</p>
            </div>
            <ChevronRight size={16} className="text-zinc-600 group-hover/synergy:text-cyan-400 group-hover/synergy:translate-x-1 transition-all" />
          </Link>
        </div>

        <button onClick={onDismiss} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Skip Banner ─── */
function SkipBanner({ onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-6 p-4 bg-zinc-800/60 border border-zinc-700 rounded-2xl flex items-center justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center">
          <SkipForward className="w-5 h-5 text-zinc-400" />
        </div>
        <div>
          <p className="font-bold text-zinc-300">Workout Skipped</p>
          <p className="text-xs text-zinc-500">Rest well. Come back stronger tomorrow! 💪</p>
        </div>
      </div>
      <button onClick={onDismiss} className="p-1 hover:bg-zinc-700 rounded-lg">
        <X className="w-4 h-4 text-zinc-500" />
      </button>
    </motion.div>
  );
}

/* ─── Main Component ─── */
const Workouts = () => {
  const { addProgress, user } = useFitness();
  const { user: authUser } = useAuth();                         // ✅ get user ID

  const [exercises, setExercises] = useState(
    normalise(user?.assignedWorkout?.exercises || INITIAL_EXERCISES)
  );

  const [workoutStatus, setWorkoutStatus] = useState('idle'); // 'idle' | 'complete' | 'skipped'
  const [showSkipModal, setShowSkipModal] = useState(false);

  const weeklySchedule = useMemo(() => {
    if (Array.isArray(user?.weeklySchedule) && user.weeklySchedule.length) {
      return user.weeklySchedule.map(normalizeScheduleItem);
    }

    return FALLBACK_SCHEDULE;
  }, [user?.weeklySchedule]);

  const [selectedDay, setSelectedDay] = useState(null);

  /* ── sync if assignedWorkout changes ── */
  useEffect(() => {
    if (user?.assignedWorkout?.exercises) {
      setExercises(normalise(user.assignedWorkout.exercises));
    }
  }, [user?.assignedWorkout]);

  useEffect(() => {
    if (!weeklySchedule.length) return;

    setSelectedDay((current) => {
      if (!current) {
        return weeklySchedule.find((item) => item.status === 'today') || weeklySchedule[0];
      }

      return weeklySchedule.find((item) => item.date === current.date) || weeklySchedule[0];
    });
  }, [weeklySchedule]);

  const trainer      = user?.trainerName    || 'Trainer';
  const workoutName  = user?.assignedWorkout?.name  || 'Legs Day';
  const workoutFocus = user?.assignedWorkout?.focus || 'Strength & Power';

  /* ── Log a set with a weight prompt ── */
  const logSet = (id) => {
    const weight = window.prompt('Enter weight (kg):', '60');
    if (weight === null) return;
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id !== id || ex.setsData.length >= ex.sets) return ex;
        addProgress(2);
        return { ...ex, setsData: [...ex.setsData, { weight: parseFloat(weight) || 0, completed: true }] };
      })
    );
  };

  /* ── Mark workout complete — Persist to backend ── */
  const handleComplete = async () => {
    if (workoutStatus === 'idle') {
      try {
        const logData = {
          workout_id: user?.assignedWorkout?.id,
          workout_name: workoutName,
          exercises: exercises.map(ex => ({
            exercise_id: ex.id,
            exercise_name: ex.name,
            sets: ex.setsData.map(s => ({
              weight: s.weight,
              completed: s.completed
            }))
          }))
        };
        
        await userAPI.logWorkout(logData);
        addProgress(10);
        setWorkoutStatus('complete');
      } catch (error) {
        console.error('Failed to log workout session:', error);
        toast.error('Failed to save workout session. Progress was not updated.');
      }
    }
  };

  /* ── Skip today – now calls backend API ── */
  const handleSkipConfirm = async () => {
    try {
      await userAPI.skipWorkout(authUser.id);           // ✅ API call to record skip
      setShowSkipModal(false);
      setWorkoutStatus('skipped');
      setExercises(normalise(user?.assignedWorkout?.exercises || INITIAL_EXERCISES));
    } catch (error) {
      console.error('Failed to skip workout:', error);
      toast.error('Could not skip workout. Please try again.');
    }
  };

  /* ── Button states ── */
  const isComplete = workoutStatus === 'complete';
  const isSkipped  = workoutStatus === 'skipped';
  const isIdle     = workoutStatus === 'idle';

  /* ── Derived: all sets done? ── */
  const allExercisesDone = exercises.every((ex) => ex.setsData.length >= ex.sets);

  const scheduleDescription = selectedDay?.summary || 'Tap a day to see workout details.';

  return (
    <DashboardLayout role="user">
      <div className="flex-1 space-y-8 pb-10">

        {/* ── Header Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Award className="text-cyan-400 w-8 h-8" />
              My Workout Program
            </h1>
            <div className="flex items-center gap-2 mt-2 text-zinc-400">
              <User className="w-4 h-4" />
              <span className="text-sm">
                Assigned by: <span className="text-white font-bold">{trainer}</span>
              </span>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        </motion.div>

        {/* ── Status Banners ── */}
        <AnimatePresence>
          {isComplete && (
            <CompleteBanner
              workoutName={workoutName}
              onDismiss={() => setWorkoutStatus('idle')}
            />
          )}
          {isSkipped && (
            <SkipBanner onDismiss={() => setWorkoutStatus('idle')} />
          )}
        </AnimatePresence>

        {/* ── Weekly Schedule ── */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-purple-400" />
              This Week's Schedule
            </h2>
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest bg-cyan-400/10 px-3 py-1 rounded-full border border-cyan-400/20">
              Tap to View
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {weeklySchedule.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedDay(item)}
                className={`glass p-4 text-center border transition-all text-left ${
                  item.status === 'today'
                    ? 'border-cyan-400/50 bg-cyan-400/5 shadow-[0_0_20px_rgba(34,211,238,0.1)]'
                    : item.status === 'done'
                    ? 'border-green-400/20 opacity-60'
                    : 'border-white/5 opacity-40'
                }`}
              >
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">
                  {item.day}
                </p>
                  <p className={`text-sm font-bold ${item.status === 'today' ? 'text-cyan-400' : 'text-zinc-300'}`}>
                  {item.focus}
                </p>
                <p className="mt-2 text-[10px] text-zinc-500 leading-relaxed min-h-[2rem]">
                  {item.summary}
                </p>
                <div className="mt-2 flex justify-center">
                  {item.status === 'done'    && <Check className="w-4 h-4 text-green-400" />}
                  {item.status === 'today'   && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                  {item.status === 'rest'    && <div className="text-[10px] text-zinc-600">—</div>}
                  {item.status === 'pending' && <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Selected day</p>
                  <h3 className="text-lg font-bold text-white mt-1">
                  {selectedDay?.day} - {selectedDay?.focus}
                </h3>
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${
                selectedDay?.status === 'today' ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300' :
                selectedDay?.status === 'done' ? 'border-green-400/20 bg-green-400/10 text-green-300' :
                selectedDay?.status === 'rest' ? 'border-zinc-700 bg-zinc-800/60 text-zinc-400' :
                'border-white/10 bg-white/5 text-zinc-300'
              }`}>
                {selectedDay?.status}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{scheduleDescription}</p>
          </div>
        </section>

        {/* ── Today's Workout ── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* Title + Action Buttons */}
            <div className="flex justify-between items-end flex-wrap gap-3">
              <div>
                <h2 className="text-2xl font-black text-white">
                  🔥 Today: {workoutName}
                </h2>
                <p className="text-zinc-500 text-sm">Target: {workoutFocus}</p>
              </div>

              <div className="flex gap-2">
                {/* ── Skip Today Button ── */}
                <button
                  onClick={() => {
                    if (!isSkipped && !isComplete) setShowSkipModal(true);
                  }}
                  disabled={isSkipped || isComplete}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider 
                              border transition-all
                              ${isSkipped
                                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-50'
                                : isComplete
                                ? 'opacity-0 pointer-events-none'
                                : 'bg-white/5 border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                              }`}
                >
                  {isSkipped ? 'Skipped' : 'Skip Today'}
                </button>

                {/* ── Mark Complete Button ── */}
                <button
                  onClick={handleComplete}
                  disabled={isComplete || isSkipped}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider 
                              transition-all flex items-center gap-2
                              ${isComplete
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-not-allowed'
                                : isSkipped
                                ? 'opacity-0 pointer-events-none'
                                : allExercisesDone
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:from-green-400 hover:to-emerald-400'
                                : 'bg-white/10 border border-white/20 hover:bg-white/20 text-white'
                              }`}
                >
                  {isComplete ? (
                    <><Check className="w-4 h-4" /> Logged ✓</>
                  ) : (
                    <>
                      {allExercisesDone && <Check className="w-4 h-4" />}
                      Mark Complete
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* ── Progress note when all sets done ── */}
            {allExercisesDone && isIdle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                <p className="text-green-400 text-sm font-medium">
                  All sets logged! Click <strong>Mark Complete</strong> to save your workout.
                </p>
              </motion.div>
            )}

            {/* ── Exercise Cards ── */}
            <div className="space-y-4">
              {exercises.map((ex) => {
                const done = ex.setsData.length >= ex.sets;
                return (
                  <Card
                    key={ex.id}
                    className={`group border-transparent hover:border-cyan-400/20 transition-all
                                ${done ? 'opacity-70' : ''}`}
                  >
                    <div className="flex flex-col gap-5">

                      {/* Exercise header */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${done ? 'bg-green-500/20' : 'bg-gradient-to-br from-cyan-400 to-blue-500'}`}>
                            {done
                              ? <Check className="w-4 h-4 text-green-400" />
                              : <Play  className="w-4 h-4 text-white fill-white" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{ex.name}</h3>
                            <p className="text-zinc-500 text-xs">
                              {ex.sets} sets × {ex.reps} reps
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-zinc-600 bg-white/5 px-2 py-0.5 rounded uppercase tracking-tighter">
                          {ex.setsData.length}/{ex.sets} done
                        </span>
                      </div>

                      {/* Progress bars */}
                      <div className="flex gap-1">
                        {[...Array(ex.sets)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all duration-700 ${
                              i < ex.setsData.length
                                ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.4)]'
                                : 'bg-white/5'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Set tags + log button */}
                      <div className="flex flex-wrap gap-2">
                        {ex.setsData.map((set, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-xl"
                          >
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-xs font-bold text-green-400">
                              Set {i + 1}: {set.weight}kg
                            </span>
                          </div>
                        ))}

                        {ex.setsData.length < ex.sets && !isComplete && !isSkipped && (
                          <button
                            onClick={() => logSet(ex.id)}
                            className="flex items-center gap-2 bg-white/5 border border-white/10
                                      hover:border-cyan-400/50 hover:bg-cyan-400/10
                                      px-4 py-1.5 rounded-xl transition-all"
                          >
                            <Plus className="w-3 h-3 text-cyan-400" />
                            <span className="text-xs font-bold text-zinc-300">
                              Log Set {ex.setsData.length + 1}
                            </span>
                          </button>
                        )}

                        {(isComplete || isSkipped) && ex.setsData.length < ex.sets && (
                          <span className="text-xs text-zinc-600 italic px-1">
                            {isSkipped ? 'Skipped' : 'Workout complete'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" />
                Trainer's Note
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                {user?.assignedWorkout?.note || "No specific notes for today's session. Keep pushing!"}
              </p>
              <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-3 text-xs">
                <div className="w-8 h-8 rounded-full bg-white/10" />
                <span className="text-zinc-500 italic">— {trainer}</span>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-bold mb-4 uppercase tracking-tighter">
                📊 Workout History
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Week 1', val: '4/5', status: 'done'    },
                  { label: 'Week 2', val: '5/5', status: 'done'    },
                  { label: 'Week 3', val: '3/5', status: 'current' },
                ].map((week, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-white/2">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">{week.label}</p>
                      <p className="font-bold text-sm text-white">
                        {week.val}{' '}
                        <span className="text-zinc-500 font-normal">Workouts</span>
                      </p>
                    </div>
                    {week.status === 'done'
                      ? <Check className="w-4 h-4 text-green-400" />
                      : <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>

      {/* ── Skip Modal ── */}
      <AnimatePresence>
        {showSkipModal && (
          <SkipModal
            onConfirm={handleSkipConfirm}
            onCancel={() => setShowSkipModal(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedDay && (
          <motion.div
            key={selectedDay.day}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedDay(null)}
          >
            <motion.div
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 24, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#07111f] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-300 font-black">Weekly Detail</p>
                  <h3 className="text-2xl font-black mt-2">{selectedDay.day} - {selectedDay.focus}</h3>
                  <p className="text-sm text-zinc-400 mt-2">{selectedDay.summary}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-3">What it means</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">{selectedDay.note}</p>

                  <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mt-6 mb-3">Exercises</h4>
                  <div className="space-y-2">
                    {selectedDay.exercises.length ? selectedDay.exercises.map((exercise) => (
                      <div key={exercise} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <Dumbbell className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-sm text-white">{exercise}</span>
                      </div>
                    )) : (
                      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-400">
                        No exercise list attached to this session yet.
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Status</p>
                    <p className="text-lg font-bold mt-2 capitalize text-white">{selectedDay.status}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Action</p>
                    <p className="text-sm text-zinc-300 mt-2">
                      Use this panel to preview the current week from your backend dashboard data.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <p className="text-[10px] uppercase tracking-widest text-cyan-300 font-bold">Best first addition</p>
                    <p className="text-sm text-cyan-50 mt-2">
                      Next, add a “Mark as complete” action once the backend exposes session completion state.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default Workouts;