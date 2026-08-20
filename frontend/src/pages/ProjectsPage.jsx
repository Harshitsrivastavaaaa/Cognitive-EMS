import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import {
  FolderKanban, Plus, Search, Filter, Edit3, Trash2, Users,
  Calendar, IndianRupee, UserPlus, UserMinus, ShieldCheck, CheckCircle2,
  Clock, AlertCircle, Sparkles, LayoutGrid, Table, ChevronRight, X, Building2
} from 'lucide-react'
import { projectsService } from '../services/projects'
import { employeesService } from '../services/employees'

const glassCardStyle = "bg-[#0a0a0c]/70 backdrop-blur-2xl border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_40px_rgba(0,0,0,0.5)] rounded-[28px]"

const floatingBlob = {
  animate: {
    y: [0, -30, 0],
    x: [0, 15, 0],
    scale: [1, 1.05, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 18, repeat: Infinity, ease: "easeInOut" },
  },
}

const SpotlightCard = ({ children, className = "" }) => {
  const divRef = useRef(null)
  const position = { x: useMotionValue(0), y: useMotionValue(0) }

  const handleMouseMove = (e) => {
    if (!divRef.current) return
    const rect = divRef.current.getBoundingClientRect()
    position.x.set(e.clientX - rect.left)
    position.y.set(e.clientY - rect.top)
  }

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
            ([x, y]) => `radial-gradient(700px circle at ${x}px ${y}px, rgba(234, 88, 12, 0.08), transparent 40%)`
          ),
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}

const statusBadges = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  planning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  on_hold: "bg-purple-500/10 text-purple-400 border-purple-500/20"
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid | table

  // Modals state
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  const [deleteConfirmProject, setDeleteConfirmProject] = useState(null)

  // Project Form Data
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    client_name: '',
    status: 'active',
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    budget: ''
  })

  // Team Form Data
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [projectRoleInput, setProjectRoleInput] = useState('Developer')

  const fetchProjectsAndEmployees = async () => {
    setLoading(true)
    try {
      const [projData, empData] = await Promise.all([
        projectsService.list(),
        employeesService.list()
      ])
      setProjects(projData)
      setEmployees(empData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectsAndEmployees()
  }, [])

  // Filter projects
  const filteredProjects = projects.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.client_name && p.client_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  // Stats calculation
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'active').length
  const totalMembersAllocated = projects.reduce((acc, p) => acc + (p.members_count || 0), 0)
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0)

  // Handlers for Project CRUD
  const handleOpenCreateModal = () => {
    setEditingProject(null)
    setProjectForm({
      name: '',
      description: '',
      client_name: '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      due_date: '',
      budget: ''
    })
    setShowProjectModal(true)
  }

  const handleOpenEditModal = (proj) => {
    setEditingProject(proj)
    setProjectForm({
      name: proj.name || '',
      description: proj.description || '',
      client_name: proj.client_name || '',
      status: proj.status || 'active',
      start_date: proj.start_date || '',
      due_date: proj.due_date || '',
      budget: proj.budget || ''
    })
    setShowProjectModal(true)
  }

  const handleSaveProject = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...projectForm,
        budget: projectForm.budget ? parseFloat(projectForm.budget) : 0.0
      }
      if (editingProject) {
        await projectsService.update(editingProject.id, payload)
      } else {
        await projectsService.create(payload)
      }
      setShowProjectModal(false)
      fetchProjectsAndEmployees()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || "Failed to save project")
    }
  }

  const handleDeleteProject = async (id) => {
    try {
      await projectsService.delete(id)
      setDeleteConfirmProject(null)
      fetchProjectsAndEmployees()
    } catch (err) {
      console.error(err)
      alert("Failed to delete project")
    }
  }

  // Handlers for Team Management
  const handleOpenTeamModal = (proj) => {
    setSelectedProject(proj)
    setSelectedEmployeeId('')
    setProjectRoleInput('Developer')
    setShowTeamModal(true)
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedEmployeeId) return
    try {
      const updated = await projectsService.addMember(selectedProject.id, parseInt(selectedEmployeeId), projectRoleInput)
      setSelectedProject(updated)
      setSelectedEmployeeId('')
      setProjectRoleInput('Developer')
      fetchProjectsAndEmployees()
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.detail || "Failed to add team member")
    }
  }

  const handleRemoveMember = async (employeeId) => {
    try {
      const updated = await projectsService.removeMember(selectedProject.id, employeeId)
      setSelectedProject(updated)
      fetchProjectsAndEmployees()
    } catch (err) {
      console.error(err)
      alert("Failed to remove member")
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050505] text-white p-6 md:p-10 font-sans selection:bg-orange-500/30 overflow-y-auto custom-scrollbar overflow-x-hidden">
      {/* Background Neon Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#7c3aed", "#ea580c", "#7c3aed"] }} transition={{ ...floatingBlob.animate.transition, backgroundColor: { duration: 20, repeat: Infinity, ease: "linear" } }} className="absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full blur-[140px] opacity-20 mix-blend-screen" />
        <motion.div variants={floatingBlob} initial="animate" animate={{ ...floatingBlob.animate, backgroundColor: ["#db2777", "#7c3aed", "#db2777"] }} transition={{ ...floatingBlob.animate.transition, delay: 2, backgroundColor: { duration: 25, repeat: Infinity, ease: "linear" } }} className="absolute top-[30%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-20 mix-blend-screen" />
      </div>

      <div className="relative z-10 w-full space-y-8">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                <FolderKanban size={22} />
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Portfolio & Team Allocations</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Project <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-violet-400">Management</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Create, allocate engineers & designers, track budgets and manage delivery schedules.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold text-sm shadow-[0_0_25px_rgba(234,88,12,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={18} />
            <span>Create New Project</span>
          </button>
        </div>

        {/* METRICS / STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SpotlightCard className={`${glassCardStyle} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Projects</p>
                <h3 className="text-3xl font-black text-white mt-1">{totalProjects}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <FolderKanban size={24} />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className={`${glassCardStyle} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Active Delivery</p>
                <h3 className="text-3xl font-black text-emerald-400 mt-1">{activeProjects}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Clock size={24} />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className={`${glassCardStyle} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Team Allocations</p>
                <h3 className="text-3xl font-black text-violet-400 mt-1">{totalMembersAllocated}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <Users size={24} />
              </div>
            </div>
          </SpotlightCard>

          <SpotlightCard className={`${glassCardStyle} p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-slate-400">Total Portfolio Value</p>
                <h3 className="text-2xl font-black text-white mt-1">₹{totalBudget.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-2xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <IndianRupee size={24} />
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* SEARCH & FILTERS BAR */}
        <div className={`${glassCardStyle} p-4 flex flex-col md:flex-row items-center justify-between gap-4`}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search projects by title, client, or keyword..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#121215] border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-1.5 bg-[#121215] p-1 border border-white/10 rounded-xl">
              {['all', 'active', 'planning', 'completed', 'on_hold'].map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                    statusFilter === st
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-[#121215] p-1 border border-white/10 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg text-slate-400 hover:text-white transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : ''}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg text-slate-400 hover:text-white transition-all ${viewMode === 'table' ? 'bg-white/10 text-white' : ''}`}
                title="Table View"
              >
                <Table size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* PROJECTS CONTAINER */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm mt-4 font-medium">Loading project catalog...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className={`${glassCardStyle} p-16 text-center flex flex-col items-center justify-center`}>
            <div className="p-4 rounded-3xl bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-4">
              <FolderKanban size={40} />
            </div>
            <h3 className="text-xl font-bold text-white">No Projects Found</h3>
            <p className="text-slate-400 text-sm mt-1 max-w-md">
              No projects match your current filter criteria. Create a new project or reset your search filters.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-6 px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all"
            >
              Create Project
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <SpotlightCard key={project.id} className={`${glassCardStyle} p-6 flex flex-col justify-between h-full hover:border-orange-500/30 transition-all`}>
                <div>
                  {/* Status & Client */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${statusBadges[project.status] || statusBadges.active}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                      <Building2 size={12} className="text-slate-500" />
                      {project.client_name || 'Internal'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.name}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4">
                    {project.description || 'No detailed description provided for this project.'}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={14} className="text-orange-400 shrink-0" />
                      <span className="truncate">Due: {project.due_date || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <IndianRupee size={14} className="text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white">₹{(project.budget || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Members Stack */}
                  <div className="flex items-center justify-between bg-[#121215] p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 overflow-hidden">
                        {project.members && project.members.length > 0 ? (
                          project.members.slice(0, 4).map((m, idx) => (
                            <div
                              key={m.id || idx}
                              title={`${m.employee_name} (${m.role_in_project})`}
                              className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-orange-400 text-white flex items-center justify-center font-bold text-[10px] border border-[#121215]"
                            >
                              {m.employee_name.charAt(0)}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-slate-500 italic">No assigned team</div>
                        )}
                      </div>
                      {project.members && project.members.length > 4 && (
                        <span className="text-[10px] text-slate-400 font-bold">+{project.members.length - 4}</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleOpenTeamModal(project)}
                      className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <UserPlus size={14} />
                      <span>Team ({project.members_count || 0})</span>
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => handleOpenEditModal(project)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                      title="Edit Project"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmProject(project)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className={`${glassCardStyle} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#121215] text-xs uppercase tracking-wider text-slate-400 border-b border-white/5">
                  <tr>
                    <th className="p-4 pl-6">Project Name</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Client</th>
                    <th className="p-4">Team Members</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4 text-right pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProjects.map(project => (
                    <tr key={project.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6">
                        <p className="font-bold text-white">{project.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{project.description}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${statusBadges[project.status] || statusBadges.active}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{project.client_name || 'Internal'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleOpenTeamModal(project)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/5 transition-all"
                        >
                          <Users size={14} className="text-orange-400" />
                          <span>{project.members_count || 0} Members</span>
                        </button>
                      </td>
                      <td className="p-4 font-semibold text-emerald-400">${(project.budget || 0).toLocaleString()}</td>
                      <td className="p-4 text-slate-400">{project.due_date || 'N/A'}</td>
                      <td className="p-4 pr-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(project)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmProject(project)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* CREATE / EDIT PROJECT MODAL */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <button
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hash# Mobile Application"
                    value={projectForm.name}
                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                    className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Client / Sponsor</label>
                  <input
                    type="text"
                    placeholder="e.g. Internal Innovation Lab"
                    value={projectForm.client_name}
                    onChange={e => setProjectForm({ ...projectForm, client_name: e.target.value })}
                    className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe project objectives and scope..."
                    value={projectForm.description}
                    onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Status</label>
                    <select
                      value={projectForm.status}
                      onChange={e => setProjectForm({ ...projectForm, status: e.target.value })}
                      className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="active">Active</option>
                      <option value="planning">Planning</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Budget ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={projectForm.budget}
                      onChange={e => setProjectForm({ ...projectForm, budget: e.target.value })}
                      className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input
                      type="date"
                      value={projectForm.start_date}
                      onChange={e => setProjectForm({ ...projectForm, start_date: e.target.value })}
                      className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Due Date</label>
                    <input
                      type="date"
                      value={projectForm.due_date}
                      onChange={e => setProjectForm({ ...projectForm, due_date: e.target.value })}
                      className="w-full bg-[#121215] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-sm shadow-lg hover:from-orange-600 hover:to-pink-600"
                  >
                    {editingProject ? 'Save Changes' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MANAGE TEAM MEMBERS MODAL */}
      <AnimatePresence>
        {showTeamModal && selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">Team Allocations</span>
                  <h3 className="text-xl font-bold text-white mt-0.5">{selectedProject.name}</h3>
                </div>
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5"
                >
                  <X size={18} />
                </button>
              </div>

              {/* ADD EMPLOYEE TO PROJECT FORM */}
              <form onSubmit={handleAddMember} className="bg-[#121215] p-4 rounded-2xl border border-white/10 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <UserPlus size={16} className="text-orange-400" />
                  Assign Employee to Project
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <select
                      required
                      value={selectedEmployeeId}
                      onChange={e => setSelectedEmployeeId(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.first_name} {emp.last_name} ({emp.role} - {emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Project Role (e.g. Lead, QA)"
                      value={projectRoleInput}
                      onChange={e => setProjectRoleInput(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-all"
                  >
                    Assign to Team
                  </button>
                </div>
              </form>

              {/* CURRENT MEMBERS LIST */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Currently Assigned Members ({selectedProject.members?.length || 0})
                </h4>

                {selectedProject.members && selectedProject.members.length > 0 ? (
                  <div className="space-y-2">
                    {selectedProject.members.map(member => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#121215] border border-white/5 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-orange-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                            {member.employee_name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{member.employee_name}</p>
                            <p className="text-xs text-slate-400">
                              {member.employee_role} • <span className="text-orange-400 font-semibold">{member.role_in_project}</span>
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveMember(member.employee_id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remove from project"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic py-4 text-center">No members assigned to this project yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 text-center space-y-4 shadow-2xl"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white">Delete Project?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <span className="text-white font-semibold">"{deleteConfirmProject.name}"</span>? This action will remove all team member allocations and project records.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmProject(null)}
                  className="px-5 py-2 rounded-xl border border-white/10 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteProject(deleteConfirmProject.id)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
