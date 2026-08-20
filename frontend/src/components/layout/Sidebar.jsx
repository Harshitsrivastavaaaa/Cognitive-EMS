import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban,
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  ClipboardCheck,
  Calendar,
  Banknote,
  FileText,
  UserPlus,
  UserMinus
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import AkiyamLogo from '../../assets/logo.png'

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/employees', label: 'Employees', icon: Users },
    { path: '/projects', label: 'Projects', icon: FolderKanban },
    { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/salary', label: 'Salary', icon: Banknote },
    { path: '/leave-management', label: 'Leave Approvals', icon: Calendar },
    { path: '/onboarding', label: 'Onboarding', icon: UserPlus },
    { path: '/offboarding', label: 'Offboarding', icon: UserMinus },
    { path: '/documents', label: 'Documents', icon: FileText },
    { path: '/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 80 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative z-45 h-screen bg-white/80 backdrop-blur-xl border-r border-slate-200/80 flex flex-col shrink-0 overflow-hidden shadow-sm"
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-200/80 justify-between">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src={AkiyamLogo} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-black tracking-tight text-slate-900 whitespace-nowrap"
            >
              Hash# <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-bold">EMS</span>
            </motion.span>
          )}
        </div>

        {/* Toggle arrow */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg border border-slate-200 bg-slate-100/60 hover:bg-slate-200/70 text-slate-500 hover:text-slate-900 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group
              ${isActive 
                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-600 font-bold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'}`
            }
          >
            <item.icon size={18} className="shrink-0 transition-transform group-hover:scale-105" />
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout button */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-500/10 border border-transparent transition-all group"
        >
          <LogOut size={18} className="shrink-0 transition-transform group-hover:-translate-x-0.5" />
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap"
            >
              Sign Out
            </motion.span>
          )}
        </button>
      </div>
    </motion.aside>
  )
}
