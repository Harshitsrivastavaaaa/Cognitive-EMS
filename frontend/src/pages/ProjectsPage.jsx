import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, Plus, Search, Edit3, Trash2, Users,
  Calendar, IndianRupee, UserPlus, UserMinus, AlertCircle,
  LayoutGrid, Table, X, Building2, Clock
} from 'lucide-react';
import { projectsService } from '../services/projects';
import { employeesService } from '../services/employees';

// Simplified Glass Theme
const glassCardStyle = "bg-white/80 border border-slate-200 shadow-sm backdrop-blur-lg rounded-2xl";
const glassHoverStyle = "hover:border-blue-400/50 hover:shadow-md transition-all duration-300";

// Status badges matching dashboard palette
const statusBadges = {
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  planning: "bg-amber-50 text-amber-700 border border-amber-200",
  completed: "bg-blue-50 text-blue-700 border border-blue-200",
  on_hold: "bg-slate-100 text-slate-700 border border-slate-200"
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); 

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null);

  // Forms
  const [projectForm, setProjectForm] = useState({
    name: '', description: '', client_name: '', status: 'active',
    start_date: new Date().toISOString().split('T')[0], due_date: '', budget: ''
  });
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [projectRoleInput, setProjectRoleInput] = useState('Developer');

  const fetchProjectsAndEmployees = async () => {
    setLoading(true);
    try {
      const [projData, empData] = await Promise.all([
        projectsService.list().catch(() => []),
        employeesService.list().catch(() => [])
      ]);
      setProjects(projData || []);
      setEmployees(empData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndEmployees();
  }, []);

  const safeProjects = Array.isArray(projects) ? projects : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const filteredProjects = safeProjects.filter(p => {
    const pStatus = p.status || 'active';
    const matchesStatus = statusFilter === 'all' || pStatus === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    
    const matchesSearch = (p.name || '').toLowerCase().includes(searchLower) ||
                          (p.client_name || '').toLowerCase().includes(searchLower) ||
                          (p.description || '').toLowerCase().includes(searchLower);
                         
    return matchesStatus && matchesSearch;
  });

  const totalProjects = safeProjects.length;
  const activeProjects = safeProjects.filter(p => (p.status || 'active') === 'active').length;
  const totalMembersAllocated = safeProjects.reduce((acc, p) => acc + Number(p.members_count || 0), 0);
  const totalBudget = safeProjects.reduce((acc, p) => acc + Number(p.budget || 0), 0);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setProjectForm({
      name: '', description: '', client_name: '', status: 'active',
      start_date: new Date().toISOString().split('T')[0], due_date: '', budget: ''
    });
    setShowProjectModal(true);
  };

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      name: proj.name || '', description: proj.description || '', client_name: proj.client_name || '',
      status: proj.status || 'active', start_date: proj.start_date || '', due_date: proj.due_date || '',
      budget: proj.budget || ''
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...projectForm, budget: projectForm.budget ? parseFloat(projectForm.budget) : 0.0 };
      if (editingProject) await projectsService.update(editingProject.id, payload);
      else await projectsService.create(payload);
      setShowProjectModal(false);
      fetchProjectsAndEmployees();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to save project");
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await projectsService.delete(id);
      setDeleteConfirmProject(null);
      fetchProjectsAndEmployees();
    } catch (err) {
      alert("Failed to delete project");
    }
  };

  const handleOpenTeamModal = (proj) => {
    setSelectedProject(proj);
    setSelectedEmployeeId('');
    setProjectRoleInput('Developer');
    setShowTeamModal(true);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;
    try {
      const updated = await projectsService.addMember(selectedProject.id, parseInt(selectedEmployeeId), projectRoleInput);
      setSelectedProject(updated);
      setSelectedEmployeeId('');
      setProjectRoleInput('Developer');
      fetchProjectsAndEmployees();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to add team member");
    }
  };

  const handleRemoveMember = async (employeeId) => {
    try {
      const updated = await projectsService.removeMember(selectedProject.id, employeeId);
      setSelectedProject(updated);
      fetchProjectsAndEmployees();
    } catch (err) {
      alert("Failed to remove member");
    }
  };

  return (
    <motion.div 
      className="w-full h-full p-6 lg:p-10 text-slate-900 space-y-8 pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* HEADER BAR */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-slate-500 text-xs font-semibold">
            <FolderKanban size={14} className="text-blue-600" />
            <span className="uppercase tracking-widest">Portfolio & Allocations</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Project <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Create projects, allocate engineers, track budgets and manage schedules.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Create Project</span>
        </button>
      </motion.div>

      {/* METRICS / STATS CARDS */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Projects", value: totalProjects, icon: FolderKanban, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Active Delivery", value: activeProjects, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50" },
          { title: "Team Allocations", value: totalMembersAllocated, icon: Users, color: "text-violet-600", bg: "bg-violet-50" },
          { title: "Portfolio Value", value: `₹${Number(totalBudget || 0).toLocaleString()}`, icon: IndianRupee, color: "text-amber-600", bg: "bg-amber-50" }
        ].map((stat, idx) => (
          <div key={idx} className={`${glassCardStyle} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={20} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
          </div>
        ))}
      </motion.div>

      {/* SEARCH & FILTERS BAR */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by title, client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 shadow-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1 bg-white/80 backdrop-blur-lg p-1 border border-slate-200 rounded-xl shadow-sm">
            {['all', 'active', 'planning', 'completed', 'on_hold'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === st ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-white/80 backdrop-blur-lg p-1 border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              title="Table View"
            >
              <Table size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* PROJECTS CONTAINER */}
      <motion.div variants={itemVariants}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm mt-4 font-medium tracking-wide">Loading catalog...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`${glassCardStyle} p-16 text-center flex flex-col items-center`}>
            <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-4">
              <FolderKanban size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Projects Found</h3>
            <p className="text-slate-500 text-sm mt-1 max-w-sm">
              No projects match your current filters. Create a new one or clear your search.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div key={project.id} className={`${glassCardStyle} ${glassHoverStyle} p-6 flex flex-col justify-between h-full`}>
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadges[project.status || 'active'] || statusBadges.active}`}>
                      {(project.status || 'active').replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Building2 size={12} className="text-slate-400" />
                      {project.client_name || 'Internal'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{project.name || 'Unnamed Project'}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-5">
                    {project.description || 'No detailed description provided.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar size={14} className="text-slate-400" />
                      <span className="truncate">Due: {project.due_date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <IndianRupee size={14} className="text-emerald-500" />
                      <span className="font-semibold text-slate-900">₹{Number(project.budget || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {Array.isArray(project.members) && project.members.length > 0 ? (
                          project.members.slice(0, 4).map((m, idx) => (
                            <div key={m.id || idx} title={m.employee_name} className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border-2 border-white">
                              {(m.employee_name || 'U').charAt(0)}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 px-1">No team assigned</div>
                        )}
                      </div>
                      {Array.isArray(project.members) && project.members.length > 4 && (
                        <span className="text-[10px] text-slate-500 font-bold">+{project.members.length - 4}</span>
                      )}
                    </div>
                    <button onClick={() => handleOpenTeamModal(project)} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors">
                      <UserPlus size={14} /> Manage
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-1 pt-1">
                    <button onClick={() => handleOpenEditModal(project)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => setDeleteConfirmProject(project)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className={`${glassCardStyle} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4 pl-6 font-semibold">Project Name</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Team Members</th>
                    <th className="p-4 font-semibold">Budget</th>
                    <th className="p-4 font-semibold">Due Date</th>
                    <th className="p-4 text-right pr-6 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-slate-900">{project.name || 'Unnamed Project'}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{project.description}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadges[project.status || 'active'] || statusBadges.active}`}>
                          {(project.status || 'active').replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{project.client_name || 'Internal'}</td>
                      <td className="p-4">
                        <button onClick={() => handleOpenTeamModal(project)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors">
                          <Users size={14} className="text-blue-600" /> {project.members_count || 0} Members
                        </button>
                      </td>
                      <td className="p-4 font-medium text-emerald-600">₹{Number(project.budget || 0).toLocaleString()}</td>
                      <td className="p-4 text-slate-500 text-sm">{project.due_date || 'N/A'}</td>
                      <td className="p-4 pr-6 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleOpenEditModal(project)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit3 size={16} /></button>
                          <button onClick={() => setDeleteConfirmProject(project)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>

      {/* CREATE / EDIT PROJECT MODAL */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xl font-bold text-slate-900">{editingProject ? 'Edit Project' : 'Create New Project'}</h3>
                <button onClick={() => setShowProjectModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"><X size={18} /></button>
              </div>
              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Project Title</label>
                  <input type="text" required placeholder="e.g. Mobile App" value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Client / Sponsor</label>
                  <input type="text" placeholder="e.g. Internal Lab" value={projectForm.client_name} onChange={e => setProjectForm({ ...projectForm, client_name: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea rows={3} placeholder="Project objectives..." value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
                    <select value={projectForm.status} onChange={e => setProjectForm({ ...projectForm, status: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20">
                      <option value="active">Active</option>
                      <option value="planning">Planning</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Budget (₹)</label>
                    <input type="number" placeholder="e.g. 50000" value={projectForm.budget} onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input type="date" value={projectForm.start_date} onChange={e => setProjectForm({ ...projectForm, start_date: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Due Date</label>
                    <input type="date" value={projectForm.due_date} onChange={e => setProjectForm({ ...projectForm, due_date: e.target.value })} className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowProjectModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm">{editingProject ? 'Save' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE TEAM MEMBERS MODAL */}
      <AnimatePresence>
        {showTeamModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Team Allocations</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{selectedProject.name || 'Unnamed Project'}</h3>
                </div>
                <button onClick={() => setShowTeamModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"><X size={18} /></button>
              </div>

              <form onSubmit={handleAddMember} className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
                  <UserPlus size={16} className="text-blue-600" /> Assign Employee
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <select required value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                      <option value="">Select Employee...</option>
                      {safeEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.first_name || ''} {emp.last_name || ''} ({emp.role || 'No Role'})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input type="text" placeholder="Role (e.g. QA)" value={projectRoleInput} onChange={e => setProjectRoleInput(e.target.value)} className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm">Assign</button>
                </div>
              </form>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Currently Assigned ({selectedProject.members?.length || 0})</h4>
                {Array.isArray(selectedProject.members) && selectedProject.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProject.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between p-3 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">{(member.employee_name || 'U').charAt(0)}</div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{member.employee_name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{member.employee_role || 'No role'} • <span className="text-blue-600 font-semibold">{member.role_in_project || 'Member'}</span></p>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveMember(member.employee_id)} className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"><UserMinus size={18} /></button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">No members assigned yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto"><AlertCircle size={28} /></div>
              <h3 className="text-xl font-bold text-slate-900">Delete Project?</h3>
              <p className="text-sm text-slate-600">Are you sure you want to delete <span className="text-slate-900 font-semibold">"{deleteConfirmProject.name || 'this project'}"</span>?</p>
              <div className="flex justify-center gap-3 pt-4">
                <button onClick={() => setDeleteConfirmProject(null)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold">Cancel</button>
                <button onClick={() => handleDeleteProject(deleteConfirmProject.id)} className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-sm">Confirm Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}