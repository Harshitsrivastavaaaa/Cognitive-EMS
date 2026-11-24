import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Search, Edit2, Trash2, Eye, Download, Upload,
  Briefcase, MapPin, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import { employeesService } from '../services/employees';
import EmployeeModal from '../components/employees/EmployeeModal';
import EmployeeDetailModal from '../components/employees/EmployeeDetailModal';
import api from '../services/api';

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";

// Simplified Animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
      e.target.value = null; 
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
    <motion.div 
      className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <Users size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Human Resources</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Employee <span className="text-blue-600">Directory</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage active nodes and personnel data at Cognitive EMS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => document.getElementById('import-data-input').click()} 
            className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Download size={16} /> Import Data
          </button>
          <input id="import-data-input" type="file" className="sr-only" accept=".xlsx, .xls, .csv, .json" onChange={handleImportData} />
          
          <button 
            onClick={handleExport} disabled={isExporting} 
            className={`flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
          >
            {isExporting ? <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> : <Upload size={16} />}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
          
          <button 
            onClick={handleSyncToRepo} disabled={isSyncing} 
            className={`flex-1 md:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
          >
            {isSyncing ? <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /> : <Shield size={16} className="text-blue-600" />}
            {isSyncing ? 'Syncing...' : 'Sync Repo'}
          </button>
          
          <button
            onClick={handleAddEmployee}
            className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add Record
          </button>
        </div>
      </motion.div>

      {/* MAIN DIRECTORY AREA */}
      <motion.div variants={itemVariants} className="space-y-6">
        
        {/* TABS */}
        <div className="flex gap-6 border-b border-slate-200">
          <button
            onClick={() => setStatusFilter('active')}
            className={`pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 ${statusFilter === 'active' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            Active Employees
          </button>
          <button
            onClick={() => setStatusFilter('alumni')}
            className={`pb-3 text-sm font-bold tracking-wide transition-colors border-b-2 ${statusFilter === 'alumni' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
          >
            Alumni
          </button>
        </div>

        {/* CONTROLS (Search & Filter) */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-80 flex items-center group">
            <Search className="absolute left-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search network..."
              className="w-full bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
            />
          </div>

          <div className="relative w-full md:w-56 group">
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl py-2.5 px-4 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm appearance-none cursor-pointer"
            >
              <option value="">Global Departments</option>
              {departments.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Shield size={14} />
            </div>
          </div>
        </div>

        {/* TABLE AREA */}
        <div className={`${glassCardStyle} overflow-hidden`}>
          <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* TABLE HEADER */}
            <div className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_112px_112px] gap-4 px-6 py-3.5 border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <div>Identity</div>
              <div>Department</div>
              <div>Role</div>
              <div>Location</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* TABLE BODY */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold tracking-widest uppercase text-slate-400 animate-pulse">Syncing Database...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                <Users size={32} className="mb-3 opacity-50" />
                <p className="text-sm font-semibold">No Records Found</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_minmax(0,2fr)_112px_112px] gap-4 items-center px-6 py-3.5 bg-white/60 hover:bg-white transition-colors group"
                  >
                    {/* IDENTITY */}
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedDetailEmployee(emp)}>
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs font-medium text-slate-500 truncate">{emp.email}</p>
                      </div>
                    </div>

                    {/* DEPARTMENT */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors" />
                      {emp.department}
                    </div>

                    {/* ROLE */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Briefcase size={14} className="text-slate-400" />
                      {emp.role}
                    </div>

                    {/* LOCATION */}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      {emp.location || 'Remote'}
                    </div>

                    {/* STATUS */}
                    <div>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        emp.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${emp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="capitalize">{emp.status}</span>
                      </span>
                    </div>

                    {/* ACTIONS */}
                    {/* Always visible (hover-only actions are unreachable on touch and keyboard) */}
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedDetailEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                        title="View Record"
                        aria-label={`View ${emp.first_name} ${emp.last_name}`}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => handleEditEmployee(emp)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Record"
                        aria-label={`Edit ${emp.first_name} ${emp.last_name}`}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteEmployee(emp.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Record"
                        aria-label={`Delete ${emp.first_name} ${emp.last_name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </motion.div>

      {/* MODALS */}
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
    </motion.div>
  );
}