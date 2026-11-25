import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import employeeApi from '../api/employeeApi'
import '../styles/EmployeesPro.css'

function EmployeesPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, exited
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({ total: 0, active: 0, exited: 0 })

  useEffect(() => {
    fetchEmployees()
    fetchStats()
  }, [filter, searchTerm])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (filter !== 'all') params.status = filter
      if (searchTerm) params.search = searchTerm
      
      const data = await employeeApi.getAll(params)
      // DRF pagination returns { count, next, previous, results }
      setEmployees(data.results || data)
    } catch (err) {
      setError('Failed to load employees. Please try again.')
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await employeeApi.getStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleDelete = async (empId) => {
    if (!confirm('Are you sure you want to delete this employee?')) return
    
    try {
      await employeeApi.delete(empId)
      fetchEmployees()
      fetchStats()
    } catch (err) {
      alert('Failed to delete employee. Please try again.')
      console.error('Error deleting employee:', err)
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <Layout>
      <div className="employees-page">
        {/* Header Section */}
        <div className="employees-header">
          <div>
            <h1 className="heading-2">Employee Management</h1>
            <p className="body-normal text-dark-2">Manage employee lifecycle and records</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/employees/new')}
          >
            <i className="bi bi-plus-lg"></i>
            <span>Add Employee</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="employee-stats">
          <div className="stat-card">
            <div className="stat-icon bg-primary-subtle">
              <i className="bi bi-people text-primary"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Employees</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: 'var(--primary-subtle)'}}>
              <i className="bi bi-person-check" style={{color: 'var(--success)'}}></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{backgroundColor: '#FFF4E6'}}>
              <i className="bi bi-person-dash" style={{color: 'var(--warning)'}}></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.exited}</div>
              <div className="stat-label">Exited</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="employees-controls">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              Active
            </button>
            <button
              className={`filter-tab ${filter === 'exited' ? 'active' : ''}`}
              onClick={() => setFilter('exited')}
            >
              Exited
            </button>
          </div>
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="form-input"
            />
          </div>
        </div>

        {/* Employee Table */}
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading-state">
            <i className="bi bi-hourglass-split"></i>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <h3>No employees found</h3>
            <p>Start by adding your first employee</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/employees/new')}
            >
              Add Employee
            </button>
          </div>
        ) : (
          <div className="employees-table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.emp_id}>
                    <td className="emp-id">{employee.emp_id}</td>
                    <td className="emp-name">{employee.full_name}</td>
                    <td>{new Date(employee.start_date).toLocaleDateString()}</td>
                    <td>{employee.end_date ? new Date(employee.end_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge ${employee.status.toLowerCase()}`}>
                        {employee.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/employees/${employee.emp_id}`)}
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => navigate(`/employees/${employee.emp_id}/edit`)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      {employee.status === 'Active' && (
                        <button
                          className="btn-icon"
                          onClick={() => navigate(`/employees/${employee.emp_id}/exit`)}
                          title="Mark as Exited"
                        >
                          <i className="bi bi-box-arrow-right"></i>
                        </button>
                      )}
                      <button
                        className="btn-icon text-error"
                        onClick={() => handleDelete(employee.emp_id)}
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EmployeesPage
