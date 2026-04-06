import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Activity, TrendingUp, Award, Calendar,
  Target, Loader, X, Check, ChevronLeft, ChevronRight,
  Clock, Dumbbell, Utensils, Plus, Trash2
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/Card";
import ClientCard from "../components/ClientCard";
import { useTrainer } from "../context/TrainerContext";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────
  Schedule Modal
───────────────────────────────────────── */
const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS = Array.from({ length: 13 }, (_, i) => `${(6 + i).toString().padStart(2,'0')}:00`);
const COLORS = [
  "bg-cyan-500/20 border-cyan-500/40 text-cyan-300",
  "bg-purple-500/20 border-purple-500/40 text-purple-300",
  "bg-green-500/20 border-green-500/40 text-green-300",
  "bg-orange-500/20 border-orange-500/40 text-orange-300",
  "bg-pink-500/20 border-pink-500/40 text-pink-300",
];

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MISSION_CATEGORY_OPTIONS = ["workout", "nutrition", "recovery", "tracking", "custom"];
const MISSION_PRIORITY_OPTIONS = ["low", "medium", "high"];
const DEFAULT_MISSIONS = [
  { text: "Complete your assigned workout with full focus", category: "workout", priority: "high" },
  { text: "Follow your meal plan and stay hydrated", category: "nutrition", priority: "medium" },
  { text: "Do 10 minutes of cooldown or mobility work", category: "recovery", priority: "medium" },
];

const getDayName = (date) =>
  date.toLocaleDateString("en-US", { weekday: "long" });

const formatShortDate = (date) =>
  date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatDayDate = (date) =>
  date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const getWeekDates = (weekOffset = 0) => {
  const today = new Date();
  const mondayStart = new Date(today);
  const currentDay = today.getDay();
  const deltaToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  mondayStart.setDate(today.getDate() + deltaToMonday + weekOffset * 7);
  return DAY_NAMES.map((_, index) => {
    const date = new Date(mondayStart);
    date.setDate(mondayStart.getDate() + index);
    return date;
  });
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const mapSessionToEvent = (session) => {
  const sessionDate = new Date(`${session.date}T00:00:00`);
  const day = getDayName(sessionDate);
  const dayIndex = DAY_NAMES.indexOf(day);
  return {
    id: session.id,
    day,
    date: session.date,
    time: session.time,
    title: session.title,
    type: session.type,
    readableDate: formatDayDate(sessionDate),
    color: Math.max(0, dayIndex) % COLORS.length,
  };
};

function ScheduleModal({ onClose }) {
  const [weekOffset, setWeekOffset]   = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent]       = useState({
    day: "Monday", time: "09:00", title: "", type: "workout"
  });
  const [addError, setAddError]       = useState("");
  const [saving, setSaving] = useState(false);
  const { sessions, sessionsLoading, sessionsError, fetchSessions, createSession, deleteSession } = useTrainer();

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const normalizedSessions = useMemo(
    () => sessions.map((session) => mapSessionToEvent(session)),
    [sessions]
  );

  useEffect(() => {
    fetchSessions(
      formatDateKey(weekDates[0]),
      formatDateKey(weekDates[6])
    );
  }, [fetchSessions, weekDates]);

  const isToday = (date) =>
    date.toDateString() === new Date().toDateString();

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) { setAddError("Title is required"); return; }
    const selectedDate = weekDates.find((date) => getDayName(date) === newEvent.day);
    if (!selectedDate) {
      setAddError("Could not resolve the selected day.");
      return;
    }

    setSaving(true);
    setAddError("");
    try {
      await createSession({
        title: newEvent.title.trim(),
        date: formatDateKey(selectedDate),
        time: newEvent.time,
        type: newEvent.type,
      });
      setNewEvent({ day: "Monday", time: "09:00", title: "", type: "workout" });
      setShowAddForm(false);
    } catch (err) {
      console.error("Failed to create session:", err);
      setAddError(err.response?.data?.detail || "Failed to add session.");
    } finally {
      setSaving(false);
    }
  };

  const removeEvent = async (id) => {
    try {
      await deleteSession(id);
    } catch (err) {
      console.error("Failed to delete session:", err);
      setAddError(err.response?.data?.detail || "Failed to delete session.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl 
                  max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Weekly Schedule</h2>
              <p className="text-xs text-zinc-500">Manage your client sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Week nav */}
            <div className="flex items-center gap-2 bg-zinc-800 rounded-xl px-3 py-1.5">
              <button
                onClick={() => setWeekOffset((o) => o - 1)}
                className="p-1 hover:text-cyan-400 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-zinc-300 min-w-[100px] text-center">
                {weekDates[0].toLocaleDateString('en-US',{month:'short',day:'numeric'})} –{' '}
                {weekDates[6].toLocaleDateString('en-US',{month:'short',day:'numeric'})}
              </span>
              <button
                onClick={() => setWeekOffset((o) => o + 1)}
                className="p-1 hover:text-cyan-400 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
                onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 
                        border border-cyan-500/30 text-cyan-400 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Session
            </button>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Add Session Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-zinc-800 overflow-hidden shrink-0"
            >
              <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-3 items-start">
                <div className="sm:col-span-2 xl:col-span-2 min-w-0">
                  <input
                    value={newEvent.title}
                    onChange={(e) => { setNewEvent((p) => ({ ...p, title: e.target.value })); setAddError(""); }}
                    placeholder="Session title (e.g. Jaysmin – Legs)"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white 
                              focus:outline-none focus:border-cyan-400 placeholder:text-zinc-500"
                  />
                  {addError && <p className="text-red-400 text-[10px] mt-1">{addError}</p>}
                </div>
                <select
                  value={newEvent.day}
                  onChange={(e) => setNewEvent((p) => ({ ...p, day: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white 
                            focus:outline-none focus:border-cyan-400"
                >
                  {DAYS.map((d) => <option key={d}>{d}</option>)}
                </select>
                <select
                  value={newEvent.time}
                  onChange={(e) => setNewEvent((p) => ({ ...p, time: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white 
                            focus:outline-none focus:border-cyan-400"
                >
                  {HOURS.map((h) => <option key={h}>{h}</option>)}
                </select>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent((p) => ({ ...p, type: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm 
                            text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="workout">Workout</option>
                  <option value="diet">Diet Review</option>
                  <option value="check">Progress Check</option>
                </select>
                <button
                  onClick={handleAddEvent}
                  disabled={saving}
                  className="w-full xl:self-stretch px-3 py-2 bg-cyan-500 hover:bg-cyan-400 rounded-lg text-sm font-bold 
                            text-black transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {saving ? "Saving..." : "Add"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Calendar Grid */}
        <div className="overflow-auto flex-1 p-4">
          <div className="grid grid-cols-7 gap-2 min-w-[700px]">
            {/* Day headers */}
            {DAYS.map((day, i) => (
              <div key={day} className={`text-center pb-3 border-b ${isToday(weekDates[i]) ? 'border-cyan-400/40' : 'border-zinc-800'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{day.slice(0,3)}</p>
                <p className={`text-sm font-bold mt-0.5 ${isToday(weekDates[i]) ? 'text-cyan-400' : 'text-zinc-300'}`}>
                  {formatShortDate(weekDates[i])}
                </p>
                <p className="text-[10px] text-zinc-600 mt-0.5">
                  {formatDayDate(weekDates[i])}
                </p>
                {isToday(weekDates[i]) && (
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mx-auto mt-1 animate-pulse" />
                )}
              </div>
            ))}

            {/* Event cells */}
            {DAYS.map((day) => (
              <div key={day} className="space-y-2 min-h-[200px]">
                {sessionsLoading ? (
                  <div className="text-xs text-zinc-500 px-2 py-4">Loading sessions...</div>
                ) : normalizedSessions
                  .filter((e) => e.day === day)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((ev) => (
                    <motion.div
                      key={ev.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group relative p-2 rounded-xl border text-xs font-medium 
                                  cursor-default ${COLORS[ev.color]}`}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          {ev.type === 'workout' && <Dumbbell className="w-3 h-3 shrink-0" />}
                          {ev.type === 'diet'    && <Utensils className="w-3 h-3 shrink-0" />}
                          {ev.type === 'check'   && <TrendingUp className="w-3 h-3 shrink-0" />}
                          <span className="truncate leading-tight">{ev.title}</span>
                        </div>
                        <button
                          onClick={() => removeEvent(ev.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 
                                    hover:text-red-400 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 mt-1 opacity-70">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{ev.time}</span>
                        <span className="mx-1">•</span>
                        <span>{ev.readableDate}</span>
                      </div>
                    </motion.div>
                  ))}
              </div>
            ))}
          </div>
          {!sessionsLoading && sessionsError && (
            <p className="text-sm text-red-400 mt-4 px-1">{sessionsError}</p>
          )}
        </div>

        {/* Footer summary */}
        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between shrink-0">
          <p className="text-xs text-zinc-500">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} scheduled this week
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            {[['workout','Workout',Dumbbell],['diet','Diet',Utensils],['check','Progress',TrendingUp]].map(
              ([type, label, Icon]) => (
                <div key={type} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" />
                  <span>{label}: {sessions.filter(e => e.type === type).length}</span>
                </div>
              )
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MissionAssignModal({ clients, initialClientId, onClose, onSave }) {
  const [clientId, setClientId] = useState(initialClientId || clients[0]?.id || clients[0]?._id || "");
  const [date, setDate] = useState(formatDateKey(new Date()));
  const [missions, setMissions] = useState(DEFAULT_MISSIONS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateMission = (index, updates) => {
    setMissions((prev) => prev.map((mission, i) => (i === index ? { ...mission, ...updates } : mission)));
  };

  const addMission = () => {
    setMissions((prev) => [...prev, { text: "", category: "custom", priority: "medium" }]);
  };

  const removeMission = (index) => {
    setMissions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const filteredMissions = missions
      .map((mission) => ({
        text: mission.text.trim(),
        category: mission.category,
        priority: mission.priority,
      }))
      .filter((mission) => mission.text.length > 0);

    if (!clientId) {
      setError("Please select a client.");
      return;
    }
    if (filteredMissions.length === 0) {
      setError("Add at least one mission with text.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({ mode: "assign", clientId, tasks: filteredMissions, date });
      onClose();
    } catch (err) {
      console.error("Failed to assign missions:", err);
      setError(err.response?.data?.detail || "Failed to assign missions.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onSave({ mode: "clear", clientId, date });
      onClose();
    } catch (err) {
      console.error("Failed to reset missions:", err);
      setError(err.response?.data?.detail || "Failed to reset missions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">Assign Daily Missions</h2>
            <p className="text-xs text-zinc-500">Create custom missions for a client dashboard</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Client</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            >
              {clients.map((client) => {
                const id = client.id || client._id;
                return (
                  <option key={id} value={id}>
                    {client.name || "Client"}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Mission date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="space-y-3">
            {missions.map((mission, index) => (
              <div key={`${index}-${mission.category}`} className="p-3 rounded-xl border border-zinc-800 bg-zinc-900/70 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Mission {index + 1}</p>
                  <button
                    onClick={() => removeMission(index)}
                    disabled={missions.length <= 1}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  value={mission.text}
                  onChange={(e) => updateMission(index, { text: e.target.value })}
                  placeholder="Write a clear mission"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={mission.category}
                    onChange={(e) => updateMission(index, { category: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {MISSION_CATEGORY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <select
                    value={mission.priority}
                    onChange={(e) => updateMission(index, { priority: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
                  >
                    {MISSION_PRIORITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addMission}
            className="w-full border border-zinc-700 hover:border-cyan-500/40 text-zinc-300 rounded-xl py-2 text-sm font-medium"
          >
            + Add another mission
          </button>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3 shrink-0">
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 rounded-lg border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/10 disabled:opacity-50"
          >
            Reset To Auto
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold disabled:opacity-50"
          >
            {saving ? "Assigning..." : "Assign Missions"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────
  TrainerDashboard
───────────────────────────────────────── */
export default function TrainerDashboard() {
  const { clients, loading, sessions, assignDailyMissions, clearDailyMissions } = useTrainer();
  const { user: authUser }   = useAuth();
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [missionModalClientId, setMissionModalClientId] = useState(null);
  const [missionNotice, setMissionNotice] = useState(null);
  const normalizedSessions = useMemo(
    () => sessions.map((session) => mapSessionToEvent(session)),
    [sessions]
  );

  if (!authUser) {
    return (
      <DashboardLayout role="trainer">
        <div className="text-white p-6">Authenticating...</div>
      </DashboardLayout>
    );
  }

  const trainerName = authUser.name || "Trainer";

  const stats = [
    { label: "Total Clients",    value: clients.length,  icon: Users,      color: "cyan"   },
    { label: "Active Programs",  value: clients.filter(c => c.assignedWorkout || c.assignedDiet).length, icon: Activity, color: "purple" },
    { label: "Avg. Adherence",   value: clients.length > 0 ? "82%" : "N/A", icon: TrendingUp, color: "green"  },
    { label: "Rating",           value: authUser.rating || "5.0⭐", icon: Award, color: "yellow" },
  ];

  const pendingPlanTasks = clients
    .filter(c => !c.assignedWorkout || !c.assignedDiet)
    .slice(0, 3)
    .map(c => ({
      id: `plan-${c.id || c._id}`,
      client: c.name,
      task: !c.assignedWorkout ? "Assign Workout" : "Assign Diet Plan",
      priority: "high"
    }));

  const pendingMissionTasks = clients.slice(0, 3).map((client) => ({
    id: `mission-${client.id || client._id}`,
    client: client.name,
    task: "Assign Daily Mission",
    priority: "medium",
    actionType: "assign-mission",
    clientId: client.id || client._id,
  }));

  const pendingTasks = [...pendingPlanTasks, ...pendingMissionTasks].slice(0, 5);

  return (
    <DashboardLayout role="trainer">
      <div className="flex-1 space-y-6">

        {/* ── Top Bar ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back, <span className="text-cyan-400">{trainerName}</span>
            </h1>
            <p className="text-zinc-400 text-sm">Manage your clients and programs 💪</p>
          </div>

          {/* ── Dynamic Schedule Button ── */}
          <button
            onClick={() => setScheduleOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 
                      border border-white/10 hover:border-cyan-500/30 rounded-xl 
                      transition-all text-sm font-medium group"
          >
            <Calendar className="w-4 h-4 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
            <span>Schedule</span>
            <span className="ml-1 px-1.5 py-0.5 bg-cyan-500/15 text-cyan-400 rounded text-[10px] font-bold">
              {sessions.length}
            </span>
          </button>
        </motion.div>

        {missionNotice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border px-4 py-3 text-sm font-medium ${
              missionNotice.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{missionNotice.text}</span>
              <button
                onClick={() => setMissionNotice(null)}
                className="text-xs uppercase tracking-wider opacity-80 hover:opacity-100"
              >
                dismiss
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, index) => <StatCard key={index} stat={stat} />)}
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">

            {/* Clients */}
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Recent Clients
                </h2>
              </div>
              <div className="space-y-3">
                {loading ? (
                  <div className="flex justify-center p-6">
                    <Loader className="animate-spin text-cyan-400" />
                  </div>
                ) : clients.length > 0 ? (
                  clients.slice(0, 3).map((client) => (
                    <ClientCard
                      key={client.id || client._id}
                      client={{ ...client, avatar: client.name?.[0] || 'U' }}
                    />
                  ))
                ) : (
                  <p className="text-zinc-500 text-sm py-4">No clients assigned yet.</p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <QuickActionButton icon={<Activity className="w-5 h-5" />} label="Create Workout"   color="cyan"   />
                <QuickActionButton icon={<Target    className="w-5 h-5" />} label="Create Diet Plan" color="purple" />
                <QuickActionButton
                  icon={<Calendar className="w-5 h-5" />}
                  label="Assign Daily Missions"
                  color="cyan"
                  onClick={() => setMissionModalClientId(clients[0]?.id || clients[0]?._id || null)}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                📋 Pending Tasks
              </h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onAction={() => {
                      if (task.actionType === "assign-mission") {
                        setMissionModalClientId(task.clientId);
                      }
                    }}
                  />
                ))}
              </div>
            </Card>

            {/* Today's schedule preview */}
            <Card className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-cyan-500/20">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  Today's Sessions
                </h2>
                <button
                  onClick={() => setScheduleOpen(true)}
                  className="text-xs text-cyan-400 hover:underline"
                >
                  View all
                </button>
              </div>
              <div className="space-y-2">
                {normalizedSessions
                  .filter((ev) => ev.day === getDayName(new Date()))
                  .slice(0, 3)
                  .map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2 text-xs">
                    <span className="text-zinc-500 w-10 shrink-0">{ev.time}</span>
                    <span className="text-zinc-300 truncate">{ev.title}</span>
                  </div>
                ))}
                {normalizedSessions.filter((ev) => ev.day === getDayName(new Date())).length === 0 && (
                  <p className="text-zinc-600 text-xs">No sessions today</p>
                )}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
              <div className="text-center">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-bold text-yellow-400 mb-1">Top Trainer</h3>
                <p className="text-xs text-zinc-400">Highest client satisfaction this month!</p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Schedule Modal ── */}
      <AnimatePresence>
        {scheduleOpen && <ScheduleModal onClose={() => setScheduleOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {missionModalClientId && (
          <MissionAssignModal
            clients={clients}
            initialClientId={missionModalClientId}
            onClose={() => setMissionModalClientId(null)}
            onSave={async ({ mode, clientId, tasks, date }) => {
              const selectedClient = clients.find((c) => (c.id || c._id) === clientId);
              const clientName = selectedClient?.name || 'Client';
              setMissionNotice(null);
              try {
                if (mode === "clear") {
                  await clearDailyMissions({ clientId, date });
                  setMissionNotice({
                    type: 'success',
                    text: `Daily missions reset to auto for ${clientName} on ${date}.`,
                  });
                  return;
                }
                await assignDailyMissions({ clientId, tasks, date });
                setMissionNotice({
                  type: 'success',
                  text: `${tasks.length} mission${tasks.length !== 1 ? 's' : ''} assigned to ${clientName} for ${date}.`,
                });
              } catch (err) {
                const detail = err?.response?.data?.detail || 'Mission update failed.';
                setMissionNotice({
                  type: 'error',
                  text: `${clientName}: ${detail}`,
                });
                throw err;
              }
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}

/* ─── Sub-components ─── */
const COLOR_MAP = {
  cyan:   "from-cyan-500 to-cyan-600 shadow-cyan-500/20",
  purple: "from-purple-500 to-purple-600 shadow-purple-500/20",
  green:  "from-green-500 to-green-600 shadow-green-500/20",
  yellow: "from-yellow-500 to-orange-500 shadow-yellow-500/20",
};

function StatCard({ stat }) {
  return (
    <Card>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${COLOR_MAP[stat.color]} shadow-lg`}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-zinc-400">{stat.label}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
        </div>
      </div>
    </Card>
  );
}

function QuickActionButton({ icon, label, color, onClick }) {
  const cls = {
    cyan:   "from-cyan-500/10 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-500/50",
    purple: "from-purple-500/10 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50",
  };
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border bg-gradient-to-br ${cls[color]} transition-all hover:scale-105 w-full`}
    >
      <div className="flex flex-col items-center gap-2">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </button>
  );
}

function TaskItem({ task, onAction }) {
  const [done, setDone] = useState(false);
  const priorityColors = {
    high:   "bg-red-500/10 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    low:    "bg-green-500/10 text-green-400 border-green-500/30",
  };
  return (
    <div className={`p-3 bg-white/5 rounded-lg border border-zinc-800 hover:border-cyan-500/30 
                    transition-all ${done ? 'opacity-40' : ''}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <button
            onClick={() => setDone((v) => !v)}
            className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors
                        ${done ? 'bg-green-500 border-green-500' : 'border-zinc-600 hover:border-cyan-400'}`}
          >
            {done && <Check className="w-2.5 h-2.5 text-white" />}
          </button>
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${done ? 'line-through text-zinc-500' : ''}`}>
              {task.task}
            </p>
            <p className="text-xs text-zinc-500">{task.client}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold border shrink-0 
                          ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
      </div>
      {task.actionType === "assign-mission" && (
        <button
          onClick={onAction}
          className="mt-2 text-xs text-cyan-400 hover:underline"
        >
          Assign now
        </button>
      )}
    </div>
  );
}
