import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import employeeApi from '../api/employeeApi'

function OnboardingChecklist() {
    const { empId } = useParams()
    const navigate = useNavigate()
    const [tasks, setTasks] = useState([])
    const [employee, setEmployee] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchData()
    }, [empId])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [tasksData, profileData] = await Promise.all([
                employeeApi.getOnboarding(empId),
                employeeApi.getProfile(empId)
            ])
            setTasks(tasksData)
            setEmployee(profileData)
        } catch (err) {
            setError('Failed to load onboarding data')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const toggleTask = async (task) => {
        try {
            const updatedTask = await employeeApi.updateOnboarding(empId, {
                id: task.id,
                is_completed: !task.is_completed
            })
            setTasks(tasks.map(t => t.id === task.id ? updatedTask : t))

            // Refresh employee profile to get updated progress
            const profileData = await employeeApi.getProfile(empId)
            setEmployee(profileData)
        } catch (err) {
            console.error('Failed to update task:', err)
        }
    }

    const toggleDocument = async (task) => {
        try {
            const updatedTask = await employeeApi.updateOnboarding(empId, {
                id: task.id,
                document_submitted: !task.document_submitted
            })
            setTasks(tasks.map(t => t.id === task.id ? updatedTask : t))
        } catch (err) {
            console.error('Failed to update document status:', err)
        }
    }

    if (loading) return <Layout><div className="loading">Loading...</div></Layout>
    if (error) return <Layout><div className="error">{error}</div></Layout>

    return (
        <Layout>
            <div className="onboarding-page container py-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => navigate(`/employees/${empId}/profile`)}>
                            <i className="bi bi-arrow-left"></i> Back to Profile
                        </button>
                        <h1 className="h2">Onboarding Checklist</h1>
                        <p className="text-muted">Employee: <strong>{employee?.full_name}</strong> (ID: {empId})</p>
                    </div>
                    <div className="text-end">
                        <div className="progress-label mb-1">Completion Progress</div>
                        <div className="progress" style={{ width: '200px', height: '20px' }}>
                            <div
                                className="progress-bar bg-success"
                                role="progressbar"
                                style={{ width: `${employee?.onboarding_progress || 0}%` }}
                                aria-valuenow={employee?.onboarding_progress || 0}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {employee?.onboarding_progress || 0}%
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-12">
                        <div className="card shadow-sm">
                            <div className="card-header bg-primary text-white">
                                <h5 className="card-title mb-0">Onboarding Tasks & Documents</h5>
                            </div>
                            <div className="list-group list-group-flush">
                                {tasks.map(task => (
                                    <div key={task.id} className={`list-group-item p-4 ${task.is_completed ? 'bg-light' : ''}`}>
                                        <div className="d-flex w-100 justify-content-between align-items-start">
                                            <div className="flex-grow-1">
                                                <div className="d-flex align-items-center mb-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input me-3"
                                                        checked={task.is_completed}
                                                        onChange={() => toggleTask(task)}
                                                        style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                                                    />
                                                    <h5 className={`mb-0 ${task.is_completed ? 'text-decoration-line-through text-muted' : ''}`}>
                                                        {task.title}
                                                    </h5>
                                                </div>
                                                <p className="mb-2 text-muted ms-5">{task.description}</p>

                                                {task.document_required && (
                                                    <div className="ms-5 mt-3 p-3 border rounded bg-white">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <i className="bi bi-file-earmark-arrow-up me-2 text-primary"></i>
                                                                <span>Document Submission Required</span>
                                                            </div>
                                                            <div className="form-check form-switch">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`doc-${task.id}`}
                                                                    checked={task.document_submitted}
                                                                    onChange={() => toggleDocument(task)}
                                                                />
                                                                <label className="form-check-label" htmlFor={`doc-${task.id}`}>
                                                                    {task.document_submitted ? 'Submitted' : 'Pending Upload'}
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <span className={`badge ${task.is_completed ? 'bg-success' : 'bg-warning text-dark'} ms-3`}>
                                                {task.is_completed ? 'Completed' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {tasks.length === 0 && (
                                    <div className="list-group-item p-5 text-center text-muted">
                                        No onboarding tasks found for this employee.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .onboarding-page .list-group-item {
                    transition: all 0.2s ease;
                }
                .onboarding-page .progress {
                    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                .progress-label {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #495057;
                }
            `}} />
        </Layout>
    )
}

export default OnboardingChecklist
