import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId'))
    const [role, setRole] = useState(localStorage.getItem('userRole') || null)
    const [employeeId, setEmployeeId] = useState(localStorage.getItem('employeeId') || null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (token === 'demo-token') {
            setLoading(false)
            return;
        }

        if (token) {
            // Avoid duplicate fetch if user state is already populated (e.g. freshly logged in)
            if (user && user.email) {
                setLoading(false)
                return;
            }

            authService.getMe(token)
                .then(userData => {
                    setUser(userData)
                    if (userData.role) {
                        setRole(userData.role)
                        localStorage.setItem('userRole', userData.role)
                    }
                    if (userData.employee_id) {
                        setEmployeeId(userData.employee_id)
                        localStorage.setItem('employeeId', userData.employee_id)
                    }
                    setError(null)
                })
                .catch((err) => {
                    localStorage.removeItem('token')
                    localStorage.removeItem('sessionId')
                    localStorage.removeItem('userRole')
                    localStorage.removeItem('employeeId')
                    setToken(null)
                    setSessionId(null)
                    setRole(null)
                    setEmployeeId(null)
                    setError('Session expired. Please login again.')
                })
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [token])

    const login = async (email, password) => {
        try {
            setError(null)
            const response = await authService.login(email, password)
            localStorage.setItem('token', response.access_token)
            localStorage.setItem('sessionId', response.session_id)

            if (response.user) {
                setUser(response.user)
                if (response.user.role) {
                    setRole(response.user.role)
                    localStorage.setItem('userRole', response.user.role)
                }
                if (response.user.employee_id) {
                    setEmployeeId(response.user.employee_id)
                    localStorage.setItem('employeeId', response.user.employee_id)
                }
            }
            
            setToken(response.access_token)
            setSessionId(response.session_id)

            if (!response.user) {
                const userData = await authService.getMe(response.access_token)
                setUser(userData)
                if (userData.role) {
                    setRole(userData.role)
                    localStorage.setItem('userRole', userData.role)
                }
            }
            
            return { user: response.user, sessionId: response.session_id }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Login failed'
            setError(errorMsg)
            throw err
        }
    }

    const register = async (email, password, firstName, lastName, userRole = 'employer') => {
        try {
            setError(null)
            const response = await authService.register(email, password, firstName, lastName, userRole)
            localStorage.setItem('token', response.access_token)
            localStorage.setItem('sessionId', response.session_id)
            
            if (response.user) {
                setUser(response.user)
                if (response.user.role) {
                    setRole(response.user.role)
                    localStorage.setItem('userRole', response.user.role)
                }
                if (response.user.employee_id) {
                    setEmployeeId(response.user.employee_id)
                    localStorage.setItem('employeeId', response.user.employee_id)
                }
            }

            setToken(response.access_token)
            setSessionId(response.session_id)
            
            return { user: response.user, sessionId: response.session_id }
        } catch (err) {
            const errorMsg = err.response?.data?.detail || 'Registration failed'
            setError(errorMsg)
            throw err
        }
    }

    const demoLogin = async () => {
        try {
            const response = await authService.directLogin()
            if (response && response.access_token) {
                localStorage.setItem('token', response.access_token)
                localStorage.setItem('sessionId', response.session_id || 'direct-session')
                
                const demoUser = response.user || { email: 'admin@hash.ai', firstName: 'Harshit', lastName: 'Srivastava', role: 'employer' }
                setUser(demoUser)
                if (demoUser.role) {
                    setRole(demoUser.role)
                    localStorage.setItem('userRole', demoUser.role)
                }

                setToken(response.access_token)
                setSessionId(response.session_id || 'direct-session')
                setError(null)
                return response;
            }
        } catch (err) {
            console.warn('Backend direct-login API call failed, using local session token fallback:', err)
        }

        const fakeToken = 'demo-token'
        const fakeSession = 'demo-session'
        const fakeUser = { email: 'admin@hash.ai', firstName: 'Harshit', lastName: 'Srivastava', role: 'employer' }

        localStorage.setItem('token', fakeToken)
        localStorage.setItem('sessionId', fakeSession)
        localStorage.setItem('userRole', 'employer')
        
        setUser(fakeUser)
        setRole('employer')
        setToken(fakeToken)
        setSessionId(fakeSession)
        setError(null)
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('sessionId')
        localStorage.removeItem('userRole')
        localStorage.removeItem('employeeId')
        setToken(null)
        setSessionId(null)
        setUser(null)
        setRole(null)
        setEmployeeId(null)
        setError(null)
    }

    const updateUser = (updatedFields) => {
        setUser(prev => prev ? { ...prev, ...updatedFields } : prev)
    }

    const value = {
        user,
        token,
        sessionId,
        role,
        employeeId,
        loading,
        error,
        isAuthenticated: !!token && !!sessionId,
        isEmployee: role === 'employee',
        isEmployer: role === 'employer' || role === null,
        login,
        register,
        logout,
        demoLogin,
        updateUser,
        clearError: () => setError(null)
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}
