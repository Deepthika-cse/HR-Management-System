import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import employeeApi from '../api/employeeApi'
import DocumentManager from '../components/DocumentManager'
import '../styles/EmployeeDetails.css'

function EmployeeProfilePage() {
    const navigate = useNavigate()
    const { empId } = useParams()

    const [loading, setLoading] = useState(true)
    const [profile, setProfile] = useState(null)
    const [error, setError] = useState(null)

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        job_role: '',
        job_level: '',
        amount: '',
        effective_date: '',
        end_date: '',
        description: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [empId])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await employeeApi.getProfile(empId)
            setProfile(data)
        } catch (err) {
            setError('Failed to load employee profile')
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddRecord = async (e) => {
        e.preventDefault()
        try {
            await employeeApi.addCTCRecord(empId, formData)
            setShowModal(false)
            setFormData({
                job_role: '',
                job_level: '',
                amount: '',
                effective_date: '',
                end_date: '',
                description: ''
            })
            fetchProfile()
        } catch (err) {
            console.error('Failed to add record:', err)
            const errorMsg = err.response?.data?.non_field_errors?.[0] ||
                Object.values(err.response?.data || {}).flat()[0] ||
                'Validation failed. Check for date overlaps.'
            alert(errorMsg)
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="loading-state">
                    <i className="bi bi-hourglass-split"></i>
                    <p>Loading employee profile...</p>
                </div>
            </Layout>
        )
    }

    if (error || !profile) {
        return (
            <Layout>
                <div className="error-state">
                    <i className="bi bi-exclamation-circle"></i>
                    <h3>Error</h3>
                    <p>{error || 'Profile not found'}</p>
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
                    <button className="btn-back" onClick={() => navigate(`/employees/${empId}`)}>
                        <i className="bi bi-arrow-left"></i>
                        <span>Back to Details</span>
                    </button>
                    <h1 className="heading-2">Unified Profile: {profile.full_name}</h1>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-primary" onClick={() => navigate(`/employees/${empId}/onboarding`)}>
                            <i className="bi bi-clipboard-check me-2"></i>
                            Onboarding
                        </button>
                    </div>
                </div>

                <div className="details-content">
                    {/* Role & CTC Timeline Section */}
                    <section className="details-card main-timeline-card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h2 className="heading-3 mb-0">Employment & Comp History</h2>
                            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
                                <i className="bi bi-plus-circle me-1"></i> Record Change
                            </button>
                        </div>
                        <div className="card-body">
                            {profile.ctc_history && profile.ctc_history.length > 0 ? (
                                <div className="timeline">
                                    {profile.ctc_history.map((ctc, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <div className="timeline-header">
                                                    <div>
                                                        <h4 className="job-title mb-0">{ctc.job_role}</h4>
                                                        <span className="job-level badge bg-light text-dark border">{ctc.job_level}</span>
                                                    </div>
                                                    <div className="text-end">
                                                        <span className="ctc-amount-large">₹{parseFloat(ctc.amount).toLocaleString()}</span>
                                                        <div className="timeline-dates text-muted small">
                                                            {ctc.effective_date} to {ctc.end_date || 'Present'}
                                                        </div>
                                                    </div>
                                                </div>
                                                {ctc.description && <p className="ctc-desc mt-2">{ctc.description}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="empty-msg">No history found for this employee.</p>
                            )}
                        </div>
                    </section>

                    {/* Document Management Section */}
                    <DocumentManager empId={empId} />

                    <div className="row">
                        <div className="col-md-6">
                            {/* Personal Section */}
                            <section className="details-card h-100">
                                <div className="card-header">
                                    <h2 className="heading-3">Personal Information</h2>
                                </div>
                                <div className="card-body">
                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <span className="detail-label">Employee ID</span>
                                            <span className="detail-value">{profile.emp_id}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Full Name</span>
                                            <span className="detail-value">{profile.full_name}</span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Status</span>
                                            <span className={`status-badge ${profile.status.toLowerCase()}`}>
                                                {profile.status}
                                            </span>
                                        </div>
                                        <div className="detail-item">
                                            <span className="detail-label">Start Date</span>
                                            <span className="detail-value">{profile.start_date}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="col-md-6">
                            {/* Compliance Section */}
                            <section className="details-card h-100">
                                <div className="card-header">
                                    <h2 className="heading-3">Compliance IDs</h2>
                                </div>
                                <div className="card-body">
                                    {profile.compliance ? (
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">PAN Number</span>
                                                <span className="detail-value">{profile.compliance.pan_number}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Aadhaar Number</span>
                                                <span className="detail-value">{profile.compliance.aadhaar_number}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">UAN Number</span>
                                                <span className="detail-value">{profile.compliance.uan_number || 'N/A'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">PF Number</span>
                                                <span className="detail-value">{profile.compliance.pf_number || 'N/A'}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="empty-msg">No compliance details found.</p>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <section className="details-card mt-4">
                        <div className="card-header">
                            <h2 className="heading-3">Bank Details</h2>
                        </div>
                        <div className="card-body">
                            {profile.bank_details ? (
                                <div className="details-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Bank Name</span>
                                        <span className="detail-value">{profile.bank_details.bank_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Account Number</span>
                                        <span className="detail-value">{profile.bank_details.account_number}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">IFSC Code</span>
                                        <span className="detail-value">{profile.bank_details.ifsc_code}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Branch</span>
                                        <span className="detail-value">{profile.bank_details.branch_name}</span>
                                    </div>
                                </div>
                            ) : (
                                <p className="empty-msg">No bank details found.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>

            {/* Change Record Modal */}
            {showModal && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="modal-header d-flex justify-content-between align-items-center p-3 border-bottom">
                            <h5 className="mb-0">Record Job or CTC Change</h5>
                            <button className="btn-close" onClick={() => setShowModal(false)}></button>
                        </div>
                        <form onSubmit={handleAddRecord} className="p-3">
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label className="form-label">Job Role</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.job_role}
                                        onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
                                        placeholder="e.g. Senior Developer"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Level</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        required
                                        value={formData.job_level}
                                        onChange={(e) => setFormData({ ...formData, job_level: e.target.value })}
                                        placeholder="e.g. L3"
                                    />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label">CTC Amount (Annual)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Effective From</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        required
                                        value={formData.effective_date}
                                        onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">To Date (Optional)</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.end_date}
                                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    />
                                </div>
                                <div className="col-md-12">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="2"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer mt-4 text-end">
                                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
        .main-timeline-card {
            border-left: 5px solid #007bff;
            margin-bottom: 2rem;
        }
        .empty-msg {
          color: #666;
          font-style: italic;
          padding: 10px 0;
        }
        .timeline {
          position: relative;
          padding-left: 30px;
          margin-top: 15px;
        }
        .timeline::before {
          content: '';
          position: absolute;
          left: 10px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: #e0e0e0;
        }
        .timeline-item {
          position: relative;
          margin-bottom: 30px;
        }
        .timeline-marker {
          position: absolute;
          left: -25px;
          top: 5px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #007bff;
          border: 3px solid #fff;
          box-shadow: 0 0 0 2px #007bff;
        }
        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px dashed #eee;
          padding-bottom: 10px;
        }
        .job-title {
            color: #2c3e50;
            font-size: 1.1rem;
            font-weight: 700;
        }
        .ctc-amount-large {
          font-weight: 800;
          font-size: 1.25rem;
          color: #27ae60;
          display: block;
        }
        .timeline-dates {
          color: #7f8c8d;
          font-size: 0.85rem;
        }
        .ctc-desc {
          font-size: 0.95rem;
          color: #555;
          margin: 0;
        }

        /* Modal Styles */
        .custom-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1050;
        }
        .custom-modal {
            background: #fff;
            border-radius: 8px;
            width: 100%;
            max-width: 600px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
      `}} />
        </Layout>
    )
}

export default EmployeeProfilePage
