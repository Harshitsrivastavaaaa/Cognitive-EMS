import api from './api';

export const documentService = {
  getAllDocuments: async () => {
    const response = await api.get('/documents/');
    return response.data;
  },

  uploadDocument: async (formData) => {
    // formData should contain employee_id, document_type, and file
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  downloadDocumentUrl: (documentId) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return `${baseURL}/documents/${documentId}/download`;
  },

  deleteDocument: async (documentId) => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};
