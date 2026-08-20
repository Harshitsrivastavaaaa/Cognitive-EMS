import api from './api'

export const payrollService = {
    async getSummary() {
        try {
            console.log('Fetching payroll summary...')
            const response = await api.get('/payroll/summary')
            console.log('Payroll summary:', response.data)
            return response.data || {}
        } catch (error) {
            console.error('Failed to fetch payroll summary:', error)
            return {}
        }
    },

    async getEmployees() {
        try {
            const response = await api.get('/payroll/employees')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch payroll employees:', error)
            return []
        }
    },

    async getTransactions() {
        try {
            const response = await api.get('/payroll/transactions')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch transactions:', error)
            return []
        }
    },

    async getCostBreakdown() {
        try {
            const response = await api.get('/payroll/cost-breakdown')
            return response.data || { breakdown: [] }
        } catch (error) {
            console.error('Failed to fetch cost breakdown:', error)
            return { breakdown: [] }
        }
    },

    async getTrends() {
        try {
            const response = await api.get('/payroll/trends')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch payroll trends:', error)
            return []
        }
    },

    async updateSalary(employeeId, salary) {
        const response = await api.put(`/payroll/employees/${employeeId}/salary`, { salary })
        return response.data
    }
}

export const performanceService = {
    async getSummary() {
        try {
            console.log('Fetching performance summary...')
            const response = await api.get('/performance/summary')
            console.log('Performance summary:', response.data)
            return response.data || {}
        } catch (error) {
            console.error('Failed to fetch performance summary:', error)
            return {}
        }
    },

    async getEmployees() {
        try {
            const response = await api.get('/performance/employees')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch performance employees:', error)
            return []
        }
    },

    async getDepartmentScores() {
        try {
            const response = await api.get('/performance/department-scores')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch department scores:', error)
            return []
        }
    },

    async getAtRisk() {
        try {
            const response = await api.get('/performance/at-risk')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch at-risk employees:', error)
            return []
        }
    },

    async updateScore(employeeId, score) {
        const response = await api.put(`/performance/employees/${employeeId}/score?score=${score}`)
        return response.data
    }
}

export const analyticsService = {
    async getWorkforce() {
        try {
            console.log('Fetching workforce analytics...')
            const response = await api.get('/analytics/workforce')
            console.log('Workforce data:', response.data)
            return response.data || {}
        } catch (error) {
            console.error('Failed to fetch workforce:', error)
            return {}
        }
    },

    async getHeadcountTrends() {
        try {
            const response = await api.get('/analytics/headcount-trends')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch headcount trends:', error)
            return []
        }
    },

    async getDiversity() {
        try {
            const response = await api.get('/analytics/diversity')
            return response.data || { gender: [], age_groups: [] }
        } catch (error) {
            console.error('Failed to fetch diversity:', error)
            return { gender: [], age_groups: [] }
        }
    },

    async getHiringFunnel() {
        try {
            const response = await api.get('/analytics/hiring-funnel')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch hiring funnel:', error)
            return []
        }
    },

    async getDepartmentGrowth() {
        try {
            const response = await api.get('/analytics/department-growth')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch department growth:', error)
            return []
        }
    },

    async getSkillsInventory() {
        try {
            const response = await api.get('/analytics/skills-inventory')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch skills inventory:', error)
            return []
        }
    }
}
