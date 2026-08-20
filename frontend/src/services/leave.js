import api from './api'

export const leaveService = {
  /** Employee submits leave request */
  async submitLeave(data) {
    const response = await api.post('/leave', data)
    return response.data
  },

  /** Get employee's own leave requests */
  async getMyLeaveRequests() {
    const response = await api.get('/leave/mine')
    return response.data
  },

  /** Employer: Get all leave requests */
  async getAllLeaveRequests(statusFilter) {
    const params = statusFilter ? { status_filter: statusFilter } : {}
    const response = await api.get('/leave', { params })
    return response.data
  },

  /** Employer: Update leave request status (approved/rejected) */
  async updateLeaveStatus(leaveId, status, reviewerNote = '') {
    const response = await api.put(`/leave/${leaveId}/status`, {
      status,
      reviewer_note: reviewerNote
    })
    return response.data
  }
}
