import api from './api'

export const authService = {
    /**
     * Login with email and password
     * Returns: { access_token, session_id, refresh_token, user, token_type }
     */
    async login(email, password) {
        const formData = new URLSearchParams()
        formData.append('username', email)
        formData.append('password', password)

        const response = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        return response.data
    },

    /**
     * Perform direct administrative login
     */
    async directLogin() {
        const response = await api.post('/auth/direct-login')
        return response.data
    },

    /**
     * Register new user with email, password, and name
     * Returns: { access_token, session_id, refresh_token, user, token_type }
     */
    async register(email, password, firstName, lastName, role = 'employer') {
        const response = await api.post('/auth/register', {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            role
        })
        return response.data
    },

    /**
     * Get current user info
     */
    async getMe(token) {
        const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
        })
        return response.data
    },

    /**
     * Refresh access token
     */
    async refresh() {
        const response = await api.post('/auth/refresh')
        return response.data
    },

    /**
     * Logout and invalidate session
     */
    async logout(token, sessionId) {
        try {
            const response = await api.post('/auth/logout', {}, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'X-Session-ID': sessionId
                }
            })
            return response.data
        } catch (err) {
            // Continue logout even if endpoint fails
            console.error('Logout error:', err)
        }
    },

    /**
     * Update user profile (first/last name)
     */
    async updateProfile(firstName, lastName) {
        const response = await api.put('/auth/profile', {
            first_name: firstName,
            last_name: lastName
        })
        return response.data
    },

    /**
     * Change user password
     */
    async changePassword(oldPassword, newPassword) {
        const response = await api.put('/auth/change-password', {
            old_password: oldPassword,
            new_password: newPassword
        })
        return response.data
    },

    /**
     * Get list of users pending admin approval
     */
    async getPendingUsers() {
        const response = await api.get('/auth/pending-users')
        return response.data
    },

    /**
     * Approve user account
     */
    async approveUser(userId) {
        const response = await api.post(`/auth/approve-user/${userId}`)
        return response.data
    },

    /**
     * Reject pending user registration
     */
    async rejectUser(userId) {
        const response = await api.post(`/auth/reject-user/${userId}`)
        return response.data
    },

    /**
     * Provision new employee credentials (ID & password)
     */
    async provisionEmployee(data) {
        const response = await api.post('/auth/provision-employee', {
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            password: data.password,
            department: data.department,
            role_title: data.roleTitle,
            activate_now: data.activateNow
        })
        return response.data
    },

    /**
     * Get list of employee user accounts and activation status
     */
    async getEmployeeAccounts() {
        const response = await api.get('/auth/employee-accounts')
        return response.data
    },

    /**
     * Activate or deactivate user account
     */
    async toggleUserActivation(userId) {
        const response = await api.post(`/auth/toggle-user-activation/${userId}`)
        return response.data
    }
}

