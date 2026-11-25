import { httpJson, httpUpload } from './http.js'

const EMPLOYEE_API_BASE = '/api/employees'

/**
 * Employee API Service
 * Handles all employee-related API calls
 */

export const employeeApi = {
  /**
   * Get all employees with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status ('active' or 'exited')
   * @param {string} params.search - Search by name
   * @returns {Promise} Promise resolving to array of employees
   */
  async getAll(params = {}) {
    const searchParams = new URLSearchParams()
    if (params.status) searchParams.append('status', params.status)
    if (params.search) searchParams.append('search', params.search)

    const url = searchParams.toString()
      ? `${EMPLOYEE_API_BASE}/?${searchParams}`
      : `${EMPLOYEE_API_BASE}/`

    return await httpJson(url, { method: 'GET' })
  },

  /**
   * Get single employee by ID
   * @param {number} empId - Employee ID
   * @returns {Promise} Promise resolving to employee object
   */
  async getById(empId) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/`, { method: 'GET' })
  },

  /**
   * Create new employee
   * @param {Object} employeeData - Employee data
   * @param {number} employeeData.emp_id - Employee ID (required)
   * @param {string} employeeData.first_name - First name (required)
   * @param {string} employeeData.middle_name - Middle name (optional)
   * @param {string} employeeData.last_name - Last name (required)
   * @param {string} employeeData.start_date - Start date (YYYY-MM-DD) (required)
   * @returns {Promise} Promise resolving to created employee
   */
  async create(employeeData) {
    return await httpJson(`${EMPLOYEE_API_BASE}/`, {
      method: 'POST',
      body: employeeData
    })
  },

  /**
   * Update existing employee
   * @param {number} empId - Employee ID
   * @param {Object} employeeData - Updated employee data
   * @returns {Promise} Promise resolving to updated employee
   */
  async update(empId, employeeData) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/`, {
      method: 'PUT',
      body: employeeData
    })
  },

  /**
   * Partial update of employee
   * @param {number} empId - Employee ID
   * @param {Object} employeeData - Partial employee data
   * @returns {Promise} Promise resolving to updated employee
   */
  async partialUpdate(empId, employeeData) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/`, {
      method: 'PATCH',
      body: employeeData
    })
  },

  /**
   * Mark employee as exited
   * @param {number} empId - Employee ID
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @returns {Promise} Promise resolving to exit confirmation
   */
  async exit(empId, endDate) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/exit/`, {
      method: 'POST',
      body: { end_date: endDate }
    })
  },

  /**
   * Delete employee
   * @param {number} empId - Employee ID
   * @returns {Promise} Promise resolving to deletion confirmation
   */
  async delete(empId) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/`, {
      method: 'DELETE'
    })
  },

  /**
   * Get unified employee profile
   * @param {number} empId - Employee ID
   * @returns {Promise} Promise resolving to unified profile object
   */
  async getProfile(empId) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/profile/`, { method: 'GET' })
  },

  /**
   * Get employee statistics
   * @returns {Promise} Promise resolving to stats object
   */
  async getStats() {
    return await httpJson(`${EMPLOYEE_API_BASE}/stats/`, { method: 'GET' })
  },

  /**
   * Get onboarding tasks for an employee
   * @param {number} empId - Employee ID
   * @returns {Promise} Promise resolving to array of tasks
   */
  async getOnboarding(empId) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/onboarding/`, { method: 'GET' })
  },

  /**
   * Update or create onboarding task
   * @param {number} empId - Employee ID
   * @param {Object} taskData - Task data
   * @returns {Promise} Promise resolving to updated task
   */
  async updateOnboarding(empId, taskData) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/onboarding/`, {
      method: 'POST',
      body: taskData
    })
  },

  /**
   * Get onboarding statistics for all employees (HR View)
   * @returns {Promise} Promise resolving to array of stats
   */
  async getOnboardingStats() {
    return await httpJson(`${EMPLOYEE_API_BASE}/onboarding-stats/`, { method: 'GET' })
  },

  /**
   * Add a new CTC history record
   * @param {number} empId - Employee ID
   * @param {Object} ctcData - CTC and Role data
   * @returns {Promise} Promise resolving to created record
   */
  async addCTCRecord(empId, ctcData) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/ctc-history/`, {
      method: 'POST',
      body: ctcData
    })
  },

  /**
   * Get documents for an employee
   * @param {number} empId - Employee ID
   * @returns {Promise} Promise resolving to array of documents
   */
  async getDocuments(empId) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/documents/`, { method: 'GET' })
  },

  /**
   * Upload a new document record
   * @param {number} empId - Employee ID
   * @param {Object} docData - Document metadata
   * @returns {Promise} Promise resolving to created document
   */
  async uploadDocument(empId, formData) {
    return await httpUpload(`${EMPLOYEE_API_BASE}/${empId}/documents/`, {
      method: 'POST',
      body: formData
    })
  },

  /**
   * Verify or reject a document
   * @param {number} empId - Employee ID
   * @param {number} docId - Document ID
   * @param {Object} verificationData - Status and optional remarks
   * @returns {Promise} Promise resolving to updated document
   */
  async verifyDocument(empId, docId, verificationData) {
    return await httpJson(`${EMPLOYEE_API_BASE}/${empId}/documents/${docId}/verify/`, {
      method: 'PATCH',
      body: verificationData
    })
  },

  /**
   * Get compliance statistics for all employees
   * @returns {Promise} Promise resolving to compliance metrics and employee list
   */
  async getComplianceStats() {
    return await httpJson(`${EMPLOYEE_API_BASE}/compliance-stats/`, { method: 'GET' })
  },

  /**
   * Get compliance alerts
   * @returns {Promise} Promise resolving to array of alerts
   */
  async getAlerts() {
    return await httpJson(`${EMPLOYEE_API_BASE}/alerts/`, { method: 'GET' })
  }
}

export default employeeApi
