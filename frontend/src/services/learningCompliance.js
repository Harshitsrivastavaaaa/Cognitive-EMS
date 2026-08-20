import api from './api'

// ============================================
// LEARNING SERVICE
// ============================================

export const learningService = {
    async getCourses() {
        try {
            console.log('Fetching learning courses...')
            const response = await api.get('/learning/courses')
            console.log('Courses:', response.data)
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch courses:', error)
            return []
        }
    },

    async getSummary() {
        try {
            console.log('Fetching learning summary...')
            const response = await api.get('/learning/summary')
            console.log('Learning summary:', response.data)
            return response.data || {}
        } catch (error) {
            console.error('Failed to fetch learning summary:', error)
            return {}
        }
    },

    async getLeaderboard() {
        try {
            const response = await api.get('/learning/leaderboard')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch leaderboard:', error)
            return []
        }
    },

    async getRecommendations(employeeId) {
        try {
            const response = await api.get(`/learning/recommendations/${employeeId}`)
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch recommendations:', error)
            return []
        }
    },

    async enroll(employeeId, courseId) {
        const response = await api.post('/learning/enroll', null, {
            params: { employee_id: employeeId, course_id: courseId }
        })
        return response.data
    }
}

// ============================================
// COMPLIANCE SERVICE
// ============================================

export const complianceService = {
    async getSummary() {
        try {
            console.log('Fetching compliance summary...')
            const response = await api.get('/compliance/summary')
            console.log('Compliance summary:', response.data)
            return response.data || {}
        } catch (error) {
            console.error('Failed to fetch compliance summary:', error)
            return {}
        }
    },

    async getPolicies() {
        try {
            const response = await api.get('/compliance/policies')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch policies:', error)
            return []
        }
    },

    async getCertifications(employeeId = null) {
        try {
            const params = employeeId ? { employee_id: employeeId } : {}
            const response = await api.get('/compliance/certifications', { params })
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch certifications:', error)
            return []
        }
    },

    async getPendingTrainings() {
        try {
            const response = await api.get('/compliance/pending-trainings')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch pending trainings:', error)
            return []
        }
    },

    async completeTraining(employeeId, certification) {
        const response = await api.post('/compliance/complete-training', null, {
            params: { employee_id: employeeId, certification }
        })
        return response.data
    },

    async getUpcomingAudits() {
        try {
            const response = await api.get('/compliance/upcoming-audits')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch upcoming audits:', error)
            return []
        }
    }
}
