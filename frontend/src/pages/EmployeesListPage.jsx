import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Edit2, Trash2, Eye, Download, Upload,
  Briefcase, MapPin, Shield
} from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { employeesService } from '../services/employees';
import EmployeeModal from '../components/employees/EmployeeModal';
import EmployeeDetailModal from '../components/employees/EmployeeDetailModal';
import api from '../services/api';

const textPrimary = "text-white";
const textSecondary = "text-slate-400";

const glassCardStyle = `
  bg-[#0a0a0c]/70 
  backdrop-blur-2xl 
  border border-white/5 
  shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] 
  rounded-[32px]
`;

// --- ANIMATION VARIANTS ---
const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20, mass: 1 }
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

// --- PREMIUM SUB-COMPONENTS ---
const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null);
  const position = { x: useMotionValue(0), y: useMotionValue(0) };

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    position.x.set(e.clientX - rect.left);
    position.y.set(e.clientY - rect.top);
  };

  return (
    <motion.div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group ${className}`}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0"
        style={{
          background: useTransform(
            [position.x, position.y],
            ([x, y]) => `radial-gradient(800px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.08), transparent 40%)`
          ),
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
};

const ThemedBackground = () => (
  <>
    <div className="fixed inset-0 z-[1] pointer-events-none opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[900px] h-[900px] rounded-full blur-[140px] opacity-30 mix-blend-screen" />
      <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#db2777", "#7c3aed", "#db2777"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[20%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-30 mix-blend-screen" />
    </div>
  </>
);

// --- MAIN PAGE ---
export default function EmployeesListPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedDetailEmployee, setSelectedDetailEmployee] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, [searchQuery, departmentFilter, statusFilter]);

  const loadEmployees = async () => {
    setLoading(true);
    const params = { status: statusFilter };
    if (searchQuery) params.search = searchQuery;
    if (departmentFilter) params.department = departmentFilter;
    try {
      const data = await employeesService.list(params);
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await employeesService.getDepartments();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (e) => {
    setEditingEmployee(e);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm('Delete this employee record?')) {
      await employeesService.delete(id);
      loadEmployees();
    }
  };

  const handleSaveEmployee = async (data, cvFile) => {
    let saved = null;
    if (editingEmployee) {
      saved = await employeesService.update(editingEmployee.id, data);
    } else {
      saved = await employeesService.create(data);
    }

    if (cvFile && saved && saved.id) {
      const uploadForm = new FormData();
      uploadForm.append('file', cvFile);
      try {
        await api.post(`/employees/${saved.id}/cv`, uploadForm, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch (err) {
        console.error('Failed to upload CV:', err);
      }
    }

    setShowModal(false);
    loadEmployees();
  };

  const handleImportData = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/employees/import-employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.detail || 'Import successful');
      loadEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to import data. Please check file format.');
    } finally {
      setLoading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (departmentFilter) params.append('department', departmentFilter);

      const response = await api.get(`/employees/export/excel?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSyncToRepo = async () => {
    setIsSyncing(true);
    try {
      const response = await api.post('/employees/sync-github');
      alert(response.data.detail || 'Successfully synced to GitHub repository');
      loadEmployees();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || 'Failed to sync to GitHub. Check environment variables.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] font-sans overflow-x-hidden overflow-y-auto custom-scrollbar selection:bg-violet-500/30 pb-24">
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <ThemedBackground />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative z-10 p-6 lg:p-10 mx-auto space-y-8">

        {/* PREMIUM HEADER */}
        <motion.div variants={fadeInUp} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
          <div className="flex flex-col">
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 w-fit shadow-[inset_0_1px_0px_rgba(255,255,255,0.05)]">
              <Users size={12} className="text-violet-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">Human Resources</span>
            </div>
            <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter ${textPrimary} pb-1`}>
              Employee{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-orange-400">
                Directory
              </span>
            </h1>
            <p className={`mt-3 text-lg ${textSecondary} max-w-2xl font-medium`}>
              Manage active nodes and personnel data at Hash# Solutions.
            </p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            <button onClick={() => document.getElementById('import-data-input').click()} className="flex-1 md:flex-none h-12 px-6 rounded-full bg-white/5 backdrop-blur-md text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] hover:bg-white/10 transition-all active:scale-95 whitespace-nowrap">
              <Download size={16} /> Import Data
            </button>
            <input id="import-data-input" type="file" className="sr-only" accept=".xlsx, .xls, .csv, .json" onChange={handleImportData} />
            <button onClick={handleExport} disabled={isExporting} className={`flex-1 md:flex-none h-12 px-6 rounded-full bg-white/5 backdrop-blur-md text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] transition-all whitespace-nowrap ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 active:scale-95'}`}>
              {isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload size={16} />}
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
            <button onClick={handleSyncToRepo} disabled={isSyncing} className={`flex-1 md:flex-none h-12 px-6 rounded-full bg-white/5 backdrop-blur-md text-white font-bold text-sm flex items-center justify-center gap-2 border border-white/10 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] transition-all whitespace-nowrap ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 active:scale-95'}`}>
              {isSyncing ? <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin" /> : <Shield size={16} className="text-violet-400" />}
              {isSyncing ? 'Syncing...' : 'Sync Repo'}
            </button>
            <button
              onClick={handleAddEmployee}
              className="flex-1 md:flex-none h-12 px-6 rounded-full bg-white text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              <Plus size={16} /> Add Record
            </button>
          </div>
        </motion.div>

        {/* MAIN DIRECTORY TABLE */}
        <motion.div variants={fadeInUp}>
          <SpotlightCard className={`p-2 md:p-4 ${glassCardStyle}`}>

            {/* TABS */}
            <div className="flex gap-4 mb-4 px-4 pt-4 border-b border-white/5 pb-0">
              <button
                onClick={() => setStatusFilter('active')}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${statusFilter === 'active' ? 'text-violet-400 border-violet-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              >
                Active Employees
              </button>
              <button
                onClick={() => setStatusFilter('alumni')}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider transition-colors border-b-2 ${statusFilter === 'alumni' ? 'text-orange-400 border-orange-400' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
              >
                Alumni
              </button>
            </div>

            {/* CONTROLS (Search & Filter) */}
            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 pt-2">
              <div className="relative w-full md:w-80 flex items-center group">
                <Search className="absolute left-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" size={16} />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search network..."
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 hover:border-white/10 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                />
              </div>

              <div className="relative w-full md:w-56 group">
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="w-full bg-[#121214] border border-white/5 rounded-2xl py-3 px-4 text-sm text-slate-300 hover:border-white/10 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#121214]">Global Departments</option>
                  {departments.map(d => (
                    <option key={d.name} value={d.name} className="bg-[#121214]">{d.name}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-white transition-colors">
                  <Shield size={14} />
                </div>
              </div>
            </div>

            {/* TABLE AREA */}
            <div className="overflow-x-auto custom-scrollbar px-4 pb-4">
              <div className="min-w-[900px]">

                {/* TABLE HEADER */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/10 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="col-span-4">Identity</div>
                  <div className="col-span-2">Department</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-white">
                    <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-400 rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-violet-400 animate-pulse">Syncing Database...</p>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-slate-500/50 border-2 border-dashed border-white/5 rounded-[24px] m-4">
                    <Users size={32} className="mb-4 opacity-30" />
                    <p className="text-xs font-bold tracking-widest uppercase">No Records Found</p>
                  </div>
                ) : (
                  <div className="space-y-1 mt-2">
                    {employees.map((emp, i) => (
                      <div
                        key={emp.id}
                        className="grid grid-cols-12 gap-4 items-center px-6 py-4 rounded-[20px] border border-transparent hover:border-white/5 hover:bg-white/[0.02] transition-all group"
                      >
                        {/* IDENTITY */}
                        <div className="col-span-4 flex items-center gap-4 cursor-pointer" onClick={() => setSelectedDetailEmployee(emp)}>
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${i % 2 === 0 ? 'from-violet-500 to-orange-500' : 'from-pink-500 to-fuchsia-500'} flex items-center justify-center text-white font-black text-xs shadow-[inset_0_1px_0px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform`}>
                            {emp.first_name[0]}{emp.last_name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[14px] font-bold text-white truncate">{emp.first_name} {emp.last_name}</p>
                            <p className="text-[11px] font-medium text-slate-400 truncate">{emp.email}</p>
                          </div>
                        </div>

                        {/* DEPARTMENT */}
                        <div className="col-span-2 flex items-center gap-2 text-[13px] text-slate-300 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-violet-400 transition-colors" />
                          {emp.department}
                        </div>

                        {/* ROLE */}
                        <div className="col-span-2 flex items-center gap-2 text-[13px] text-slate-300 font-medium">
                          <Briefcase size={12} className="text-slate-500" />
                          {emp.role}
                        </div>

                        {/* LOCATION */}
                        <div className="col-span-2 flex items-center gap-2 text-[13px] text-slate-400">
                          <MapPin size={12} className="text-slate-500" />
                          {emp.location || 'Remote'}
                        </div>

                        {/* STATUS */}
                        <div className="col-span-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] ${emp.status === 'active'
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {emp.status}
                          </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="col-span-1 flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setSelectedDetailEmployee(emp)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="View Record"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEditEmployee(emp)}
                            className="p-2 text-slate-400 hover:text-violet-400 hover:bg-violet-400/10 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(emp.id)}
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </SpotlightCard>
        </motion.div>
      </motion.div>

      {/* RETAINED MODAL LOGIC */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onClose={() => setShowModal(false)}
        />
      )}

      {selectedDetailEmployee && (
        <EmployeeDetailModal
          employee={selectedDetailEmployee}
          onClose={() => setSelectedDetailEmployee(null)}
        />
      )}
    </div>
  );
}

/* ENDS HERE */
/* Checked - HARSHIT SRIVASTAVA (Harshit@akiyam.in) */