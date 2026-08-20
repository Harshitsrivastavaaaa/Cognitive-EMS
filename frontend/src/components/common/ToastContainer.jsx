import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useApp } from '../../context/AppContext'

const getIcon = (type) => {
    switch (type) {
        case 'success': return <CheckCircle2 className="text-emerald-400" size={20} />
        case 'warning': return <AlertTriangle className="text-amber-400" size={20} />
        case 'error': return <AlertTriangle className="text-red-400" size={20} />
        case 'info':
        default: return <Info className="text-blue-400" size={20} />
    }
}

export default function ToastContainer() {
    const { notifications, markNotificationAsRead } = useApp()
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(interval)
    }, [])
    
    const recentNotifications = notifications.filter(n => {
        const age = now - new Date(n.timestamp).getTime()
        return age < 5000 && !n.read
    })

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none w-80">
            <AnimatePresence>
                {recentNotifications.map(notification => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 50, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 50, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="pointer-events-auto bg-[#121214]/95 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl flex gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-orange-500" />
                        
                        <div className="shrink-0 mt-0.5">
                            {getIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-bold truncate">{notification.title || 'Notification'}</h4>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed break-words line-clamp-2">
                                {notification.message}
                            </p>
                        </div>

                        <button 
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="shrink-0 text-slate-500 hover:text-white transition-colors h-fit p-1"
                        >
                            <X size={16} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    )
}
