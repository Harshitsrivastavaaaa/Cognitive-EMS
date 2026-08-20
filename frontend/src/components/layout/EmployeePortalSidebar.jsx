import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home,
  UserCircle, 
  ClipboardCheck,
  FolderKanban,
  Calendar,
  FileText,
  LogOut, 
  ChevronLeft, 
  ChevronRight,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { useAuth } from '../../context/AuthContext'
import AkiyamLogo from '../../assets/logo.png'

export default function EmployeePortalSidebar() {
  const { sidebarCollapsed, toggleSidebar } = useApp()
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const navItems = [
    { path: '/employee-portal', label: 'Dashboard', icon: Home, end: true },
    { path: '/employee-portal/profile', label: 'My Profile', icon: UserCircle },
    { path: '/employee-portal/documents', label: 'My Documents', icon: FileText },
    { path: '/employee-portal/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/employee-portal/projects', label: 'My Projects', icon: FolderKanban },
    { path: '/employee-portal/leave', label: 'Leave / PTO', icon: Calendar },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="relative z-50 w-full h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between shadow-sm shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/employee-portal')}>
        <img src={AkiyamLogo} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
        <span className="text-sm font-black tracking-tight text-slate-900 hidden sm:inline-block">
          Hash# <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 font-bold">Portal</span>
        </span>
      </div>

      {/* Nav list */}
      <nav className="flex items-center gap-1 mx-2 lg:mx-4 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all group
              ${isActive 
                ? 'bg-emerald-600/10 border border-emerald-500/30 text-emerald-600 font-bold shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'}`
            }
          >
            <item.icon size={15} className="shrink-0 transition-transform group-hover:scale-110" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout button */}
      <div className="flex items-center gap-3 shrink-0">
        {user && (
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-[10px] shrink-0">
              {(user.first_name || user.firstName || '?')[0]}{(user.last_name || user.lastName || '?')[0]}
            </div>
            <span className="text-xs font-bold text-slate-800">{user.first_name || user.firstName}</span>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-500/10 border border-slate-200 transition-all group"
        >
          <LogOut size={15} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline-block">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
