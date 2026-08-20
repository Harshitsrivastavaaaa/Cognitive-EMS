import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor for auth token and session ID
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        const sessionId = localStorage.getItem('sessionId')
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        
        // Include session ID for all AI/agent requests
        if (sessionId && (config.url.includes('/ai/') || config.url.includes('/agents/'))) {
            config.headers['X-Session-ID'] = sessionId
        }
        
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Only logout on 401 for auth endpoints, not for AI agent queries
        if (error.response?.status === 401) {
            const requestUrl = error.config?.url || ''
            // Don't logout on AI agent/chat requests (session expired is handled differently)
            const isAIRequest = requestUrl.includes('/ai/') || requestUrl.includes('/agents/')
            
            if (!isAIRequest) {
                localStorage.removeItem('token')
                localStorage.removeItem('sessionId')
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default api
