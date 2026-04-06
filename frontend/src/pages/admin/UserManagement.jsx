/*
 * UserManagement.jsx  — fully dynamic Add User, Edit, Toggle Status, Delete
 * Drop-in replacement for the existing file.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Edit, Trash2, UserX, UserCheck,
  X, Save, Loader, UserPlus, ChevronDown
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/Card';
import { useAdmin } from '../../contexts/AdminContext';

/* ─────────────────────────────────────────
Add User Modal
───────────────────────────────────────── */
function AddUserModal({ onClose, onAdd, trainers }) {
  const [form, setForm]     = useState({ name:'', email:'', role:'user', status:'active', trainerId:'' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = (name, value) => {
    if (name === 'name'  && (!value || value.length < 2)) return 'Name must be at least 2 characters';
    if (name === 'email' && (!/\S+@\S+\.\S+/.test(value)))  return 'Invalid email format';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const nameErr  = validate('name',  form.name);
    const emailErr = validate('email', form.email);
    if (nameErr || emailErr) { setErrors({ name: nameErr, email: emailErr }); return; }

    setSaving(true);
    try {
      await onAdd({
        ...form,
        id: Date.now().toString(),
        joined: new Date().toISOString().split('T')[0],
      });
      setSuccess(true);
      setTimeout(onClose, 1000);
    } catch (error) {
      setSubmitError(error.message || 'Failed to add user');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-400/50' : 'border-white/10'} 
    rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 
    disabled:opacity-50 transition-all placeholder:text-zinc-600`;

  return (
    <ModalWrapper onClose={onClose} title="Add New User" icon={<UserPlus className="w-5 h-5 text-cyan-400"/>}>
      {success && (
        <div className="mb-4 p-3 bg-green-500/15 border border-green-500/30 rounded-xl 
                        text-green-400 text-sm text-center">
          ✓ User added successfully!
        </div>
      )}
      {submitError && (
        <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {submitError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name" error={errors.name}>
          <input name="name" value={form.name} onChange={handleChange}
                disabled={saving} placeholder="Jane Smith" className={inputCls('name')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" name="email" value={form.email} onChange={handleChange}
                disabled={saving} placeholder="jane@example.com" className={inputCls('email')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <select name="role" value={form.role} onChange={handleChange}
                    disabled={saving} className={inputCls('role')}>
              <option value="user">User</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" value={form.status} onChange={handleChange}
                    disabled={saving} className={inputCls('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </Field>
        </div>
        <Field label="Assign Trainer">
          <select name="trainerId" value={form.trainerId} onChange={handleChange}
                  disabled={saving} className={inputCls('trainerId')}>
            <option value="">— None —</option>
            {(trainers || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <ModalActions onCancel={onClose} saving={saving} label="Add User" />
      </form>
    </ModalWrapper>
  );
}

/* ─────────────────────────────────────────
  Edit User Modal
───────────────────────────────────────── */
function EditUserModal({ user, onClose, onSave, trainers }) {
  const [form, setForm]     = useState({
    name:      user.name      || '',
    email:     user.email     || '',
    role:      user.role      || 'user',
    status:    user.status    || 'active',
    trainerId: user.trainerId || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = (name, value) => {
    if (name === 'name'  && (!value || value.length < 2)) return 'Min 2 characters';
    if (name === 'email' && !/\S+@\S+\.\S+/.test(value))  return 'Invalid email';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: validate(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    const nameErr  = validate('name',  form.name);
    const emailErr = validate('email', form.email);
    if (nameErr || emailErr) { setErrors({ name: nameErr, email: emailErr }); return; }
    setSaving(true);
    try {
      await onSave({ ...user, ...form });
      onClose();
    } catch (error) {
      setSubmitError(error.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full bg-white/5 border ${errors[field] ? 'border-red-400/50' : 'border-white/10'} 
    rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-400 
    disabled:opacity-50 transition-all`;

  return (
    <ModalWrapper onClose={onClose} title={`Edit — ${user.name}`} icon={<Edit className="w-5 h-5 text-purple-400"/>}>
      {submitError && (
        <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
          {submitError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name" error={errors.name}>
          <input name="name" value={form.name} onChange={handleChange}
                disabled={saving} className={inputCls('name')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" name="email" value={form.email} onChange={handleChange}
                disabled={saving} className={inputCls('email')} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <select name="role" value={form.role} onChange={handleChange}
                    disabled={saving} className={inputCls('role')}>
              <option value="user">User</option>
              <option value="trainer">Trainer</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          <Field label="Status">
            <select name="status" value={form.status} onChange={handleChange}
                    disabled={saving} className={inputCls('status')}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </Field>
        </div>
        <Field label="Assign Trainer">
          <select name="trainerId" value={form.trainerId} onChange={handleChange}
                  disabled={saving} className={inputCls('trainerId')}>
            <option value="">— None —</option>
            {(trainers || []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </Field>
        <ModalActions onCancel={onClose} saving={saving} label="Save Changes" />
      </form>
    </ModalWrapper>
  );
}

/* ─────────────────────────────────────────
  Delete Confirm Modal
───────────────────────────────────────── */
function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ModalWrapper onClose={onCancel} title="Delete User" icon={<Trash2 className="w-5 h-5 text-red-400"/>}>
      <p className="text-zinc-400 text-sm mb-6">
        Are you sure you want to permanently delete{' '}
        <span className="text-white font-bold">{user.name}</span>?
        This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={deleting}
          className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 
                    text-red-400 rounded-lg text-sm font-bold transition-colors 
                    flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {deleting ? <><Loader className="w-4 h-4 animate-spin"/>Deleting…</> : 'Delete User'}
        </button>
      </div>
    </ModalWrapper>
  );
}

/* ─────────────────────────────────────────
UserManagement (main page)
───────────────────────────────────────── */
const UserManagement = () => {
  const { users, trainers, updateUser, deleteUser, toggleUserStatus, addUser } = useAdmin();

  const [search,       setSearch]       = useState('');
  const [roleFilter,   setRoleFilter]   = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [editingUser,  setEditingUser]  = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter   === 'all' || u.role   === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const handleSave = (updated) => {
    return updateUser(updated.id, updated).then(() => {
      setEditingUser(null);
    });
  };

  const handleDelete = () => {
    return deleteUser(deletingUser.id).then(() => {
      setDeletingUser(null);
    });
  };

  const handleAdd = (newUser) => {
    return addUser(newUser);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">User Management</h1>

          <div className="flex flex-wrap gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users…"
                className="pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white 
                          text-sm placeholder:text-zinc-500 focus:outline-none focus:border-cyan-400 w-48"
              />
            </div>

            {/* Role filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm 
                        focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="trainer">Trainers</option>
              <option value="admin">Admins</option>
            </select>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm 
                        focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* ── Add User Button (DYNAMIC) ── */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 
                        hover:from-cyan-400 hover:to-purple-400 rounded-lg text-white text-sm font-bold 
                        transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </button>
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="flex gap-3 flex-wrap">
          {['total','active','inactive','pending'].map((s) => {
            const count = s === 'total'
              ? users.length
              : users.filter(u => u.status === s).length;
            const colors = {
              total:'bg-white/5 text-zinc-300 border-white/10',
              active:'bg-green-500/10 text-green-400 border-green-500/20',
              inactive:'bg-red-500/10 text-red-400 border-red-500/20',
              pending:'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            };
            return (
              <div key={s}
                className={`px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider ${colors[s]}`}>
                {s}: {count}
              </div>
            );
          })}
        </div>

        {/* ── Table ── */}
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                {['ID','User','Role','Status','Joined','Actions'].map((h) => (
                  <th key={h} className="p-4 text-xs font-bold uppercase text-zinc-400 tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-500 italic">
                    No users match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* ID */}
                    <td className="p-4 text-sm text-zinc-400 font-mono">#{user.id?.slice(-4) || '—'}</td>

                    {/* User */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 
                                        flex items-center justify-center text-sm font-bold shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{user.name}</p>
                          <p className="text-xs text-zinc-500">{user.email}</p>
                          {user.trainerId && (
                            <p className="text-[10px] text-cyan-400">
                              Trainer: {trainers.find(t => t.id === user.trainerId)?.name || '—'}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* Joined */}
                    <td className="p-4 text-sm text-zinc-400">{user.joined}</td>

                    {/* Actions */}
                    <td className="p-4">
                      <div className="flex gap-1">
                        {/* Edit */}
                        <ActionBtn
                          title="Edit"
                          onClick={() => setEditingUser(user)}
                          className="hover:bg-purple-500/10 hover:text-purple-400"
                        >
                          <Edit className="w-4 h-4" />
                        </ActionBtn>

                        {/* Toggle status */}
                        <ActionBtn
                          title={user.status === 'active' ? 'Suspend' : 'Activate'}
                          onClick={() => toggleUserStatus(user.id)}
                          className={user.status === 'active'
                            ? 'hover:bg-red-500/10 hover:text-red-400'
                            : 'hover:bg-green-500/10 hover:text-green-400'}
                        >
                          {user.status === 'active'
                            ? <UserX    className="w-4 h-4" />
                            : <UserCheck className="w-4 h-4" />}
                        </ActionBtn>

                        {/* Delete */}
                        <ActionBtn
                          title="Delete"
                          onClick={() => setDeletingUser(user)}
                          className="hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </ActionBtn>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAdd}
            trainers={trainers}
          />
        )}
        {editingUser && (
          <EditUserModal
            user={editingUser}
            onClose={() => setEditingUser(null)}
            onSave={handleSave}
            trainers={trainers}
          />
        )}
        {deletingUser && (
          <DeleteConfirmModal
            user={deletingUser}
            onConfirm={handleDelete}
            onCancel={() => setDeletingUser(null)}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default UserManagement;

/* ─────────────────────────────────────────
Shared helpers
───────────────────────────────────────── */
function ModalWrapper({ children, onClose, title, icon }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {icon}{title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase text-zinc-500 mb-1 tracking-wider">
        {label}
      </label>
      {children}
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

function ModalActions({ onCancel, saving, label }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-white 
                  text-sm font-medium transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-purple-500 
                  hover:from-cyan-400 hover:to-purple-400 rounded-lg text-white text-sm 
                  font-semibold transition-all disabled:opacity-50 
                  flex items-center justify-center gap-2"
      >
        {saving ? <><Loader className="w-4 h-4 animate-spin"/>Saving…</> : <><Save className="w-4 h-4"/>{label}</>}
      </button>
    </div>
  );
}

function RoleBadge({ role }) {
  const cls = {
    admin:   'bg-fuchsia-500/20 text-fuchsia-400',
    trainer: 'bg-purple-500/20 text-purple-400',
    user:    'bg-cyan-500/20 text-cyan-400',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold ${cls[role] || cls.user}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    active:   { cls: 'text-green-400', dot: 'bg-green-400' },
    inactive: { cls: 'text-red-400',   dot: 'bg-red-400'   },
    pending:  { cls: 'text-yellow-400',dot: 'bg-yellow-400 animate-pulse' },
  };
  const { cls, dot } = cfg[status] || cfg.inactive;
  return (
    <span className={`flex items-center gap-2 capitalize text-sm ${cls}`}>
      <div className={`w-2 h-2 rounded-full ${dot}`} />
      {status}
    </span>
  );
}

function ActionBtn({ children, onClick, title, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg text-zinc-400 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
