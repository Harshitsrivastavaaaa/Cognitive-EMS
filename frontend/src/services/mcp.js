import api from './api'

export const mcpService = {
    async getTools() {
        const response = await api.get('/mcp/tools')
        return response.data
    },

    async getToolInfo(toolName) {
        const response = await api.get(`/mcp/tools/${toolName}`)
        return response.data
    },

    async invokeTool(toolName, args) {
        const response = await api.post(`/mcp/tools/${toolName}/invoke`, {
            arguments: args
        })
        return response.data
    },

    async getAvailable() {
        const response = await api.get('/mcp/available')
        return response.data
    }
}
