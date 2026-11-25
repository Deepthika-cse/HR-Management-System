import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { employeeApi } from '../api/employeeApi';

const ComplianceDashboard = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const stats = await employeeApi.getComplianceStats();
                setData(stats);
            } catch (error) {
                console.error('Error fetching compliance stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case 'VERIFIED': return 'text-success fw-bold';
            case 'REJECTED': return 'text-danger fw-bold';
            case 'PENDING': return 'text-warning fw-bold';
            default: return 'text-muted';
        }
    };

    if (loading) return <Layout><div>Loading Compliance Dashboard...</div></Layout>;

    return (
        <Layout>
            <div className="container-fluid py-4">
                <header className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="h2 mb-1">Compliance Monitor</h1>
                        <p className="text-muted">Organization-wide document status and verification tracking</p>
                    </div>
                </header>

                {/* Metric Cards */}
                <div className="row g-4 mb-5">
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-primary text-white h-100">
                            <div className="card-body">
                                <h6 className="text-uppercase small mb-2 opacity-75">Verified Documents</h6>
                                <h2 className="display-4 fw-bold mb-0">{data?.metrics.verified_total}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-warning h-100">
                            <div className="card-body">
                                <h6 className="text-uppercase small mb-2 text-dark opacity-75">Pending Verifications</h6>
                                <h2 className="display-4 fw-bold mb-0">{data?.metrics.pending_total}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card border-0 shadow-sm bg-danger text-white h-100">
                            <div className="card-body">
                                <h6 className="text-uppercase small mb-2 opacity-75">Employees w/ Missing Docs</h6>
                                <h2 className="display-4 fw-bold mb-0">{data?.metrics.employees_missing_docs}</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Employee List */}
                <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white py-3">
                        <h5 className="mb-0">Employee Compliance Status</h5>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="ps-4">Employee</th>
                                        <th>PAN Card</th>
                                        <th>Aadhaar Card</th>
                                        <th>Pending</th>
                                        <th>Score</th>
                                        <th className="text-end pe-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.employees.map(emp => (
                                        <tr key={emp.emp_id}>
                                            <td className="ps-4">
                                                <div className="fw-bold">{emp.full_name}</div>
                                                <div className="small text-muted">ID: {emp.emp_id}</div>
                                            </td>
                                            <td className={getStatusClass(emp.pan_status)}>{emp.pan_status}</td>
                                            <td className={getStatusClass(emp.aadhaar_status)}>{emp.aadhaar_status}</td>
                                            <td>
                                                {emp.pending_verifications > 0 ? (
                                                    <span className="badge rounded-pill bg-warning text-dark">
                                                        {emp.pending_verifications} action required
                                                    </span>
                                                ) : (
                                                    <span className="text-muted small">None</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="progress" style={{ height: '8px', width: '80px' }}>
                                                    <div
                                                        className={`progress-bar bg-${emp.compliance_score === 100 ? 'success' : emp.compliance_score === 50 ? 'warning' : 'danger'}`}
                                                        style={{ width: `${emp.compliance_score}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => navigate(`/employees/${emp.emp_id}/profile`)}
                                                >
                                                    View Compliance
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .card { border-radius: 12px; overflow: hidden; }
        .table thead th { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 700; color: #6c757d; border-top: none; }
        .progress { background-color: #f0f0f0; border-radius: 10px; }
      `}} />
        </Layout>
    );
};

export default ComplianceDashboard;
