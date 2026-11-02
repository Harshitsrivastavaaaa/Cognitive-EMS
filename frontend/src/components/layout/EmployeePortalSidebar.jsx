import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home,
  UserCircle,
  ClipboardCheck,
  FolderKanban,
  Calendar,
  FileText,
  LogOut,
  Menu,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import MobileNavDrawer from './MobileNavDrawer'
import AkiyamLogo from '../../assets/logo.png'

const navLinkClass = (isActive) =>
  `flex items-center gap-2 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all group border
  ${isActive
    ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-600 font-bold shadow-2xs'
    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-transparent'}`

export default function EmployeePortalSidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/employee-portal', label: 'Dashboard', icon: Home, end: true },
    { path: '/employee-portal/profile', label: 'My Profile', icon: UserCircle },
    { path: '/employee-portal/documents', label: 'My Documents', icon: FileText },
    { path: '/employee-portal/attendance', label: 'Attendance', icon: ClipboardCheck },
    { path: '/employee-portal/projects', label: 'My Projects', icon: FolderKanban },
    { path: '/employee-portal/leave', label: 'Leave / PTO', icon: Calendar },
  ]

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Close the drawer after navigating; Escape closes it too
  useEffect(() => { setIsMobileNavOpen(false) }, [location.pathname])
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setIsMobileNavOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const brand = (
    <span className="text-sm font-black tracking-tight text-slate-900">
      Hash# <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 font-bold">Portal</span>
    </span>
  )

  return (
    <header className="relative z-50 w-full h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between shadow-sm shrink-0">
      {/* Mobile menu toggle + Brand Header */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => setIsMobileNavOpen(true)}
          className="xl:hidden p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-600"
          aria-label="Open navigation menu"
          aria-expanded={isMobileNavOpen}
        >
          <Menu size={16} />
        </button>
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate('/employee-portal')}>
          <img src={AkiyamLogo} alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="hidden sm:inline-block">{brand}</span>
        </div>
      </div>

      {/* Nav list (wide screens; smaller screens use the drawer) */}
      <nav className="hidden xl:flex items-center gap-1 mx-4 py-1" aria-label="Main">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => `${navLinkClass(isActive)} text-xs`}
          >
            <item.icon size={15} className="shrink-0 transition-transform group-hover:scale-110" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <MobileNavDrawer
        open={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        hiddenAbove="xl"
        brand={brand}
        linkClass={navLinkClass}
        sections={[{ items: navItems }]}
      />

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
