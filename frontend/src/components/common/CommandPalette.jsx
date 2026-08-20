import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  ClipboardCheck, 
  Settings, 
  Calendar, 
  UserCircle, 
  LogOut, 
  ArrowRight,
  Sparkles,
  Building2,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { employeesService } from '../../services/employees'
import { projectsService } from '../../services/projects'

export default function CommandPalette({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const [employees, setEmployees] = useState([])
  const [projects, setProjects] = useState([])
  const { role, isEmployee, logout } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      loadData()
    } else {
      setQuery('')
    }
  }, [isOpen])

  const loadData = async () => {
    try {
      const [empList, projList] = await Promise.all([
        employeesService.list().catch(() => []),
        projectsService.list().catch(() => [])
      ])
      setEmployees(empList || [])
      setProjects(projList || [])
    } catch (e) {
      // Ignore background fetch errors
    }
  }

  if (!isOpen) return null

  // Define commands based on role
  const employerNav = [
    { id: 'dash', title: 'Dashboard', category: 'Navigation', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'emp', title: 'Employees List', category: 'Navigation', icon: Users, path: '/employees' },
    { id: 'proj', title: 'Projects Matrix', category: 'Navigation', icon: FolderKanban, path: '/projects' },
    { id: 'att', title: 'Attendance Telemetry', category: 'Navigation', icon: ClipboardCheck, path: '/attendance' },
    { id: 'leave-admin', title: 'Leave Approvals', category: 'Navigation', icon: Calendar, path: '/leave-management' },
    { id: 'set', title: 'System Settings', category: 'Navigation', icon: Settings, path: '/settings' },
  ]

  const employeeNav = [
    { id: 'emp-dash', title: 'My Dashboard', category: 'Navigation', icon: LayoutDashboard, path: '/employee-portal' },
    { id: 'emp-prof', title: 'My Profile', category: 'Navigation', icon: UserCircle, path: '/employee-portal/profile' },
    { id: 'emp-att', title: 'My Attendance', category: 'Navigation', icon: ClipboardCheck, path: '/employee-portal/attendance' },
    { id: 'emp-proj', title: 'My Projects', category: 'Navigation', icon: FolderKanban, path: '/employee-portal/projects' },
    { id: 'emp-leave', title: 'My Leave / PTO', category: 'Navigation', icon: Calendar, path: '/employee-portal/leave' },
  ]

  const navCommands = isEmployee ? employeeNav : employerNav

  // Filter items
  const cleanQ = query.toLowerCase().trim()

  const filteredNav = navCommands.filter(c => c.title.toLowerCase().includes(cleanQ))

  const filteredEmployees = employees.filter(e => 
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(cleanQ) ||
    (e.role && e.role.toLowerCase().includes(cleanQ)) ||
    (e.department && e.department.toLowerCase().includes(cleanQ))
  ).slice(0, 4)

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(cleanQ) ||
    (p.client_name && p.client_name.toLowerCase().includes(cleanQ))
  ).slice(0, 4)

  const handleSelect = (action) => {
    onClose()
    if (action.path) {
      navigate(action.path)
    } else if (action.onTrigger) {
      action.onTrigger()
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="relative w-full max-w-2xl bg-[#0a0a0c]/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-2xl text-white z-10"
        >
          {/* Search Header */}
          <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
            <Search size={18} className="text-violet-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search commands, employees, projects, or pages... (Esc to close)"
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search Results / Action List */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-4 no-scrollbar">
            {/* Quick Navigation Section */}
            {filteredNav.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={11} className="text-violet-400" /> Pages & Navigation
                </div>
                <div className="mt-1 space-y-1">
                  {filteredNav.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-violet-500/10 hover:border-violet-500/20 border border-transparent transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className="text-slate-400 group-hover:text-violet-400 transition-colors" />
                        <span>{item.title}</span>
                      </div>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-violet-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Employees Search Results */}
            {cleanQ && filteredEmployees.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Users size={11} className="text-orange-400" /> Employees
                </div>
                <div className="mt-1 space-y-1">
                  {filteredEmployees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => handleSelect({ path: isEmployee ? `/employee-portal/profile` : `/employees/${emp.id}` })}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/20 border border-transparent transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[10px] flex items-center justify-center">
                          {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div className="text-left">
                          <p className="text-white text-xs font-semibold">{emp.first_name} {emp.last_name}</p>
                          <p className="text-[10px] text-slate-500">{emp.role} · {emp.department}</p>
                        </div>
                      </div>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Search Results */}
            {cleanQ && filteredProjects.length > 0 && (
              <div>
                <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FolderKanban size={11} className="text-emerald-400" /> Projects
                </div>
                <div className="mt-1 space-y-1">
                  {filteredProjects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => handleSelect({ path: isEmployee ? `/employee-portal/projects` : `/projects` })}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 border border-transparent transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <FolderKanban size={15} className="text-emerald-400" />
                        <div className="text-left">
                          <p className="text-white text-xs font-semibold">{proj.name}</p>
                          <p className="text-[10px] text-slate-500">{proj.client_name || 'Internal'} · <span className="uppercase text-emerald-400">{proj.status}</span></p>
                        </div>
                      </div>
                      <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {filteredNav.length === 0 && filteredEmployees.length === 0 && filteredProjects.length === 0 && (
              <div className="py-8 text-center text-slate-500 text-xs">
                No matching results found for "<span className="text-white">{query}</span>"
              </div>
            )}
          </div>

          {/* Footer Shortcut Hint */}
          <div className="px-4 py-2.5 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tip: Use <kbd className="px-1.5 py-0.5 bg-white/10 text-slate-300 rounded font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-white/10 text-slate-300 rounded font-mono text-[10px]">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-white/10 text-slate-300 rounded font-mono text-[10px]">Esc</kbd> Close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
