import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, MapPin, FileText, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeModal({ employee, onSave, onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    role: '',
    location: '',
    status: 'active',
  });
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        first_name: employee.first_name || '',
        last_name: employee.last_name || '',
        email: employee.email || '',
        department: employee.department || '',
        role: employee.role || '',
        location: employee.location || '',
        status: employee.status || 'active',
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, cvFile);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg max-h-[90vh] bg-white/90 border border-slate-200 shadow-xl backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden text-slate-900"
        >
          {/* MODAL HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              <h2 className="text-lg font-bold tracking-tight">
                {employee ? 'Edit Personnel Record' : 'New Personnel Record'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* MODAL BODY (Scrollable if content overflows) */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">First Name</label>
                <input
                  required
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Last Name</label>
                <input
                  required
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
              <input
                required
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@hashsolutions.com"
                className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Department</label>
                <input
                  required
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Engineering"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Role / Title</label>
                <input
                  required
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Senior Developer"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Location</label>
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Remote / New York"
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-slate-900 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition-all shadow-sm cursor-pointer"
                >
                  <option value="active">Active</option>
                  <option value="alumni">Alumni</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">CV / Document (Optional)</label>
              <input
                type="file"
                onChange={(e) => setCvFile(e.target.files[0])}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            {/* MODAL FOOTER */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
              >
                Save Record
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}