import api from './api'

export const ragService = {
    async query(question, collection = 'hr_documents', filters = null) {
        const response = await api.post('/rag/query', {
            question,
            collection,
            filters
        })
        return response.data
    },

    async ingestText(text, sourceName = 'api_upload', metadata = null) {
        const response = await api.post('/rag/ingest', {
            text,
            source_name: sourceName,
            metadata
        })
        return response.data
    },

    async ingestFile(file, collection = 'hr_documents') {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('collection', collection)

        const response = await api.post('/rag/ingest/file', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    async getCollections() {
        const response = await api.get('/rag/collections')
        return response.data
    }
}
