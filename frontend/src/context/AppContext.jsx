import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [theme, setTheme] = useState('dark')
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Welcome to Cognitive EMS',
            message: 'Your workspace is ready. You can browse the employee directory or view analytics.',
            read: false,
            timestamp: new Date()
        }
    ])

    const toggleSidebar = () => setSidebarCollapsed(prev => !prev)

    const addNotification = (notification) => {
        const id = Date.now()
        setNotifications(prev => [...prev, { ...notification, id, read: false, timestamp: new Date() }])
    }

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const markNotificationAsRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    }

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }

    const value = {
        sidebarCollapsed,
        theme,
        notifications,
        toggleSidebar,
        setTheme,
        addNotification,
        removeNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useApp must be used within AppProvider')
    }
    return context
}
