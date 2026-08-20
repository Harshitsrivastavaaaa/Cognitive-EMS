import api from './api'

export const resumeService = {
    async upload(file, role = 'Software Developer') {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post(`/resume/upload?role=${encodeURIComponent(role)}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    async getAnalysis(candidateId) {
        const response = await api.get(`/resume/analysis/${candidateId}`)
        return response.data
    }
}
