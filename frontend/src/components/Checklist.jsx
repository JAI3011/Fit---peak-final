import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Flag, Tag, User } from 'lucide-react';
import { taskAPI } from '../services/api';

const Checklist = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assignmentSource, setAssignmentSource] = useState(null);
  const [missionDate, setMissionDate] = useState(null);

  useEffect(() => {
    taskAPI.getToday()
      .then(res => {
        setTasks(res.data.tasks || []);
        setAssignmentSource(res.data.assignmentSource || null);
        setMissionDate(res.data.date || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleTask = async (id) => {
    try {
      await taskAPI.toggle(id);
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const totalCount = tasks.length;
  const formattedMissionDate = missionDate
    ? new Date(`${missionDate}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : null;

  if (loading) return <div className="text-center py-4 text-zinc-500">Loading tasks...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider font-bold">
        <span>{completedCount}/{totalCount} completed</span>
        <div className="flex items-center gap-2">
          {formattedMissionDate && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
              mission date {formattedMissionDate}
            </span>
          )}
          {assignmentSource === 'trainer' && (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
              <User className="w-3 h-3" />
              assigned by trainer
            </span>
          )}
          <span>Tap a mission to toggle it</span>
        </div>
      </div>

      {tasks.map((task) => (
        <motion.div
          key={task.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.01 }}
          onClick={() => toggleTask(task.id)}
          className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
            task.completed
              ? 'bg-cyan-400/10 border border-cyan-400/30'
              : 'glass-panel border-cyan-400/20 shadow-[0_4px_20px_rgba(34,211,238,0.05)]'
          }`}
          style={task.completed ? { animation: 'pulse-cyan 2s infinite' } : {}}
        >
          <motion.div
            layout
            className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
              task.completed 
                ? 'bg-cyan-400 border-cyan-400' 
                : 'border-gray-500 bg-transparent'
            }`}
          >
            {task.completed && <Check className="w-4 h-4 text-darkBg" />}
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <span className={`text-sm font-medium transition-all ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-200'
              }`}>
                {task.text}
              </span>

              {task.priority && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                  task.priority === 'high'
                    ? 'bg-red-500/10 text-red-300 border-red-500/20'
                    : task.priority === 'medium'
                      ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                }`}>
                  <Flag className="w-3 h-3" />
                  {task.priority}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {task.category && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-zinc-400">
                  <Tag className="w-3 h-3" />
                  {task.category}
                </span>
              )}
              {task.completed && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-cyan-400/10 border border-cyan-400/20 text-cyan-300">
                  <Check className="w-3 h-3" />
                  done
                </span>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Checklist;
