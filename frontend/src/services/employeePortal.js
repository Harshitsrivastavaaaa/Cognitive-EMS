import api from './api'

export const employeePortalService = {
    /** Get the logged-in employee's full profile */
    async getMyProfile() {
        const response = await api.get('/portal/me')
        return response.data
    },

    /** Update limited profile fields (phone, location, skills) */
    async updateMyProfile(data) {
        const response = await api.put('/portal/me', data)
        return response.data
    },

    /** Upload profile image */
    async uploadProfileImage(file) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('/portal/me/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    /** Mark today's attendance */
    async markAttendance(data) {
        const response = await api.post('/portal/attendance', data)
        return response.data
    },

    /** Get own attendance history + today's status */
    async getMyAttendance() {
        const response = await api.get('/portal/attendance')
        return response.data
    },

    /** Get projects the employee is assigned to */
    async getMyProjects() {
        const response = await api.get('/portal/projects')
        return response.data
    },

    /** Get own documents from vault */
    async getMyDocuments() {
        const response = await api.get('/portal/documents')
        return response.data
    },
}
