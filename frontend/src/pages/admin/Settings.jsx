import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Zap, Loader, UserPlus } from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import AddAdminModal from '../../components/Admin/AddAdminModal';
import { useAdmin } from '../../contexts/AdminContext';

const Settings = () => {
  const { settings, updateSettings, settingsLoading } = useAdmin();
  const [formData, setFormData] = useState(settings);
  const [saveStatus, setSaveStatus] = useState(null);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);

  // ✅ Sync formData when settings loads from API
  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        features: { ...prev.features, [name]: checked }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveStatus(null);
    try {
      await updateSettings(formData); // ✅ real API call
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    } finally {
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Settings</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setIsAddAdminOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl font-bold flex items-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Create Admin
            </button>
            <button
              onClick={handleSubmit}
              disabled={settingsLoading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl font-bold flex items-center gap-2 hover:from-cyan-400 hover:to-purple-400 transition-all disabled:opacity-50"
            >
              {settingsLoading
                ? <Loader className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              {settingsLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {saveStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 text-green-400 text-center"
          >
            Settings saved successfully!
          </motion.div>
        )}
        {saveStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-400 text-center"
          >
            Failed to save settings. Please try again.
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold">General</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">App Name</label>
                <input 
                  type="text" 
                  name="appName" 
                  value={formData.appName || ''}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400" 
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Support Email</label>
                <input 
                  type="email" 
                  name="supportEmail" 
                  value={formData.supportEmail || ''}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400" 
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Default Calorie Goal</label>
                <input 
                  type="number" 
                  name="defaultCalorieGoal" 
                  value={formData.defaultCalorieGoal || ''}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400" 
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-bold">Features</h2>
            </div>
            <div className="space-y-4">
              <FeatureToggle
                name="trainerPlanCreation"
                checked={formData.features?.trainerPlanCreation}
                onChange={handleChange}
                label="Trainer Plan Creation"
                description="Allow trainers to create and assign custom plans"
              />
              <FeatureToggle
                name="userLibrary"
                checked={formData.features?.userLibrary}
                onChange={handleChange}
                label="User Library"
                description="Enable library section for users"
              />
            </div>
          </Card>
        </div>
      </div>
      
      <AddAdminModal 
        isOpen={isAddAdminOpen}
        onClose={() => setIsAddAdminOpen(false)}
        onSuccess={() => {
          setIsAddAdminOpen(false);
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(null), 3000);
        }}
      />
    </DashboardLayout>
  );
};

// ✅ Extracted toggle component to keep JSX clean
function FeatureToggle({ name, checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          name={name} 
          checked={!!checked}
          onChange={onChange} 
          className="sr-only peer" 
        />
        <div className="w-11 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
      </label>
    </div>
  );
}

export default Settings;
