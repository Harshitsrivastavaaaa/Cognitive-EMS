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

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

const CustomSwitch = ({ active, onToggle, disabled = false }) => (
  <div
    onClick={disabled ? undefined : onToggle}
    className={`w-10 h-5 rounded-full relative p-0.5 cursor-pointer transition-all duration-300 ${active ? 'bg-blue-600 shadow-sm' : 'bg-slate-300'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
  >
    <motion.div
      animate={{ x: active ? 20 : 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="w-4 h-4 bg-white rounded-full shadow-md"
    />
  </div>
);

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
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

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || user.firstName || '');
      setLastName(user.last_name || user.lastName || '');
      setEmails([user.email || 'admin@hash.ai']);
    }
  }, [user]);

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
    ...(isEmployer ? [{ id: 'accounts', label: 'Employee Provisioning', icon: Key, desc: 'Create & Activate Credentials' }] : []),
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

  const inputClass = "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all";

  return (
    <motion.div 
      className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER SECTION */}
      <motion.div variants={containerVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <Sparkles size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Workspace Control</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Settings & <span className="text-blue-600">Configuration</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">Manage profile parameters, security, and enterprise infrastructure.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? <Activity size={16} className="animate-spin" /> : <Save size={16} />}
            <span>{isSyncing ? 'Syncing...' : 'Save Settings'}</span>
          </button>
        </div>
      </motion.div>

      {/* TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT NAVIGATION SIDEBAR */}
        <motion.div variants={containerVariants} className={`lg:col-span-3 ${glassCardStyle} p-3 space-y-1 shadow-sm`}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group ${
                  isActive
                    ? 'bg-blue-50 border border-blue-200 text-blue-700 font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                }`}
              >
                <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-slate-800'}`}>
                  <tab.icon size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold">{tab.label}</p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </motion.div>

        {/* RIGHT CONTENT VIEWPORT */}
        <motion.div variants={containerVariants} className="lg:col-span-9 max-w-2xl space-y-6">
          {loadingSettings ? (
            <div className={`${glassCardStyle} p-16 text-center`}>
              <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Loading Configuration...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* GENERAL / IDENTITY */}
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    
                    {/* User Banner */}
                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200/60">
                      <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-sm shrink-0">
                        {firstName?.charAt(0) || 'A'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900 truncate">{firstName} {lastName}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck size={12} /> Verified
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{user?.email || 'admin@hash.ai'}</p>
                      </div>
                    </div>

                    {/* Fields */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                        <User size={16} className="text-blue-600" /> Account Profile Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                          <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                          <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="sm:col-span-2 space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Email (Read Only)</label>
                          <input
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className={`${inputClass} bg-slate-100 opacity-60 cursor-not-allowed`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Aliases */}
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                        <Mail size={16} className="text-blue-600" /> Communication Aliases
                      </h4>

                      <div className="space-y-2.5">
                        {emails.map((email, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                            <div className="flex items-center gap-2.5">
                              <Mail size={16} className="text-slate-400" />
                              <span className="text-sm font-semibold text-slate-800">{email}</span>
                              {idx === 0 && (
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                  Primary
                                </span>
                              )}
                            </div>
                            {idx !== 0 && (
                              <button onClick={() => setEmails(emails.filter(e => e !== email))} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center gap-3 pt-2">
                          <input
                            type="email"
                            placeholder="Add secondary communication email..."
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            onClick={() => { if (newEmail) setEmails([...emails, newEmail]); setNewEmail('') }}
                            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                          >
                            <Plus size={16} /> Add
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* EMPLOYEE ACCOUNTS PROVISIONING */}
              {activeTab === 'accounts' && (
                <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* Provision Form Card */}
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Key size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Create Employee Credentials</h3>
                        <p className="text-xs text-slate-500">Generate login credentials and assign profiles for new team members.</p>
                      </div>
                    </div>

                    <form onSubmit={handleProvisionEmployee} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
                          <input
                            type="text"
                            placeholder="e.g. John"
                            value={provisionForm.firstName}
                            onChange={(e) => setProvisionForm({ ...provisionForm, firstName: e.target.value })}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Doe"
                            value={provisionForm.lastName}
                            onChange={(e) => setProvisionForm({ ...provisionForm, lastName: e.target.value })}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Work Email (Employee ID)</label>
                          <input
                            type="email"
                            placeholder="john.doe@hash.in"
                            value={provisionForm.email}
                            onChange={(e) => setProvisionForm({ ...provisionForm, email: e.target.value })}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Password</label>
                          <input
                            type="text"
                            placeholder="Set secure password..."
                            value={provisionForm.password}
                            onChange={(e) => setProvisionForm({ ...provisionForm, password: e.target.value })}
                            className={inputClass}
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Department</label>
                          <input
                            type="text"
                            placeholder="Engineering, Design, etc."
                            value={provisionForm.department}
                            onChange={(e) => setProvisionForm({ ...provisionForm, department: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Position / Role Title</label>
                          <input
                            type="text"
                            placeholder="Software Engineer..."
                            value={provisionForm.roleTitle}
                            onChange={(e) => setProvisionForm({ ...provisionForm, roleTitle: e.target.value })}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">Activate Account Immediately</p>
                            <p className="text-[11px] text-slate-500">If enabled, employee can log in immediately with these credentials.</p>
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
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {provisioning ? <Activity size={16} className="animate-spin" /> : <UserPlus size={16} />}
                        <span>{provisioning ? 'Creating Account...' : 'Create Employee Credentials'}</span>
                      </button>
                    </form>
                  </div>

                  {/* Configured Accounts & Activation Controls */}
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                          <UserCheck size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Employee User Accounts</h3>
                          <p className="text-xs text-slate-500">Manage account status, enable login access, or activate accounts.</p>
                        </div>
                      </div>
                      <button
                        onClick={loadAccountsData}
                        className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors shadow-sm"
                        title="Refresh Accounts List"
                      >
                        <RefreshCw size={16} className={loadingAccounts ? 'animate-spin' : ''} />
                      </button>
                    </div>

                    {loadingAccounts ? (
                      <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                        <RefreshCw size={16} className="animate-spin text-blue-600" /> Loading employee accounts...
                      </div>
                    ) : employeeAccounts.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs uppercase font-bold tracking-wider bg-slate-50/50">
                        No employee accounts created yet. Use the form above to provision credentials.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                        {employeeAccounts.map(account => (
                          <div
                            key={account.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 transition-all gap-4 shadow-sm"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-200">
                                {account.first_name?.charAt(0) || 'E'}
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                  <p className="text-sm font-bold text-slate-900 truncate">{account.first_name} {account.last_name}</p>
                                  {account.is_active ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider shrink-0">
                                      <CheckCircle size={10} /> Active (Can Login)
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider shrink-0">
                                      <AlertTriangle size={10} /> Pending Activation
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-500 truncate">{account.email} • <span className="text-slate-700 font-medium">{account.department}</span> ({account.position})</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {account.is_active ? (
                                <button
                                  onClick={() => handleToggleActivation(account.id)}
                                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
                                >
                                  <XCircle size={14} /> Deactivate
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleActivation(account.id)}
                                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                                >
                                  <CheckCircle size={14} /> Activate Account
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pending Registration Requests (if any) */}
                  {pendingUsers.length > 0 && (
                    <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 border-amber-300 shadow-sm`}>
                      <div className="flex items-center gap-3 border-b border-amber-200 pb-4">
                        <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Pending Registration Requests</h3>
                          <p className="text-xs text-slate-500">New self-registered accounts waiting for administrative approval.</p>
                        </div>
                      </div>

                      <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                        {pendingUsers.map(pu => (
                          <div key={pu.id} className="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{pu.first_name} {pu.last_name} ({pu.email})</p>
                              <p className="text-xs text-amber-700 font-semibold uppercase tracking-wider mt-0.5">Role: {pu.role}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleApproveUser(pu.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1.5"
                              >
                                <CheckCircle size={14} /> Approve
                              </button>
                              <button
                                onClick={() => handleRejectUser(pu.id)}
                                className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200 font-semibold text-xs hover:bg-red-100 transition-colors flex items-center gap-1.5"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              )}

              {/* DEPARTMENTS CONFIG */}
              {activeTab === 'departments' && (
                <motion.div key="departments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                          <Building2 size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">Organizational Departments</h3>
                          <p className="text-xs text-slate-500">Manage defined business units and teams.</p>
                        </div>
                      </div>

                      <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Configured</p>
                        <p className="text-base font-bold text-blue-600">{departmentsList.length}</p>
                      </div>
                    </div>

                    {/* Add Department Input */}
                    <div className="flex gap-3">
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
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
                      >
                        <Plus size={16} /> Add
                      </button>
                    </div>

                    {/* Department List Grid */}
                    <div className="space-y-2.5 max-h-[350px] overflow-y-auto custom-scrollbar pr-1">
                      {loadingDepts ? (
                        <div className="flex items-center justify-center py-12 text-slate-500 text-xs">
                          <RefreshCw size={16} className="animate-spin mr-2 text-blue-600" /> Loading departments...
                        </div>
                      ) : departmentsList.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs uppercase font-bold tracking-wider bg-slate-50/50">
                          No departments configured. Add one above.
                        </div>
                      ) : (
                        departmentsList.map((dept, i) => (
                          <div key={dept.id || i} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-sm group">
                            <div className="flex items-center gap-3">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-sm" />
                              <span className="text-sm font-bold text-slate-900 tracking-wide">{dept.name}</span>
                            </div>
                            <button
                              onClick={() => handleDeleteDepartment(dept.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              title="Delete Department"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SECURITY */}
              {activeTab === 'security' && (
                <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  <div className={`${glassCardStyle} p-6 shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl"><Shield size={20} /></div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Multi-Factor Authentication (2FA)</p>
                          <p className="text-xs text-slate-500">Enforce biometrics & TOTP hardware secondary verification.</p>
                        </div>
                      </div>
                      <CustomSwitch active={twoFactor} onToggle={() => setTwoFactor(!twoFactor)} />
                    </div>
                  </div>

                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl"><Lock size={20} /></div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Password Management</h3>
                        <p className="text-xs text-slate-500">Update your primary authentication credentials.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</label>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Leave empty if demo user"
                          className={inputClass}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm New Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {passwordError && (
                        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                          <AlertTriangle size={16} />
                          {passwordError}
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                          <Check size={16} />
                          {passwordSuccess}
                        </div>
                      )}

                      <div className="pt-2">
                        <button
                          onClick={handleChangePassword}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
                        >
                          <Key size={16} /> Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* NOTIFICATIONS */}
              {activeTab === 'notifications' && (
                <motion.div key="notifications" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Bell size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Communication Channels</h3>
                        <p className="text-xs text-slate-500">Configure how and when system alerts dispatch.</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { id: 'email', label: 'Email Notifications', desc: 'Daily activity digests & urgent system logs', icon: Mail },
                        { id: 'push', label: 'Browser Push Notifications', desc: 'Real-time interactive desktop alerts', icon: Smartphone },
                        { id: 'sms', label: 'SMS Security Alerts', desc: 'Critical security dispatch notifications only', icon: MessageSquare }
                      ].map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                          <div className="flex items-center gap-3.5">
                            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                              <item.icon size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.desc}</p>
                            </div>
                          </div>
                          <CustomSwitch active={notifs[item.id]} onToggle={() => setNotifs({ ...notifs, [item.id]: !notifs[item.id] })} />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* AI ENGINE CONFIG */}
              {activeTab === 'ai' && (
                <motion.div key="ai" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                        <Cpu size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Neural Intelligence Core</h3>
                        <p className="text-xs text-slate-500">Manage autonomous background telemetry processing.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                            <Activity size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Predictive Analytics Engine</p>
                            <p className="text-xs text-slate-500">Forecasts employee retention & burnout telemetry</p>
                          </div>
                        </div>
                        <CustomSwitch active={aiConfigs.predictive} onToggle={() => setAiConfigs(p => ({ ...p, predictive: !p.predictive }))} />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60 opacity-60">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-slate-200 text-slate-600">
                            <Cpu size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Quantum Processing Matrix (Beta)</p>
                            <p className="text-xs text-slate-500">Requires Enterprise tier license</p>
                          </div>
                        </div>
                        <CustomSwitch active={false} disabled={true} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SYSTEM OPERATIONS */}
              {activeTab === 'system' && (
                <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className={`${glassCardStyle} p-6 md:p-8 space-y-6 shadow-sm`}>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl">
                        <Server size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Low-Level System Operations</h3>
                        <p className="text-xs text-slate-500">Manage application cache and session states.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-red-200 hover:border-red-300 transition-all shadow-sm">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200">
                            <RefreshCw size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Purge System Cache & Re-index</p>
                            <p className="text-xs text-slate-500">Purge local storage, session storage, and refresh</p>
                          </div>
                        </div>
                        <button
                          onClick={handleClearCache}
                          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95"
                        >
                          Clear Cache
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}