/**
 * Workflow Services
 * 
 * Frontend services for calling backend AI workflow endpoints.
 * These methods call the backend API which runs all AI/LLM operations.
 * 
 * NO AI processing happens in the frontend - all AI runs in backend via Groq API.
 */

import api from './api'

export const workflowService = {
    /**
     * Workflow #1: Bulk Resume Processing
     * 
     * Uploads and processes multiple resumes for a position.
     * Backend performs OCR, skill extraction, matching, and scoring.
     * 
     * @param {string} position - Job position (e.g., "Senior Software Engineer")
     * @param {Array} filesContent - Array of resume data/text
     * @param {number} minScore - Minimum match score (default 70)
     * @returns {Promise} - Qualified candidates with scores
     */
    async processBulkResumes(position, filesContent, minScore = 70) {
        const response = await api.post('/ai/recruitment/process-resumes', {
            position,
            files_content: filesContent,
            min_score: minScore
        })
        return response.data
    },

    /**
     * Workflow #5: Document Verification
     * 
     * Verifies employee documents using backend OCR and validation.
     * 
     * @param {string} employeeId - Employee identifier
     * @param {Object} documentData - Document types and content
     * @returns {Promise} - Verification status and discrepancies
     */
    async verifyDocuments(employeeId, documentData) {
        const response = await api.post('/ai/onboarding/verify-documents', {
            employee_id: employeeId,
            document_data: documentData
        })
        return response.data
    },

    /**
     * Workflow #11: Benefits Optimization
     * 
     * Backend AI analyzes benefit utilization and recommends optimizations.
     * 
     * @param {string} employeeId - Employee identifier
     * @returns {Promise} - Optimization recommendations and potential savings
     */
    async optimizeBenefits(employeeId) {
        const response = await api.post('/ai/payroll/optimize-benefits', {
            employee_id: employeeId
        })
        return response.data
    },

    /**
     * Workflow #16: Workforce Forecasting
     * 
     * Backend AI predicts headcount needs based on growth and attrition.
     * 
     * @param {string} quarter - Target quarter (e.g., "Q1 2025")
     * @returns {Promise} - Hiring needs and budget impact
     */
    async forecastWorkforce(quarter = 'Q1 2025') {
        const response = await api.get('/ai/analytics/workforce-forecast', {
            params: { quarter }
        })
        return response.data
    },

    /**
     * Workflow #20: Complete Hiring Workflow
     * 
     * Backend orchestrates end-to-end hiring from posting to onboarding.
     * Multi-agent workflow coordinated by CoordinatorAgent in backend.
     * 
     * @param {string} position - Job position
     * @param {string} department - Department name
     * @param {Object} salaryRange - {min: number, max: number}
     * @returns {Promise} - Workflow status and phases
     */
    async executeCompleteHiring(position, department, salaryRange = null) {
        const response = await api.post('/ai/workflow/complete-hiring', {
            position,
            department,
            salary_range: salaryRange
        })
        return response.data
    },

    /**
     * Get workflow status
     * 
     * @param {string} workflowId - Workflow identifier
     * @returns {Promise} - Current status and progress
     */
    async getWorkflowStatus(workflowId) {
        const response = await api.get(`/ai/agents/workflow-status/${workflowId}`)
        return response.data
    },

    /**
     * Helper: Convert file to base64 for API upload
     * 
     * @param {File} file - File object
     * @returns {Promise<Object>} - {name, content, type}
     */
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]
                resolve({
                    name: file.name,
                    content: base64,
                    type: file.type,
                    size: file.size
                })
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    },

    /**
     * Helper: Process multiple files for resume upload
     * 
     * @param {FileList} files - Files from input
     * @returns {Promise<Array>} - Array of file data
     */
    async processResumeFiles(files) {
        const filesArray = Array.from(files)
        const promises = filesArray.map(file => this.fileToBase64(file))
        return await Promise.all(promises)
    }
}

// Named exports for individual functions
export const processBulkResumes = workflowService.processBulkResumes.bind(workflowService)
export const verifyDocuments = workflowService.verifyDocuments.bind(workflowService)
export const optimizeBenefits = workflowService.optimizeBenefits.bind(workflowService)
export const forecastWorkforce = workflowService.forecastWorkforce.bind(workflowService)
export const executeCompleteHiring = workflowService.executeCompleteHiring.bind(workflowService)
export const getWorkflowStatus = workflowService.getWorkflowStatus.bind(workflowService)

// Default export
export default workflowService
