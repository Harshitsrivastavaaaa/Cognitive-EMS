import api from './api'

// Employees Service
export const employeesService = {
    async list(params) {
        try {
            const response = await api.get('/employees', { params })
            const employees = response.data || []

            console.log('Raw employees from API:', employees)

            // Transform data to match page expectations
            return employees.map(emp => ({
                ...emp,
                first_name: emp.first_name || emp.name?.split(' ')[0] || 'Unknown',
                last_name: emp.last_name || emp.name?.split(' ').slice(1).join(' ') || '',
                role: emp.role || emp.position,
                location: emp.location || 'Remote'
            }))
        } catch (error) {
            console.error('Failed to fetch employees:', error)
            return []
        }
    },

    async getById(id) {
        try {
            const response = await api.get(`/employees/${id}`)
            const emp = response.data

            // Transform name field
            return {
                ...emp,
                first_name: emp.first_name || emp.name?.split(' ')[0] || 'Unknown',
                last_name: emp.last_name || emp.name?.split(' ').slice(1).join(' ') || '',
                role: emp.role || emp.position
            }
        } catch (error) {
            console.error(`Failed to fetch employee ${id}:`, error)
            return null
        }
    },

    async getDepartments() {
        try {
            const response = await api.get('/employees/departments')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch departments:', error)
            // Fallback: extract unique departments from employees
            try {
                const employees = await this.list()
                const uniqueDepts = [...new Set(employees.map(e => e.department).filter(Boolean))]
                return uniqueDepts.map(name => ({ name, count: employees.filter(e => e.department === name).length }))
            } catch {
                return []
            }
        }
    },

    async create(employeeData) {
        const response = await api.post('/employees', employeeData)
        return response.data
    },

    async update(id, employeeData) {
        const response = await api.put(`/employees/${id}`, employeeData)
        return response.data
    },

    async delete(id) {
        const response = await api.delete(`/employees/${id}`)
        return response.data
    },

    async search(query) {
        const response = await api.get('/employees/search', { params: { q: query } })
        return response.data || []
    }
}

// Dashboard Service
export const dashboardService = {
    async getMetrics() {
        try {
            const response = await api.get('/dashboard/metrics')
            console.log('Dashboard metrics:', response.data)
            return response.data || {
                total_employees: 0,
                active_employees: 0,
                open_positions: 0,
                pending_onboarding: 0,
                pending_reviews: 0,
                new_hires_this_month: 0
            }
        } catch (error) {
            console.error('Failed to fetch dashboard metrics:', error)
            return {
                total_employees: 0,
                active_employees: 0,
                open_positions: 0,
                pending_onboarding: 0,
                pending_reviews: 0,
                new_hires_this_month: 0
            }
        }
    },

    async getHiringTrends() {
        try {
            const response = await api.get('/dashboard/trends')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch hiring trends:', error)
            return []
        }
    },

    async getDepartmentDistribution() {
        try {
            const response = await api.get('/dashboard/departments')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch department distribution:', error)
            return []
        }
    },

    async getRecentActivities() {
        try {
            const response = await api.get('/dashboard/activities')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch recent activities:', error)
            return []
        }
    },

    async getProjectDistribution() {
        try {
            const response = await api.get('/dashboard/projects-distribution')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch project distribution:', error)
            return []
        }
    },

    async getAIInsights() {
        try {
            const response = await api.get('/dashboard/insights')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch AI insights:', error)
            return []
        }
    },

    async getActivity() {
        try {
            const response = await api.get('/dashboard/activity')
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch activity:', error)
            return []
        }
    },

    async getChartData() {
        try {
            const response = await api.get('/dashboard/charts')
            return response.data || {}
        } catch (error) {
            console.error('Failed to fetch chart data:', error)
            return {}
        }
    }
}

export const attendanceService = {
    async getList(date, department, projectId) {
        const params = { date }
        if (department) params.department = department
        if (projectId) params.project_id = projectId
        const response = await api.get('/attendance', { params })
        return response.data
    },
    async saveBatch(date, records) {
        const response = await api.post('/attendance/batch', { date, records })
        return response.data
    },
    async getEmployeeAttendance(employeeId) {
        const response = await api.get(`/attendance/employee/${employeeId}`)
        return response.data
    }
}

export const settingsService = {
    async getSettings() {
        const response = await api.get('/settings')
        return response.data
    },
    async updateSettings(data) {
        const response = await api.put('/settings', data)
        return response.data
    }
}

export const salaryService = {
    async getRecords(params) {
        try {
            const response = await api.get('/salary', { params })
            return response.data || []
        } catch (error) {
            console.error('Failed to fetch salary records:', error)
            return []
        }
    },
    async processPayroll(data) {
        const response = await api.post('/salary', data)
        return response.data
    },
    async updateRecord(id, data) {
        const response = await api.put(`/salary/${id}`, data)
        return response.data
    },
    async deleteRecord(id) {
        const response = await api.delete(`/salary/${id}`)
        return response.data
    },
    async processBulkPayroll(data) {
        const response = await api.post('/salary/bulk', data)
        return response.data
    }
}

export default employeesService


