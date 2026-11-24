import React, { Suspense } from 'react';
import PageLoader from '../common/PageLoader';
import { Outlet, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ToastContainer from '../common/ToastContainer';
import BrandLogo from "../../assets/logo.svg";

export default function MainLayout() {
    const { isAuthenticated, loading } = useAuth();

    // Light Theme Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-900 font-sans">
                <div className="relative flex items-center justify-center w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-r-2 border-blue-500 animate-spin"></div>
                    <motion.img 
                        src={BrandLogo} 
                        alt="Cognitive EMS logo"
                        animate={{ scale: [0.9, 1.05, 0.9], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-10 h-10 object-contain drop-shadow-md"
                    />
                </div>
                <p className="text-blue-600 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
                    Authenticating Workspace...
                </p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="relative flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden selection:bg-blue-500/20">
            
            {/* Dynamic Animated Ambient Background (Light Theme adjusted) */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute top-1/3 -right-32 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            {/* Top Navigation Bar */}
            <Header />
            
            {/* Main Content Area (Padding removed so child pages can stretch to the edges) */}
            <main className="flex-1 overflow-y-auto no-scrollbar relative bg-transparent z-10">
                <Suspense fallback={<PageLoader />}>
                    <Outlet />
                </Suspense>
            </main>

            {/* Global Toasts */}
            <ToastContainer />
        </div>
    );
}