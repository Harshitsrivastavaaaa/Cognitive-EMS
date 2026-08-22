import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  Settings, LogOut, ChevronDown, Bell, Search,
  LayoutDashboard, Users, FolderKanban, ClipboardCheck,
  Calendar, Banknote, FileText, UserPlus, UserMinus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../../context/AppContext";
import CommandPalette from "../common/CommandPalette";
import AkiyamLogo from "../../assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout: authLogout, user: authUser } = useAuth();
  const [cmdOpen, setCmdOpen] = useState(false);
  
  const user = authUser 
    ? { first_name: authUser.firstName || authUser.first_name || "Harshit", role: authUser.role || "Admin" } 
    : { first_name: "Harshit", role: "Admin" };

  const { notifications, markAllNotificationsAsRead, markNotificationAsRead } = useApp();
  const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

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
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setIsDropdownOpen(false);
    navigate("/settings");
  };

  const logout = () => {
    setIsDropdownOpen(false);
    authLogout();
    navigate('/');
  };

  const currentPath = location.pathname.toLowerCase();
  const hideHeaderRoutes = ["/signin", "/login", "/signup", "/auth", "/"];
  const shouldHideHeader = hideHeaderRoutes.some(route => 
    currentPath === route
  );

  if (shouldHideHeader) {
    return null;
  }

  return (
    <header className="relative z-50 w-full h-16 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 px-4 lg:px-6 flex items-center justify-between shadow-sm shrink-0 font-sans text-slate-900">
      
      {/* 1. Brand Logo & Better Typography Title */}
      <div className="flex items-center gap-3 shrink-0 cursor-pointer group" onClick={() => navigate('/dashboard')}>
        <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200/80 p-1 shadow-sm group-hover:scale-105 transition-transform">
          <img src={AkiyamLogo} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div className="hidden sm:flex items-center gap-1.5 tracking-tight">
          <span className="font-black text-base text-slate-900 tracking-tighter">
            Hash<span className="text-blue-600">#</span>AI
          </span>
          <span className="text-xs font-semibold text-slate-400 border-l border-slate-200 pl-2">
            EMS Platform
          </span>
        </div>
      </div>

      {/* 2. Top Navigation Bar */}
      <nav className="flex items-center gap-1 mx-2 lg:mx-4 overflow-x-auto no-scrollbar py-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all group
              ${isActive 
                ? 'bg-blue-50 border border-blue-200 text-blue-600 font-bold shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'}`
            }
          >
            <item.icon size={15} className="shrink-0 transition-transform group-hover:scale-110" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* 3. Search, Notifications & User Dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setCmdOpen(true)}
          className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 transition-all shadow-sm group"
        >
          <Search size={14} className="group-hover:text-blue-600 transition-colors" />
          <span>Search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-slate-200 rounded text-slate-500 shadow-2xs">Ctrl K</kbd>
        </button>

        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 shadow-sm"
          >
            <Bell size={16} className="text-slate-500 hover:text-slate-900 transition-colors" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-[calc(100%+12px)] right-0 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 text-slate-900"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notifications</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="max-h-64 overflow-y-auto no-scrollbar flex flex-col divide-y divide-slate-100">
                  {(!notifications || notifications.length === 0) ? (
                    <div className="py-8 text-center text-slate-500 text-xs">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice().reverse().map(notif => (
                      <div 
                        key={notif.id} 
                        className={`
                          px-4 py-3 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer
                          ${!notif.read ? 'bg-blue-50/50' : ''}
                        `}
                        onClick={() => markNotificationAsRead(notif.id)}
                      >
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs ${!notif.read ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                            {notif.title || 'Notification'}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 pl-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 transition-all duration-200 group h-[38px] shadow-sm"
          >
            <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
              {user.first_name}
            </span>
            <div className="h-6 w-6 rounded-lg bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              {user.first_name.charAt(0)}
            </div>
            <ChevronDown 
              size={12} 
              className={`text-slate-400 group-hover:text-slate-600 transition-transform duration-300 ease-in-out mr-1 ${isDropdownOpen ? "rotate-180" : ""}`} 
            />
          </button>

          {/* Profile Dropdown Menu */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute top-[calc(100%+12px)] right-0 w-56 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl overflow-hidden z-50 text-slate-900"
              >
                <div className="px-3 py-2.5 mb-1 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Role Node</p>
                  <p className="text-xs font-bold text-slate-900">{user.role}</p>
                </div>
                
                <button onClick={handleSettingsClick} className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all group">
                  <Settings size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                  <span>Workspace Settings</span>
                </button>

                <div className="my-1.5 border-t border-slate-100" />

                <button onClick={logout} className="w-full flex items-center gap-3.5 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-all group">
                  <LogOut size={14} className="text-red-500 group-hover:text-red-600 transition-colors" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </header>
  );
}