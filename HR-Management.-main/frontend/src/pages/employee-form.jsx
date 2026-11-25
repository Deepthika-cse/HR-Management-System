import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import employeeApi from '../api/employeeApi'
import '../styles/EmployeeForm.css'

function EmployeeFormPage() {
  const navigate = useNavigate()
  const { empId } = useParams()
  const isEditMode = !!empId

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    emp_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    start_date: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isEditMode) {
      fetchEmployee()
    }
  }, [empId])

  const fetchEmployee = async () => {
    try {
      setLoading(true)
      const data = await employeeApi.getById(empId)
      setFormData({
        emp_id: data.emp_id,
        first_name: data.first_name,
        middle_name: data.middle_name || '',
        last_name: data.last_name,
        start_date: data.start_date
      })
    } catch (err) {
      setError('Failed to load employee data')
      console.error('Error fetching employee:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.emp_id) {
      newErrors.emp_id = 'Employee ID is required'
    } else if (formData.emp_id <= 0) {
      newErrors.emp_id = 'Employee ID must be a positive number'
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const submitData = {
        ...formData,
        emp_id: parseInt(formData.emp_id),
        middle_name: formData.middle_name || null
      }

      if (isEditMode) {
        // For edit, don't send emp_id
        const { emp_id, ...updateData } = submitData
        await employeeApi.update(empId, updateData)
      } else {
        await employeeApi.create(submitData)
      }

      navigate('/employees')
    } catch (err) {
      console.error('Error saving employee:', err)
      if (err.response?.data) {
        // Handle field-specific errors from backend
        const backendErrors = {}
        Object.keys(err.response.data).forEach(key => {
          const messages = err.response.data[key]
          backendErrors[key] = Array.isArray(messages) ? messages[0] : messages
        })
        setErrors(backendErrors)
      } else {
        setError(isEditMode ? 'Failed to update employee' : 'Failed to create employee')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="employee-form-page">
        <div className="form-header">
          <button className="btn-back" onClick={() => navigate('/employees')}>
            <i className="bi bi-arrow-left"></i>
            <span>Back to Employees</span>
          </button>
          <h1 className="heading-2">
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h1>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit} className="employee-form">
            <div className="form-section">
              <h3 className="heading-6">Employee Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="emp_id" className="form-label">
                    Employee ID <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="emp_id"
                    name="emp_id"
                    value={formData.emp_id}
                    onChange={handleChange}
                    disabled={isEditMode}
                    className={`form-input ${errors.emp_id ? 'error' : ''}`}
                    placeholder="Enter employee ID"
                  />
                  {errors.emp_id && <span className="error-message">{errors.emp_id}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="start_date" className="form-label">
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`form-input ${errors.start_date ? 'error' : ''}`}
                  />
                  {errors.start_date && <span className="error-message">{errors.start_date}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="first_name" className="form-label">
                    First Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={`form-input ${errors.first_name ? 'error' : ''}`}
                    placeholder="Enter first name"
                    maxLength={50}
                  />
                  {errors.first_name && <span className="error-message">{errors.first_name}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="middle_name" className="form-label">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    id="middle_name"
                    name="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter middle name (optional)"
                    maxLength={50}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="last_name" className="form-label">
                    Last Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={`form-input ${errors.last_name ? 'error' : ''}`}
                    placeholder="Enter last name"
                    maxLength={50}
                  />
                  {errors.last_name && <span className="error-message">{errors.last_name}</span>}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/employees')}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    <span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i>
                    <span>{isEditMode ? 'Update Employee' : 'Create Employee'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeFormPage
