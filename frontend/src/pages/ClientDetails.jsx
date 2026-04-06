import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Dumbbell, Utensils, ClipboardList, TrendingUp, Target, Users, Loader } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import SelectWorkoutModal from '../components/Trainer/SelectWorkoutModal';
import SelectDietModal from '../components/Trainer/SelectDietModal';
import ClientProgressChart from '../components/ClientProgressChart';
import { useTrainer } from '../context/TrainerContext'; // ✅ use TrainerContext
import api from '../services/api';

export default function ClientDetails() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { clients, assignWorkoutToClient, assignDietToClient } = useTrainer(); // ✅ trainer actions

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [assignMsg, setAssignMsg] = useState(null);

  // ✅ Fetch client directly from backend
  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${clientId}`);
        setClient(res.data);
      } catch (err) {
        console.error('Failed to fetch client:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  // ✅ Use trainer API endpoint to assign workout
  const handleAssignWorkout = async (planData) => {
    try {
      await assignWorkoutToClient(clientId, planData.id);
      // Refresh client data after assignment
      const res = await api.get(`/users/${clientId}`);
      setClient(res.data);
      setAssignMsg({ type: 'success', text: `Workout "${planData.name}" assigned!` });
      setTimeout(() => setAssignMsg(null), 3000);
    } catch (err) {
      setAssignMsg({ type: 'error', text: 'Failed to assign workout.' });
    }
  };

  // ✅ Use trainer API endpoint to assign diet
  const handleAssignDiet = async (planData) => {
    try {
      await assignDietToClient(clientId, planData.id);
      const res = await api.get(`/users/${clientId}`);
      setClient(res.data);
      setAssignMsg({ type: 'success', text: `Diet plan "${planData.name}" assigned!` });
      setTimeout(() => setAssignMsg(null), 3000);
    } catch (err) {
      setAssignMsg({ type: 'error', text: 'Failed to assign diet plan.' });
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="trainer">
        <div className="flex items-center justify-center p-12">
          <Loader className="w-8 h-8 animate-spin text-cyan-400" />
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout role="trainer">
        <div className="text-center py-12 text-zinc-400">Client not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="trainer">
      <div className="space-y-6">

        <button
          onClick={() => navigate('/trainer/clients')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Clients
        </button>

        {/* ✅ Assignment status message */}
        {assignMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl text-sm ${
              assignMsg.type === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {assignMsg.text}
          </motion.div>
        )}

        <Card className="relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-3xl font-black shadow-lg shadow-cyan-500/20">
                {client.name?.[0]}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-1">{client.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm mt-2">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <Target className="w-4 h-4 text-cyan-400" />
                    {client.goal || 'Fitness Goal'}
                  </span>
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                    {client.overallProgress || 0}% Progress
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Workout Plan */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-cyan-400" />
                Current Workout Plan
              </h3>
              <button
                onClick={() => setIsWorkoutModalOpen(true)}
                className="px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/30 rounded-lg text-cyan-400 text-sm font-medium hover:bg-cyan-400/20 transition-colors"
              >
                Assign New
              </button>
            </div>
            {client.assignedWorkout ? (
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="font-bold text-white">{client.assignedWorkout.name}</p>
                <p className="text-sm text-zinc-400 mt-1">{client.assignedWorkout.description}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Duration: {client.assignedWorkout.duration}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500">No workout plan assigned yet.</div>
            )}
          </Card>

          {/* Diet Plan */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Utensils className="w-5 h-5 text-purple-400" />
                Current Diet Plan
              </h3>
              <button
                onClick={() => setIsDietModalOpen(true)}
                className="px-3 py-1.5 bg-purple-400/10 border border-purple-400/30 rounded-lg text-purple-400 text-sm font-medium hover:bg-purple-400/20 transition-colors"
              >
                Assign New
              </button>
            </div>
            {client.assignedDiet ? (
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="font-bold text-white">{client.assignedDiet.name}</p>
                <p className="text-sm text-zinc-400 mt-1">{client.assignedDiet.description}</p>
                <p className="text-xs text-zinc-500 mt-2">
                  Duration: {client.assignedDiet.duration}
                </p>
              </div>
            ) : (
              <div className="text-center py-6 text-zinc-500">No diet plan assigned yet.</div>
            )}
          </Card>
        </div>

        {/* Progress */}
        <Card>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Progress Overview
          </h3>
          <ClientProgressChart 
            data={client.progressData || []} 
            metric="weight" 
            color="#22d3ee" 
          />
        </Card>

        <SelectWorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          onAssign={handleAssignWorkout}
        />
        <SelectDietModal
          isOpen={isDietModalOpen}
          onClose={() => setIsDietModalOpen(false)}
          onAssign={handleAssignDiet}
        />
      </div>
    </DashboardLayout>
  );
}