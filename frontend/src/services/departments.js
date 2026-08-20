import api from './api';

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments/');
    return response.data;
  },

  createDepartment: async (departmentData) => {
    const response = await api.post('/departments/', departmentData);
    return response.data;
  },

  deleteDepartment: async (departmentId) => {
    const response = await api.delete(`/departments/${departmentId}`);
    return response.data;
  },
};
