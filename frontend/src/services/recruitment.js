import api from './api'

// Candidates Service
export const candidatesService = {
    async list() {
        try {
            console.log('Fetching candidates...')
            const response = await api.get('/candidates')
            console.log('Candidates:', response.data)
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch candidates:', error)
            return []
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/candidates/${id}`)
            return response.data
        } catch (error) {
            console.error(`Failed to fetch candidate ${id}:`, error)
            return null
        }
    },

    async create(candidateData) {
        const response = await api.post('/candidates', candidateData)
        return response.data
    },

    async update(id, candidateData) {
        const response = await api.put(`/candidates/${id}`, candidateData)
        return response.data
    },

    async delete(id) {
        const response = await api.delete(`/candidates/${id}`)
        return response.data
    },

    async getStats() {
        try {
            console.log('Fetching candidate stats...')
            const response = await api.get('/candidates/stats')
            console.log('Candidate stats:', response.data)
            return response.data || {
                stage_counts: {},
                avg_match_score: 0,
                total: 0
            }
        } catch (error) {
            console.error('Failed to fetch candidate stats:', error)
            return {
                stage_counts: {},
                avg_match_score: 0,
                total: 0
            }
        }
    },

    async forward(id, targetStage) {
        const response = await api.post(`/candidates/${id}/forward`, { target_stage: targetStage })
        return response.data
    },

    async scheduleInterview(id, interviewData) {
        const response = await api.post(`/candidates/${id}/interview`, interviewData)
        return response.data
    }
}

// Onboarding Service
export const onboardingService = {
    async list() {
        try {
            console.log('Fetching onboarding records...')
            const response = await api.get('/onboarding')
            console.log('Onboarding:', response.data)
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch onboarding list:', error)
            return []
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/onboarding/${id}`)
            return response.data
        } catch (error) {
            console.error(`Failed to fetch onboarding ${id}:`, error)
            return null
        }
    },

    async getStats() {
        try {
            const response = await api.get('/onboarding/stats')
            return response.data || {
                total: 0,
                completed: 0,
                in_progress: 0,
                not_started: 0
            }
        } catch (error) {
            console.error('Failed to fetch onboarding stats:', error)
            return {
                total: 0,
                completed: 0,
                in_progress: 0,
                not_started: 0
            }
        }
    },

    async updateProgress(id, progress) {
        const response = await api.patch(`/onboarding/${id}/progress`, { progress })
        return response.data
    },

    async complete(id) {
        const response = await api.post(`/onboarding/${id}/complete`)
        return response.data
    },

    async create(newHireData) {
        const response = await api.post('/onboarding', newHireData)
        return response.data
    }
}

export default candidatesService
