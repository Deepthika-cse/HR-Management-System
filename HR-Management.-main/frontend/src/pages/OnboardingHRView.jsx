import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import employeeApi from '../api/employeeApi'

function OnboardingHRView() {
    const [stats, setStats] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            setLoading(true)
            const data = await employeeApi.getOnboardingStats()
            setStats(data)
        } catch (err) {
            setError('Failed to load onboarding statistics')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <Layout><div className="loading">Loading...</div></Layout>
    if (error) return <Layout><div className="error">{error}</div></Layout>

    return (
        <Layout>
            <div className="onboarding-hr-view container py-4">
                <div className="mb-4">
                    <h1 className="h2">Onboarding Progress Monitor</h1>
                    <p className="text-muted">HR Dashbard for tracking document collection and task completion across all employees.</p>
                </div>

                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Employee Onboarding Status</h5>
                        <button className="btn btn-sm btn-outline-light" onClick={fetchStats}>
                            <i className="bi bi-arrow-clockwise"></i> Refresh
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Employee ID</th>
                                    <th>Full Name</th>
                                    <th>Tasks Status</th>
                                    <th>Progress</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.map(emp => (
                                    <tr key={emp.emp_id}>
                                        <td><code>#{emp.emp_id}</code></td>
                                        <td><strong>{emp.full_name}</strong></td>
                                        <td>
                                            <span className="badge bg-info text-dark">
                                                {emp.completed_tasks} / {emp.total_tasks} Tasks
                                            </span>
                                        </td>
                                        <td style={{ width: '30%' }}>
                                            <div className="d-flex align-items-center">
                                                <div className="progress flex-grow-1 me-2" style={{ height: '10px' }}>
                                                    <div
                                                        className={`progress-bar ${emp.progress === 100 ? 'bg-success' : 'bg-primary'}`}
                                                        style={{ width: `${emp.progress}%` }}
                                                    ></div>
                                                </div>
                                                <small className="fw-bold">{emp.progress}%</small>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary"
                                                onClick={() => navigate(`/employees/${emp.emp_id}/onboarding`)}
                                            >
                                                View Checklist
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {stats.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center py-5 text-muted">
                                            No employee data found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Layout>
    )
}

export default OnboardingHRView
