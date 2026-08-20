import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import EmployeePortalSidebar from './EmployeePortalSidebar';
import ToastContainer from '../common/ToastContainer';
import AkiyamLogo from "../../assets/logo.png";

export default function EmployeePortalLayout() {
    const { isAuthenticated, isEmployee, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white font-sans">
                <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-emerald-500/40 animate-spin"></div>
                    <motion.img 
                        src={AkiyamLogo} 
                        alt="Hash# Logo"
                        animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    />
                </div>
                <p className="text-emerald-400 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
                    Loading Portal...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isEmployee) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="relative flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-emerald-500/20">
            {/* Dynamic Animated Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 -right-32 w-96 h-96 bg-teal-300/25 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-sky-300/25 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <EmployeePortalSidebar />
            <main className="flex-1 overflow-y-auto no-scrollbar relative bg-transparent z-10 p-4 lg:p-6">
                <Outlet />
            </main>
            <ToastContainer />
        </div>
    );
}
