import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import employeeApi from '../api/employeeApi'
import '../styles/EmployeeDetails.css'

function EmployeeDetailsPage() {
  const navigate = useNavigate()
  const { empId } = useParams()

  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEmployee()
  }, [empId])

  const fetchEmployee = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await employeeApi.getById(empId)
      setEmployee(data)
    } catch (err) {
      setError('Failed to load employee details')
      console.error('Error fetching employee:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete employee ${employee.full_name}?`)) {
      return
    }

    try {
      await employeeApi.delete(empId)
      navigate('/employees')
    } catch (err) {
      alert('Failed to delete employee. Please try again.')
      console.error('Error deleting employee:', err)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="loading-state">
          <i className="bi bi-hourglass-split"></i>
          <p>Loading employee details...</p>
        </div>
      </Layout>
    )
  }

  if (error || !employee) {
    return (
      <Layout>
        <div className="error-state">
          <i className="bi bi-exclamation-circle"></i>
          <h3>Error</h3>
          <p>{error || 'Employee not found'}</p>
          <button className="btn btn-primary" onClick={() => navigate('/employees')}>
            Back to Employees
          </button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="employee-details-page">
        <div className="details-header">
          <button className="btn-back" onClick={() => navigate('/employees')}>
            <i className="bi bi-arrow-left"></i>
            <span>Back to Employees</span>
          </button>
          <div className="header-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate(`/employees/${empId}/edit`)}
            >
              <i className="bi bi-pencil"></i>
              <span>Edit</span>
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/employees/${empId}/profile`)}
            >
              <i className="bi bi-person-lines-fill"></i>
              <span>View Full Profile</span>
            </button>
            {employee.status === 'Active' && (
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/employees/${empId}/onboarding`)}
              >
                <i className="bi bi-clipboard-check"></i>
                <span>Onboarding</span>
              </button>
            )}
            {employee.status === 'Active' && (
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/employees/${empId}/exit`)}
              >
                <i className="bi bi-box-arrow-right"></i>
                <span>Exit Employee</span>
              </button>
            )}
            <button
              className="btn btn-danger"
              onClick={handleDelete}
            >
              <i className="bi bi-trash"></i>
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="details-content">
          <div className="details-card">
            <div className="card-header">
              <div className="employee-avatar">
                <i className="bi bi-person-circle"></i>
              </div>
              <div className="employee-title">
                <h1 className="heading-2">{employee.full_name}</h1>
                <span className={`status-badge large ${employee.status.toLowerCase()}`}>
                  {employee.status}
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="details-grid">
                <div className="detail-item">
                  <div className="detail-icon">
                    <i className="bi bi-hash"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Employee ID</span>
                    <span className="detail-value">{employee.emp_id}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <i className="bi bi-person"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">First Name</span>
                    <span className="detail-value">{employee.first_name}</span>
                  </div>
                </div>

                {employee.middle_name && (
                  <div className="detail-item">
                    <div className="detail-icon">
                      <i className="bi bi-person"></i>
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">Middle Name</span>
                      <span className="detail-value">{employee.middle_name}</span>
                    </div>
                  </div>
                )}

                <div className="detail-item">
                  <div className="detail-icon">
                    <i className="bi bi-person"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Last Name</span>
                    <span className="detail-value">{employee.last_name}</span>
                  </div>
                </div>

                <div className="detail-item">
                  <div className="detail-icon">
                    <i className="bi bi-calendar-check"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Start Date</span>
                    <span className="detail-value">
                      {new Date(employee.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {employee.end_date && (
                  <div className="detail-item">
                    <div className="detail-icon">
                      <i className="bi bi-calendar-x"></i>
                    </div>
                    <div className="detail-content">
                      <span className="detail-label">End Date</span>
                      <span className="detail-value">
                        {new Date(employee.end_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                )}

                <div className="detail-item full-width">
                  <div className="detail-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <div className="detail-content">
                    <span className="detail-label">Employment Duration</span>
                    <span className="detail-value">
                      {employee.end_date
                        ? `${Math.floor((new Date(employee.end_date) - new Date(employee.start_date)) / (1000 * 60 * 60 * 24))} days`
                        : `${Math.floor((new Date() - new Date(employee.start_date)) / (1000 * 60 * 60 * 24))} days (ongoing)`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {employee.status === 'Exited' && (
            <div className="info-banner">
              <i className="bi bi-info-circle"></i>
              <span>This employee has exited the organization</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default EmployeeDetailsPage
