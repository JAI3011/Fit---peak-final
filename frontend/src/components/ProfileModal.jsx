import React, { useState, useEffect } from "react";
import { X, Loader, User, Ruler, Weight, Calendar, Target, Flame } from "lucide-react";

export default function ProfileModal({ open, setOpen, user, onSave }) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    goal: "muscle_gain",
    caloriesGoal: 2400,          // numbers, not empty strings
    caloriesConsumed: 0,
    overallProgress: 0,
    macros: { protein: 0, carbs: 0, fats: 0 },
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Sync form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        age: user.age || "",
        gender: user.gender || "male",
        height: user.height || "",
        weight: user.weight || "",
        goal: user.goal || "muscle_gain",
        caloriesGoal: user.caloriesGoal ?? 2400,
        caloriesConsumed: user.caloriesConsumed ?? 0,
        overallProgress: user.overallProgress ?? 0,
        macros: {
          protein: user.macros?.protein ?? 0,
          carbs: user.macros?.carbs ?? 0,
          fats: user.macros?.fats ?? 0,
        },
      });
      setErrors({});
      setSaveSuccess(false);
      setSaveError('');
    }
  }, [user, open]);

  const validateField = (name, value) => {
    const num = parseFloat(value);
    switch (name) {
      case "name":
        if (!value || String(value).trim().length < 2)
          return "Name must be at least 2 characters";
        return "";
      case "age":
        if (isNaN(num) || num < 1 || num > 120)
          return "Age must be between 1 and 120";
        return "";
      case "height":
        if (isNaN(num) || num < 50 || num > 300)
          return "Height must be 50–300 cm";
        return "";
      case "weight":
        if (isNaN(num) || num < 10 || num > 500)
          return "Weight must be 10–500 kg";
        return "";
      case "caloriesGoal":
        if (isNaN(num) || num < 500 || num > 10000)
          return "Goal must be 500–10,000 kcal";
        return "";
      case "caloriesConsumed":
        if (isNaN(num) || num < 0 || num > 10000)
          return "Must be 0–10,000 kcal";
        return "";
      case "overallProgress":
        if (isNaN(num) || num < 0 || num > 100)
          return "Must be 0–100%";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Handle number fields: parseFloat, default to 0 if invalid
    if (e.target.type === 'number') {
      const num = parseFloat(value);
      finalValue = isNaN(num) ? 0 : num;
    }

    if (name.startsWith("macros.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        macros: { ...prev.macros, [key]: finalValue },
      }));
      // Optionally validate macro fields (they are numbers, already parsed)
    } else {
      setFormData((prev) => ({ ...prev, [name]: finalValue }));
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, finalValue),
      }));
    }
  };

  const validateAll = () => {
    const fields = [
      "name","age","height","weight",
      "caloriesGoal","caloriesConsumed","overallProgress",
    ];
    const newErrors = {};
    fields.forEach((f) => {
      const err = validateField(f, formData[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAll()) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await onSave(formData);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setOpen(false);
      }, 1200);
    } catch (err) {
      console.error("Save failed:", err);
      setSaveError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  const inputCls = (field) =>
    `w-full bg-zinc-800/70 border ${
      errors[field] ? "border-red-400/60" : "border-zinc-700"
    } rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-zinc-500 
    focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 
    transition-all disabled:opacity-50`;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl
                      shadow-cyan-500/10 overflow-hidden"
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Update Profile</h2>
              <p className="text-xs text-zinc-500">Changes are saved to your account</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            disabled={isSaving}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* ── Success Banner ── */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3 bg-green-500/15 border border-green-500/30 rounded-xl text-green-400 text-sm text-center font-medium">
            ✓ Profile updated successfully!
          </div>
        )}

        {saveError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center font-medium">
            {saveError}
          </div>
        )}

        {/* ── Form Body ── */}
        <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">

          {/* Basic Info */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Basic Info
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Full Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSaving}
                  placeholder="Your name"
                  className={inputCls("name")}
                />
                {errors.name && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Age</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="25"
                    className={`${inputCls("age")} pl-8`}
                  />
                </div>
                {errors.age && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isSaving}
                  className={inputCls("gender")}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </section>

          {/* Physical */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Physical
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Height (cm)</label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="170"
                    className={`${inputCls("height")} pl-8`}
                  />
                </div>
                {errors.height && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.height}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Weight (kg)</label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    disabled={isSaving}
                    placeholder="70"
                    className={`${inputCls("weight")} pl-8`}
                  />
                </div>
                {errors.weight && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.weight}</p>
                )}
              </div>
            </div>
          </section>

          {/* Goal & Calories */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Goals & Energy
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Fitness Goal</label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                  <select
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    disabled={isSaving}
                    className={`${inputCls("goal")} pl-8`}
                  >
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="weight_loss">Fat Loss</option>
                    <option value="endurance">Endurance</option>
                    {/* Remove "Maintenance" – backend does not support it */}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Daily Goal (kcal)</label>
                <input
                  type="number"
                  name="caloriesGoal"
                  value={formData.caloriesGoal}
                  onChange={handleChange}
                  disabled={isSaving}
                  className={inputCls("caloriesGoal")}
                />
                {errors.caloriesGoal && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.caloriesGoal}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Consumed (kcal)</label>
                <input
                  type="number"
                  name="caloriesConsumed"
                  value={formData.caloriesConsumed}
                  onChange={handleChange}
                  disabled={isSaving}
                  className={inputCls("caloriesConsumed")}
                />
                {errors.caloriesConsumed && (
                  <p className="text-red-400 text-[10px] mt-1">{errors.caloriesConsumed}</p>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">
                  Overall Progress (%)
                  <span className="ml-2 text-cyan-400 font-bold">{formData.overallProgress}%</span>
                </label>
                <input
                  type="range"
                  name="overallProgress"
                  min="0"
                  max="100"
                  value={formData.overallProgress}
                  onChange={handleChange}
                  disabled={isSaving}
                  className="w-full h-2 rounded-full appearance-none bg-zinc-700 
                            [&::-webkit-slider-thumb]:appearance-none 
                            [&::-webkit-slider-thumb]:w-4 
                            [&::-webkit-slider-thumb]:h-4 
                            [&::-webkit-slider-thumb]:rounded-full 
                            [&::-webkit-slider-thumb]:bg-cyan-400 
                            [&::-webkit-slider-thumb]:cursor-pointer
                            disabled:opacity-50"
                />
              </div>
            </div>
          </section>

          {/* Macros */}
          <section>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
              Macros (g/day)
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "protein", label: "Protein", color: "text-blue-400" },
                { key: "carbs",   label: "Carbs",   color: "text-green-400" },
                { key: "fats",    label: "Fats",    color: "text-orange-400" },
              ].map(({ key, label, color }) => (
                <div key={key}>
                  <label className={`block text-xs mb-1 font-bold ${color}`}>{label}</label>
                  <input
                    type="number"
                    name={`macros.${key}`}
                    value={formData.macros[key]}
                    onChange={handleChange}
                    disabled={isSaving}
                    min="0"
                    className={inputCls(`macros.${key}`)}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-3 px-6 py-4 border-t border-zinc-800">
          <button
            onClick={() => setOpen(false)}
            disabled={isSaving}
            className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg 
                      transition-colors font-medium text-white text-sm 
                      disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || saveSuccess}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 
                      hover:from-cyan-400 hover:to-purple-400 rounded-lg font-semibold 
                      transition-all text-white text-sm shadow-lg shadow-cyan-500/20 
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              "✓ Saved!"
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}