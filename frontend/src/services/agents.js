/**
 * HRMS Agent Service
 * 
 * Thin client that calls backend agents API.
 * All agent logic and routing is handled by the backend CoordinatorAgent.
 */

import api from './api'

/**
 * Main agent service - sends queries to backend for processing
 */
export const agentsService = {
    /**
     * Query the HRMS AI system
     * Backend classifies and routes to appropriate specialized agent
     */
    async query(message, agentHint = null, context = null) {
        const response = await api.post('/ai/chat', {
            query: message,
            agent_hint: agentHint,
            context
        })
        return response.data
    },

    /**
     * Invoke a specific agent directly (deprecated - use query with agent_hint)
     */
    async invokeAgent(agentName, message, context = null) {
        const response = await api.post('/ai/chat', {
            query: message,
            agent_hint: agentName,
            context
        })
        return response.data
    },

    /**
     * Get list of available agents
     */
    async getAvailable() {
        // Return list of agents from backend classification
        return {
            agents: [
                { name: 'recruitment', description: 'Candidate screening, interviews, hiring' },
                { name: 'onboarding', description: 'New hire onboarding, day 1 prep' },
                { name: 'performance', description: 'Reviews, goals, OKRs' },
                { name: 'payroll', description: 'Salary, bonuses, expenses' },
                { name: 'learning', description: 'Training, courses, certifications' },
                { name: 'compliance', description: 'Policies, audits, regulations' },
                { name: 'analytics', description: 'Reports, dashboards, metrics' },
                { name: 'engagement', description: 'Surveys, feedback, wellness' }
            ]
        }
    },

    /**
     * Get conversation history (placeholder - implement with backend)
     */
    async getHistory(sessionId, limit = 20) {
        // TODO: Implement history endpoint in backend
        return { messages: [] }
    },

    /**
     * Get action log (placeholder - implement with backend)
     */
    async getActions(limit = 50) {
        // TODO: Implement actions endpoint in backend
        return { actions: [] }
    },

    /**
     * Clear conversation history (placeholder)
     */
    async clearHistory(sessionId) {
        return { success: true }
    }
}

// Default export
export default agentsService
