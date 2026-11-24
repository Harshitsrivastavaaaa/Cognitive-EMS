import api from './api'

export const companyService = {
    async getProfile() {
        const response = await api.get('/company')
        return response.data
    },

    async updateProfile(data) {
        const response = await api.put('/company', data)
        return response.data
    },

    // Fetched as a blob so the image is same-origin; PDF generation draws it onto a canvas,
    // which a cross-origin image would taint
    async getLogoBlob(version) {
        const response = await api.get('/company/logo', { params: { v: version }, responseType: 'blob' })
        return response.data
    },

    async uploadLogo(file) {
        const formData = new FormData()
        formData.append('file', file)
        const response = await api.post('/company/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    async removeLogo() {
        const response = await api.delete('/company/logo')
        return response.data
    }
}
