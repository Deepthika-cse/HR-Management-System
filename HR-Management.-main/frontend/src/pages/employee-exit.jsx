import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import employeeApi from '../api/employeeApi'
import '../styles/EmployeeExit.css'

function EmployeeExitPage() {
  const navigate = useNavigate()
  const { empId } = useParams()

  const [loading, setLoading] = useState(false)
  const [employee, setEmployee] = useState(null)
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEmployee()
  }, [empId])

  const fetchEmployee = async () => {
    try {
      setLoading(true)
      const data = await employeeApi.getById(empId)
      setEmployee(data)
      
      if (data.end_date) {
        setError('This employee has already exited')
      }
    } catch (err) {
      setError('Failed to load employee data')
      console.error('Error fetching employee:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!endDate) {
      setError('End date is required')
      return
    }

    if (employee && new Date(endDate) < new Date(employee.start_date)) {
      setError('End date cannot be before start date')
      return
    }

    if (new Date(endDate) > new Date()) {
      setError('End date cannot be in the future')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await employeeApi.exit(empId, endDate)
      navigate('/employees')
    } catch (err) {
      console.error('Error exiting employee:', err)
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else {
        setError('Failed to exit employee. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading && !employee) {
    return (
      <Layout>
        <div className="loading-state">
          <i className="bi bi-hourglass-split"></i>
          <p>Loading employee data...</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="employee-exit-page">
        <div className="exit-header">
          <button className="btn-back" onClick={() => navigate('/employees')}>
            <i className="bi bi-arrow-left"></i>
            <span>Back to Employees</span>
          </button>
          <h1 className="heading-2">Exit Employee</h1>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {employee && (
          <div className="exit-container">
            <div className="employee-info-card">
              <div className="info-header">
                <i className="bi bi-person-circle"></i>
                <h3 className="heading-5">Employee Details</h3>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Employee ID</span>
                  <span className="info-value">{employee.emp_id}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{employee.full_name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Start Date</span>
                  <span className="info-value">
                    {new Date(employee.start_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Status</span>
                  <span className={`status-badge ${employee.status.toLowerCase()}`}>
                    {employee.status}
                  </span>
                </div>
              </div>
            </div>

            {!employee.end_date && (
              <div className="exit-form-card">
                <div className="warning-box">
                  <i className="bi bi-exclamation-triangle"></i>
                  <div>
                    <h4>Exit Employee</h4>
                    <p>
                      You are about to mark this employee as exited. This action will set the end date
                      and change their status to "Exited". Please confirm the exit date below.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="exit-form">
                  <div className="form-group">
                    <label htmlFor="end_date" className="form-label">
                      End Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-input"
                      max={new Date().toISOString().split('T')[0]}
                      min={employee.start_date}
                      required
                    />
                    <small className="form-hint">
                      End date must be between {new Date(employee.start_date).toLocaleDateString()} and today
                    </small>
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
                      className="btn btn-danger"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="bi bi-hourglass-split"></i>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <i className="bi bi-box-arrow-right"></i>
                          <span>Confirm Exit</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EmployeeExitPage
