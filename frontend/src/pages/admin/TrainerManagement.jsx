import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Check, X, Eye, Users, Award, Briefcase, UserPlus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import TrainerDetailModal from '../../components/Admin/TrainerDetailModal';
import AddTrainerModal from '../../components/Admin/AddTrainerModal';
import { useAdmin } from '../../contexts/AdminContext';

const TrainerManagement = () => {
  const { trainers, approveTrainer, rejectTrainer, updateUser, addUser } = useAdmin();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredTrainers = trainers.filter(trainer => {
    const matchesSearch = trainer.name.toLowerCase().includes(search.toLowerCase()) ||
                          trainer.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trainer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (trainer) => {
    setSelectedTrainer(trainer);
    setIsModalOpen(true);
  };

  const handleApprove = (trainerId) => {
    return approveTrainer(trainerId);
  };

  const handleReject = (trainerId) => {
    return rejectTrainer(trainerId);
  };

  const handleAddTrainer = (newTrainer) => {
    return addUser(newTrainer);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">Trainer Management</h1>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search trainers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg text-white font-bold flex items-center gap-2 hover:from-cyan-400 hover:to-purple-400 transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Add Trainer</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTrainers.map((trainer) => (
            <Card key={trainer.id} className="relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4">
                {trainer.status === 'pending' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleApprove(trainer.id)}
                      className="p-1.5 bg-green-500/20 rounded-lg hover:bg-green-500/40 transition-colors"
                      title="Approve"
                    >
                      <Check className="w-4 h-4 text-green-400" />
                    </button>
                    <button
                      onClick={() => handleReject(trainer.id)}
                      className="p-1.5 bg-red-500/20 rounded-lg hover:bg-red-500/40 transition-colors"
                      title="Reject"
                    >
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xl font-bold">
                  {trainer.name[0]}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-white">{trainer.name}</h3>
                  <p className="text-xs text-zinc-500">{trainer.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      trainer.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      trainer.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {trainer.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-purple-400" />
                  <span className="text-zinc-400">{trainer.certification || 'No certification'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-cyan-400" />
                  <span className="text-zinc-400">{trainer.experience || 'N/A'} experience</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-green-400" />
                  <span className="text-zinc-400">{trainer.clientCount || 0} clients</span>
                </div>
              </div>

              <button
                onClick={() => handleViewDetails(trainer)}
                className="w-full py-2.5 rounded-xl border border-white/10 text-white text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
            </Card>
          ))}
        </div>

        <TrainerDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          trainer={selectedTrainer}
        />

        <AddTrainerModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddTrainer}
        />
      </div>
    </DashboardLayout>
  );
};

export default TrainerManagement;