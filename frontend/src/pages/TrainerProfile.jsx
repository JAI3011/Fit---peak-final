import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Bell, Globe, Save, Loader } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function TrainerProfile() {
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    specialization: "Strength Training",
    certifications: "",
    experience: ""
  });

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: ""
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    clientMessages: true,
    workoutReminders: false,
    weeklyReports: true
  });

  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);   // { type: 'success'|'error', text }
  const [passwordMsg, setPasswordMsg] = useState(null);

  // ✅ Load real user data from authUser on mount
  useEffect(() => {
    if (authUser) {
      setProfile({
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        bio: authUser.bio || "",
        specialization: authUser.specialization || "Strength Training",
        certifications: authUser.certification || "",
        experience: authUser.experience || ""
      });
    }
  }, [authUser]);

  // ✅ Real API call to update profile
  const handleProfileUpdate = async () => {
    if (!authUser?.id) return;
    setSaving(true);
    setProfileMsg(null);
    try {
      await api.put(`/users/${authUser.id}`, {
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        specialization: profile.specialization,
        certification: profile.certifications,
        experience: profile.experience,
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile.'
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Real password change via API
  const handlePasswordUpdate = async () => {
    if (!passwords.newPass || !passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }
    if (passwords.newPass !== passwords.confirm) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.newPass.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    setSavingPassword(true);
    setPasswordMsg(null);
    try {
      await api.put(`/users/${authUser.id}/change-password`, {
        current_password: passwords.current,
        new_password: passwords.newPass,
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
      setPasswords({ current: '', newPass: '', confirm: '' });
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update password.'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <DashboardLayout role="trainer">
      <div className="flex-1 space-y-6">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-semibold">Profile & Settings</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your account and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">

            {/* BASIC INFO */}
            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-cyan-400" />
                Basic Information
              </h2>

              {/* ✅ Status message */}
              {profileMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  profileMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {profileMsg.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="email"
                        value={profile.email}
                        disabled  // ✅ Email changes should go via a separate verified flow
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-zinc-600 mt-1">Contact admin to change email</p>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 resize-none"
                  />
                </div>
              </div>

              <button
                onClick={handleProfileUpdate}
                disabled={saving}
                className="mt-4 w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </Card>

            {/* PROFESSIONAL INFO */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Professional Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Specialization</label>
                  <select
                    value={profile.specialization}
                    onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option>Strength Training</option>
                    <option>Weight Loss</option>
                    <option>Athletic Performance</option>
                    <option>Bodybuilding</option>
                    <option>CrossFit</option>
                    <option>Yoga</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Certifications</label>
                  <input
                    type="text"
                    value={profile.certifications}
                    onChange={(e) => setProfile({ ...profile, certifications: e.target.value })}
                    placeholder="e.g., NASM-CPT, ACE"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Years of Experience</label>
                  <input
                    type="text"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </Card>

            {/* CHANGE PASSWORD */}
            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-cyan-400" />
                Change Password
              </h2>

              {passwordMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  passwordMsg.type === 'success'
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  {passwordMsg.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Current Password</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">New Password</label>
                  <input
                    type="password"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <button
                onClick={handlePasswordUpdate}
                disabled={savingPassword}
                className="mt-4 w-full md:w-auto px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {savingPassword ? <Loader className="w-4 h-4 animate-spin" /> : null}
                {savingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </Card>
          </div>

          {/* RIGHT COLUMN — notifications unchanged, kept as-is */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-cyan-400" />
                Notification Settings
              </h2>
              <div className="space-y-4">
                {Object.entries(notifications).map(([key, val]) => (
                  <NotificationToggle
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    enabled={val}
                    onChange={(v) => setNotifications({ ...notifications, [key]: v })}
                  />
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Language & Region
              </h2>
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Language</label>
                <select className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none">
                  <option>English (US)</option>
                  <option>Hindi</option>
                  <option>Spanish</option>
                </select>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function NotificationToggle({ label, enabled, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-zinc-300">{label}</span>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-cyan-500' : 'bg-zinc-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}