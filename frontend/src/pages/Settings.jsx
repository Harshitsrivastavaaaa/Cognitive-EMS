import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Bell, Shield, Save, ArrowLeft, ShieldCheck, Activity,
  Cpu, Lock, Mail, Plus, Trash2, Smartphone, MessageSquare, Check, AlertTriangle,
  Building2, Server, Sparkles, RefreshCw, Key, UserCheck, UserPlus, CheckCircle, XCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { settingsService } from '../services/employees';
import { authService } from '../services/auth';
import { departmentService } from '../services/departments';

const SpotlightCard = ({ children, className = "" }) => (
  <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0c]/80 backdrop-blur-2xl transition-all duration-300 hover:border-white/20 shadow-xl ${className}`}>
    <div className="relative z-10">{children}</div>
  </div>
);

const CustomSwitch = ({ active, onToggle, disabled = false }) => (
  <div
    onClick={disabled ? undefined : onToggle}
    className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-all duration-300 ${active ? 'bg-gradient-to-r from-orange-500 to-pink-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-white/10'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <motion.div
      animate={{ x: active ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="w-4 h-4 bg-white rounded-full shadow-md"
    />
  </div>
);

const floatingBlob = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    scale: [1, 1.03, 1],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function SettingsPage() {
  const { user, updateUser, isEmployer } = useAuth();
  const { addNotification } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSyncing, setIsSyncing] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // --- EMPLOYEE PROVISIONING STATE ---
  const [employeeAccounts, setEmployeeAccounts] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [provisionForm, setProvisionForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: 'Engineering',
    roleTitle: 'Software Engineer',
    activateNow: true
  });
  const [provisioning, setProvisioning] = useState(false);

  // --- PROFILE STATE ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');

  // --- SECURITY STATE ---
  const [twoFactor, setTwoFactor] = useState(true);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // --- NOTIFICATIONS STATE ---
  const [notifs, setNotifs] = useState({ email: true, push: false, sms: true });

  // --- AI ENGINE STATE ---
  const [aiConfigs, setAiConfigs] = useState({ predictive: true, neural: false });

  // --- DEPARTMENTS STATE ---
  const [departmentsList, setDepartmentsList] = useState([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [loadingDepts, setLoadingDepts] = useState(false);

  // Initialize profile from user context
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || user.firstName || '');
      setLastName(user.last_name || user.lastName || '');
      setEmails([user.email || 'admin@hash.ai']);
    }
  }, [user]);

  // Load persisted settings from backend
  useEffect(() => {
    setLoadingSettings(true);
    settingsService.getSettings()
      .then(data => {
        setTwoFactor(data.two_factor_enabled);
        setNotifs({
          email: data.notif_email,
          push: data.notif_push,
          sms: data.notif_sms
        });
        setAiConfigs({
          neural: data.ai_neural,
          predictive: data.ai_predictive
        });
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => setLoadingSettings(false));
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const updatedUser = await authService.updateProfile(firstName, lastName);
      updateUser({ first_name: updatedUser.first_name, last_name: updatedUser.last_name });

      await settingsService.updateSettings({
        two_factor_enabled: twoFactor,
        notif_email: notifs.email,
        notif_push: notifs.push,
        notif_sms: notifs.sms,
        ai_neural: aiConfigs.neural,
        ai_predictive: aiConfigs.predictive,
      });

      addNotification({ type: 'success', message: 'Settings synchronized successfully.' });
    } catch (err) {
      console.error('Settings sync failed:', err);
      addNotification({ type: 'error', message: 'Failed to save settings. Please try again.' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword) {
      setPasswordError('New password is required.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError('Password must be at least 4 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      await authService.changePassword(oldPassword, newPassword);
      setPasswordSuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addNotification({ type: 'success', message: 'Password updated successfully.' });
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to change password.';
      setPasswordError(detail);
    }
  };

  const tabs = [
    { id: 'profile', label: 'General Identity', icon: User, desc: 'Personal details & aliases' },
    ...(isEmployer ? [{ id: 'accounts', label: 'Employee Provisioning', icon: Key, desc: 'Create & Activate Employee Credentials' }] : []),
    { id: 'departments', label: 'Departments', icon: Building2, desc: 'Org structure & teams' },
    { id: 'security', label: 'Security & Auth', icon: Shield, desc: 'Password & MFA' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alert preferences' },
    { id: 'ai', label: 'AI Intelligence', icon: Cpu, desc: 'Neural engine controls' },
    { id: 'system', label: 'System Operations', icon: Server, desc: 'Cache & infrastructure' },
  ];

  const loadAccountsData = async () => {
    setLoadingAccounts(true);
    try {
      const [accs, pends] = await Promise.all([
        authService.getEmployeeAccounts(),
        authService.getPendingUsers()
      ]);
      setEmployeeAccounts(accs);
      setPendingUsers(pends);
    } catch (err) {
      console.error('Failed to load employee accounts:', err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'accounts') {
      loadAccountsData();
    }
  }, [activeTab]);

  const handleProvisionEmployee = async (e) => {
    e.preventDefault();
    if (!provisionForm.email || !provisionForm.password || !provisionForm.firstName || !provisionForm.lastName) {
      addNotification({ type: 'error', message: 'Please fill in Name, Email, and Password.' });
      return;
    }
    setProvisioning(true);
    try {
      const res = await authService.provisionEmployee(provisionForm);
      addNotification({ type: 'success', message: res.detail || 'Employee credentials created successfully!' });
      setProvisionForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        department: 'Engineering',
        roleTitle: 'Software Engineer',
        activateNow: true
      });
      loadAccountsData();
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.detail || 'Failed to provision employee credentials.' });
    } finally {
      setProvisioning(false);
    }
  };

  const handleToggleActivation = async (userId) => {
    try {
      const res = await authService.toggleUserActivation(userId);
      addNotification({ type: 'success', message: res.detail });
      setEmployeeAccounts(prev => prev.map(a => a.id === userId ? { ...a, is_active: res.is_active } : a));
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.detail || 'Failed to update activation status.' });
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const res = await authService.approveUser(userId);
      addNotification({ type: 'success', message: res.detail });
      loadAccountsData();
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to approve user.' });
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      const res = await authService.rejectUser(userId);
      addNotification({ type: 'success', message: res.detail });
      loadAccountsData();
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to reject user.' });
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    addNotification({ type: 'success', message: 'System cache cleared. Reloading intelligence...' });
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    if (activeTab === 'departments') {
      const fetchDepts = async () => {
        setLoadingDepts(true);
        try {
          const res = await departmentService.getDepartments();
          setDepartmentsList(res);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDepts(false);
        }
      };
      fetchDepts();
    }
  }, [activeTab]);

  const handleAddDepartment = async () => {
    if (!newDeptName.trim()) return;
    try {
      const added = await departmentService.createDepartment({ name: newDeptName.trim() });
      setDepartmentsList(p => [...p, added]);
      setNewDeptName('');
      addNotification({ type: 'success', message: 'Department added successfully.' });
    } catch (err) {
      addNotification({ type: 'error', message: err.response?.data?.detail || 'Failed to add department.' });
    }
  };

  const handleDeleteDepartment = async (id) => {
    try {
      await departmentService.deleteDepartment(id);
      setDepartmentsList(p => p.filter(d => d.id !== id));
      addNotification({ type: 'success', message: 'Department removed.' });
    } catch (err) {
      addNotification({ type: 'error', message: 'Failed to delete department.' });
    }
  };

  const inputClass = "w-full bg-[#121214] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all placeholder:text-slate-600";

  return (
    <div className="relative h-full w-full max-h-screen bg-[#050505] text-white p-4 lg:p-6 font-sans selection:bg-orange-500/30 overflow-hidden flex flex-col">

      {/* Background Neon Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-15 mix-blend-screen" />
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#db2777", "#7c3aed", "#db2777"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[500px] h-[500px] rounded-full blur-[110px] opacity-15 mix-blend-screen" />
      </div>

      <div className="relative z-10 flex flex-col h-full min-h-0 w-full max-w-7xl mx-auto">

        {/* COMPACT HEADER SECTION */}
        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 text-slate-300 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[9px] font-bold uppercase tracking-widest">
                <Sparkles size={10} /> Workspace Control
              </div>
              <h1 className="text-xl lg:text-2xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent uppercase leading-tight">
                Settings & Configuration
              </h1>
            </div>
          </div>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <Activity size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{isSyncing ? 'Syncing...' : 'Save Settings'}</span>
          </button>
        </div>

        {/* SINGLE-SCREEN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5 flex-1 min-h-0 overflow-hidden">

          {/* SIDEBAR TABS */}
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto custom-scrollbar gap-1.5 pr-1 shrink-0">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 lg:w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left whitespace-nowrap group ${isActive
                      ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 text-white shadow-md'
                      : 'bg-white/[0.02] border border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-orange-500 text-white shadow-sm' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                    <tab.icon size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{tab.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN TAB CONTENT CONTAINER */}
          <div className="flex flex-col h-full min-h-0 overflow-hidden">

            {loadingSettings ? (
              <div className="flex flex-col items-center justify-center flex-1 bg-white/[0.01] border border-white/5 rounded-2xl">
                <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-400 rounded-full animate-spin mb-3" />
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-orange-400 animate-pulse">Loading Settings...</p>
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
                <AnimatePresence mode="wait">

                  {/* GENERAL / IDENTITY */}
                  {activeTab === 'profile' && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <SpotlightCard className="p-5">

                        {/* User Banner */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-purple-500/10 to-transparent border border-white/10 mb-4">
                          <div className="h-14 w-14 rounded-xl bg-gradient-to-tr from-orange-500 to-violet-600 flex items-center justify-center text-2xl font-black border border-white/20 shadow-md shrink-0">
                            {firstName?.charAt(0) || 'A'}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h3 className="text-lg font-bold text-white tracking-tight truncate">{firstName} {lastName}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                <ShieldCheck size={10} /> Verified
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@hash.ai'}</p>
                          </div>
                        </div>

                        {/* Fields */}
                        <div className="mb-4">
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                            <User size={13} className="text-orange-400" /> Account Profile Details
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Name</label>
                              <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className={inputClass}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Name</label>
                              <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className={inputClass}
                              />
                            </div>
                            <div className="sm:col-span-2 space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Primary Email (Read Only)</label>
                              <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className={`${inputClass} opacity-50 cursor-not-allowed`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Aliases */}
                        <div>
                          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
                            <Mail size={13} className="text-orange-400" /> Communication Aliases
                          </h4>

                          <div className="space-y-2">
                            {emails.map((email, idx) => (
                              <div key={idx} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-2.5">
                                  <Mail size={14} className="text-orange-400" />
                                  <span className="text-xs font-medium text-white">{email}</span>
                                  {idx === 0 && (
                                    <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                      Primary
                                    </span>
                                  )}
                                </div>
                                {idx !== 0 && (
                                  <button onClick={() => setEmails(emails.filter(e => e !== email))} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="email"
                                placeholder="Add secondary communication email..."
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="flex-1 bg-[#121214] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500/50"
                              />
                              <button
                                onClick={() => { if (newEmail) setEmails([...emails, newEmail]); setNewEmail('') }}
                                className="px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1"
                              >
                                <Plus size={14} /> Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )}

                  {/* EMPLOYEE ACCOUNTS PROVISIONING */}
                  {activeTab === 'accounts' && (
                    <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      
                      {/* Provision Form Card */}
                      <SpotlightCard className="p-5">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-md">
                            <Key size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Create Employee Credentials (ID & Password)</h3>
                            <p className="text-[11px] text-slate-400">Generate login credentials and assign profiles for new team members.</p>
                          </div>
                        </div>

                        <form onSubmit={handleProvisionEmployee} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Name</label>
                              <input
                                type="text"
                                placeholder="e.g. John"
                                value={provisionForm.firstName}
                                onChange={(e) => setProvisionForm({ ...provisionForm, firstName: e.target.value })}
                                className={inputClass}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Name</label>
                              <input
                                type="text"
                                placeholder="e.g. Doe"
                                value={provisionForm.lastName}
                                onChange={(e) => setProvisionForm({ ...provisionForm, lastName: e.target.value })}
                                className={inputClass}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Work Email (Employee ID)</label>
                              <input
                                type="email"
                                placeholder="john.doe@hash.in"
                                value={provisionForm.email}
                                onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                                className={inputClass}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Initial Password</label>
                              <input
                                type="text"
                                placeholder="Set secure password..."
                                value={provisionForm.password}
                                onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                                className={inputClass}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                              <input
                                type="text"
                                placeholder="Engineering, Design, etc."
                                value={provisionForm.department}
                                onChange={(e) => setProvisionForm({ ...provisionForm, department: e.target.value })}
                                className={inputClass}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Position / Role Title</label>
                              <input
                                type="text"
                                placeholder="Software Engineer..."
                                value={provisionForm.roleTitle}
                                onChange={(e) => setProvisionForm({ ...provisionForm, roleTitle: e.target.value })}
                                className={inputClass}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <UserCheck size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Activate Account Immediately</p>
                                <p className="text-[10px] text-slate-400">If enabled, employee can log in immediately with these credentials.</p>
                              </div>
                            </div>
                            <CustomSwitch
                              active={provisionForm.activateNow}
                              onToggle={() => setProvisionForm({ ...provisionForm, activateNow: !provisionForm.activateNow })}
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={provisioning}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {provisioning ? <Activity size={14} className="animate-spin" /> : <UserPlus size={16} />}
                            <span>{provisioning ? 'Creating Account...' : 'Create Employee Credentials'}</span>
                          </button>
                        </form>
                      </SpotlightCard>

                      {/* Configured Accounts & Activation Controls */}
                      <SpotlightCard className="p-5">
                        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400">
                              <UserCheck size={18} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">Employee User Accounts</h3>
                              <p className="text-[11px] text-slate-400">Manage account status, enable login access, or activate accounts.</p>
                            </div>
                          </div>
                          <button
                            onClick={loadAccountsData}
                            className="p-2 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/10 transition-colors"
                            title="Refresh Accounts List"
                          >
                            <RefreshCw size={14} className={loadingAccounts ? 'animate-spin' : ''} />
                          </button>
                        </div>

                        {loadingAccounts ? (
                          <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                            <RefreshCw size={14} className="animate-spin" /> Loading employee accounts...
                          </div>
                        ) : employeeAccounts.length === 0 ? (
                          <div className="p-6 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs uppercase font-bold tracking-wider">
                            No employee accounts created yet. Use the form above to provision credentials.
                          </div>
                        ) : (
                          <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                            {employeeAccounts.map(account => (
                              <div
                                key={account.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center font-bold text-orange-400 text-sm shrink-0">
                                    {account.first_name?.charAt(0) || 'E'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-xs font-bold text-white truncate">{account.first_name} {account.last_name}</p>
                                      {account.is_active ? (
                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider shrink-0">
                                          <CheckCircle size={10} /> Active (Can Login)
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[9px] font-bold flex items-center gap-1 uppercase tracking-wider shrink-0">
                                          <AlertTriangle size={10} /> Pending Activation
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">{account.email} • <span className="text-slate-300 font-medium">{account.department}</span> ({account.position})</p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  {account.is_active ? (
                                    <button
                                      onClick={() => handleToggleActivation(account.id)}
                                      className="px-3.5 py-1.5 rounded-xl bg-slate-500/10 hover:bg-red-500/20 border border-slate-500/20 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                                    >
                                      <XCircle size={13} /> Deactivate
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleToggleActivation(account.id)}
                                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
                                    >
                                      <CheckCircle size={13} /> Activate Account
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </SpotlightCard>

                      {/* Pending Registration Requests (if any) */}
                      {pendingUsers.length > 0 && (
                        <SpotlightCard className="p-5 border-amber-500/30">
                          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-amber-500/20">
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
                              <AlertTriangle size={18} />
                            </div>
                            <div>
                              <h3 className="text-sm font-bold text-white">Pending Registration Requests</h3>
                              <p className="text-[11px] text-slate-400">New self-registered accounts waiting for administrative approval.</p>
                            </div>
                          </div>

                          <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {pendingUsers.map(pu => (
                              <div key={pu.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                                <div>
                                  <p className="text-xs font-bold text-white">{pu.first_name} {pu.last_name} ({pu.email})</p>
                                  <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Role: {pu.role}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleApproveUser(pu.id)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all flex items-center gap-1"
                                  >
                                    <CheckCircle size={13} /> Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectUser(pu.id)}
                                    className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center gap-1"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </SpotlightCard>
                      )}

                    </motion.div>
                  )}

                  {/* DEPARTMENTS CONFIG */}
                  {activeTab === 'departments' && (
                    <motion.div key="departments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <SpotlightCard className="p-5">
                        <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shadow-md">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-white">Organizational Departments</h3>
                              <p className="text-[11px] text-slate-400">Manage defined business units and teams.</p>
                            </div>
                          </div>

                          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-right">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Configured</p>
                            <p className="text-sm font-black text-orange-400">{departmentsList.length}</p>
                          </div>
                        </div>

                        {/* Add Department Input */}
                        <div className="flex gap-2.5 mb-4">
                          <input
                            type="text"
                            placeholder="Enter new department name..."
                            value={newDeptName}
                            onChange={(e) => setNewDeptName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddDepartment()}
                            className={inputClass}
                          />
                          <button
                            onClick={handleAddDepartment}
                            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md active:scale-95"
                          >
                            <Plus size={14} /> Add
                          </button>
                        </div>

                        {/* Department List Grid */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                          {loadingDepts ? (
                            <div className="flex items-center justify-center py-8 text-slate-500 text-xs">
                              <RefreshCw size={15} className="animate-spin mr-2" /> Loading departments...
                            </div>
                          ) : departmentsList.length === 0 ? (
                            <div className="p-6 text-center border border-dashed border-white/10 rounded-xl text-slate-500 text-xs uppercase font-bold tracking-wider">
                              No departments configured. Add one above.
                            </div>
                          ) : (
                            departmentsList.map((dept, i) => (
                              <div key={dept.id || i} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                                  <span className="text-xs font-bold text-white tracking-wide">{dept.name}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteDepartment(dept.id)}
                                  className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  title="Delete Department"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )}

                  {/* SECURITY */}
                  {activeTab === 'security' && (
                    <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <SpotlightCard className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Shield size={18} /></div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wider text-white">Multi-Factor Authentication (2FA)</p>
                              <p className="text-[11px] text-slate-400">Enforce biometrics & TOTP hardware secondary verification.</p>
                            </div>
                          </div>
                          <CustomSwitch active={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
                        </div>
                      </SpotlightCard>

                      <SpotlightCard className="p-5">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400"><Lock size={18} /></div>
                          <div>
                            <h3 className="text-sm font-bold text-white">Password Management</h3>
                            <p className="text-[11px] text-slate-400">Update your primary authentication credentials.</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Password</label>
                            <input
                              type="password"
                              value={oldPassword}
                              onChange={(e) => setOldPassword(e.target.value)}
                              placeholder="Leave empty if demo user"
                              className={inputClass}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">New Password</label>
                              <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={inputClass}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Confirm New Password</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={inputClass}
                              />
                            </div>
                          </div>

                          {passwordError && (
                            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                              <AlertTriangle size={14} />
                              {passwordError}
                            </div>
                          )}
                          {passwordSuccess && (
                            <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                              <Check size={14} />
                              {passwordSuccess}
                            </div>
                          )}

                          <div className="pt-1">
                            <button
                              onClick={handleChangePassword}
                              className="px-4 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-1.5"
                            >
                              <Key size={14} /> Update Password
                            </button>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )}

                  {/* NOTIFICATIONS */}
                  {activeTab === 'notifications' && (
                    <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <SpotlightCard className="p-5">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-md">
                            <Bell size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Communication Channels</h3>
                            <p className="text-[11px] text-slate-400">Configure how and when system alerts dispatch.</p>
                          </div>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            { id: 'email', label: 'Email Notifications', desc: 'Daily activity digests & urgent system logs', icon: Mail },
                            { id: 'push', label: 'Browser Push Notifications', desc: 'Real-time interactive desktop alerts', icon: Smartphone },
                            { id: 'sms', label: 'SMS Security Alerts', desc: 'Critical security dispatch notifications only', icon: MessageSquare }
                          ].map(item => (
                            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                                  <item.icon size={16} />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-white">{item.label}</p>
                                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{item.desc}</p>
                                </div>
                              </div>
                              <CustomSwitch active={notifs[item.id]} onToggle={() => setNotifs({ ...notifs, [item.id]: !notifs[item.id] })} />
                            </div>
                          ))}
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )}

                  {/* AI ENGINE CONFIG */}
                  {activeTab === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <SpotlightCard className="p-5">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-md">
                            <Cpu size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Neural Intelligence Core</h3>
                            <p className="text-[11px] text-slate-400">Manage autonomous background telemetry processing.</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                <Activity size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Predictive Analytics Engine</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Forecasts employee retention & burnout telemetry</p>
                              </div>
                            </div>
                            <CustomSwitch active={aiConfigs.predictive} onToggle={() => setAiConfigs(p => ({ ...p, predictive: !p.predictive }))} />
                          </div>

                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 opacity-50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-slate-500/10 text-slate-500">
                                <Cpu size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Quantum Processing Matrix (Beta)</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Requires Enterprise tier license</p>
                              </div>
                            </div>
                            <CustomSwitch active={false} disabled={true} />
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )}

                  {/* SYSTEM OPERATIONS */}
                  {activeTab === 'system' && (
                    <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                      <SpotlightCard className="p-5">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-md">
                            <Server size={20} />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Low-Level System Operations</h3>
                            <p className="text-[11px] text-slate-400">Manage application cache and session states.</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-red-500/10 hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                                <RefreshCw size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">Purge System Cache & Re-index</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider">Purge local storage, session storage, and refresh</p>
                              </div>
                            </div>
                            <button
                              onClick={handleClearCache}
                              className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                            >
                              Clear Cache
                            </button>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            )}

            {/* COMPACT FOOTER ACTION */}
            <div className="pt-3 shrink-0 border-t border-white/5 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Settings take effect immediately upon sync.</span>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 ml-auto"
              >
                {isSyncing ? <Activity size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{isSyncing ? 'Syncing...' : 'Save Settings'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}