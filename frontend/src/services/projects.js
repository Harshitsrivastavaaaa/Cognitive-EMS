import api from './api'

export const projectsService = {
  async list(params) {
    try {
      const response = await api.get('/projects', { params })
      return response.data || []
    } catch (error) {
      console.error('Failed to list projects:', error)
      return []
    }
  },

  async getById(id) {
    try {
      const response = await api.get(`/projects/${id}`)
      return response.data
    } catch (error) {
      console.error(`Failed to fetch project ${id}:`, error)
      return null
    }
  },

  async getEmployeeProjects(employeeId) {
    try {
      const response = await api.get(`/projects/employee/${employeeId}`)
      return response.data || []
    } catch (error) {
      console.error(`Failed to fetch projects for employee ${employeeId}:`, error)
      return []
    }
  },

  async create(projectData) {
    const response = await api.post('/projects', projectData)
    return response.data
  },

  async update(id, projectData) {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },

  async addMember(projectId, employeeId, roleInProject = 'Team Member') {
    const response = await api.post(`/projects/${projectId}/members`, {
      employee_id: employeeId,
      role_in_project: roleInProject
    })
    return response.data
  },

  async removeMember(projectId, employeeId) {
    const response = await api.delete(`/projects/${projectId}/members/${employeeId}`)
    return response.data
  }
}

export default projectsService
