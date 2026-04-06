// src/pages/ManageClients.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users, Loader } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import ClientCard from '../components/ClientCard';
import { useTrainer } from '../context/TrainerContext';

export default function ManageClients() {
  const { clients, loading } = useTrainer();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGoal, setFilterGoal] = useState('All');

  // Ensure client objects have the expected fields for display
  const enrichedClients = clients.map(client => ({
    ...client,
    avatar: client.name?.[0] || 'U',
    goal: client.goal || 'Fitness Goal',
    progress: client.progress || 0,
    lastActive: client.lastActive || 'Recently',
    adherence: client.adherence || 85,
    workoutsThisWeek: client.workoutsThisWeek || 3,
    mealsLogged: client.mealsLogged || 70,
  }));

  const goals = ["All", "Muscle Gain", "Weight Loss", "Athletic Performance", "Maintenance"];

  const filteredClients = enrichedClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = filterGoal === "All" || client.goal === filterGoal;
    return matchesSearch && matchesGoal;
  });

  return (
    <DashboardLayout role="trainer">
      <div className="flex-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <Users className="w-7 h-7 text-cyan-400" />
              Manage Clients
            </h1>
            {loading ? (
              <div className="flex items-center gap-2 mt-1">
                <Loader className="w-4 h-4 animate-spin text-zinc-400" />
                <span className="text-zinc-400 text-sm">Loading clients...</span>
              </div>
            ) : (
              <p className="text-zinc-400 text-sm mt-1">
                {filteredClients.length} clients • {clients.filter(c => (c.adherence || 0) >= 80).length} highly engaged
              </p>
            )}
          </div>
        </motion.div>

        <Card>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clients..."
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-zinc-500" />
              <select
                value={filterGoal}
                onChange={(e) => setFilterGoal(e.target.value)}
                className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-all cursor-pointer"
              >
                {goals.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
             <div className="flex items-center justify-center p-12">
               <Loader className="w-8 h-8 animate-spin text-cyan-400" />
             </div>
          ) : filteredClients.length > 0 ? (
            filteredClients.map(client => (
              <ClientCard key={client.id} client={client} />
            ))
          ) : (
            <Card className="text-center py-12">
              <p className="text-zinc-400">No clients found matching your criteria.</p>
              <p className="text-xs text-zinc-500 mt-2">Check back after you're assigned new clients by an administrator.</p>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}