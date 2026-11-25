import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { employeeApi } from '../api/employeeApi';

const AlertDashboard = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await employeeApi.getAlerts();
            setAlerts(data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'HIGH': return <span className="badge bg-danger">Critical</span>;
            case 'MEDIUM': return <span className="badge bg-warning text-dark">Required</span>;
            default: return <span className="badge bg-info">Info</span>;
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'MISSING_DOC': return <i className="bi bi-file-earmark-plus text-danger fs-4"></i>;
            case 'PENDING_VERIFICATION': return <i className="bi bi-clock-history text-warning fs-4"></i>;
            default: return <i className="bi bi-exclamation-circle text-info fs-4"></i>;
        }
    };

    if (loading) return <Layout><div>Loading Alerts...</div></Layout>;

    return (
        <Layout>
            <div className="container-fluid py-4">
                <header className="mb-4">
                    <h1 className="h2 mb-1">Compliance Alerts</h1>
                    <p className="text-muted">Urgent actions required for employee documentation</p>
                </header>

                <div className="row g-4">
                    <div className="col-12">
                        {alerts.length === 0 ? (
                            <div className="card border-0 shadow-sm text-center py-5">
                                <i className="bi bi-check2-circle display-1 text-success mb-3"></i>
                                <h4>All Clear!</h4>
                                <p className="text-muted">No pending alerts or missing documents found.</p>
                            </div>
                        ) : (
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white py-3">
                                    <h5 className="mb-0">Active Notifications ({alerts.length})</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush">
                                        {alerts.map(alert => (
                                            <div key={alert.id} className="list-group-item list-group-item-action p-4">
                                                <div className="d-flex align-items-center gap-4">
                                                    <div className="alert-icon-wrapper p-3 rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                                        {getTypeIcon(alert.type)}
                                                    </div>
                                                    <div className="flex-grow-1">
                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                            <div>
                                                                <h6 className="mb-1 fw-bold fs-5">{alert.message}</h6>
                                                                <div className="d-flex align-items-center gap-2">
                                                                    <span className="fw-medium text-primary">
                                                                        {alert.employee_name}
                                                                    </span>
                                                                    <span className="text-muted small">Employee ID: {alert.employee_id}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-end">
                                                                {getPriorityBadge(alert.priority)}
                                                                <div className="text-muted small mt-1">
                                                                    {new Date(alert.created_at).toLocaleDateString()}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-flex gap-3 mt-3">
                                                            <button
                                                                className="btn btn-sm btn-primary px-3"
                                                                onClick={() => navigate(`/employees/${alert.employee_id}/profile`)}
                                                            >
                                                                Go to Profile
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary px-3"
                                                                onClick={() => alert(`Reminder sent for ${alert.employee_name}!`)}
                                                            >
                                                                Send Reminder
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .card { border-radius: 12px; }
                .list-group-item { transition: all 0.2s; border-left: 4px solid transparent; }
                .list-group-item:hover { background-color: #f8f9fa; border-left-color: #0d6efd; transform: translateX(5px); }
                .alert-icon-wrapper { box-shadow: inset 0 0 5px rgba(0,0,0,0.05); }
                .badge { font-weight: 600; padding: 0.5em 0.8em; }
                `
            }} />
        </Layout>
    );
};

export default AlertDashboard;
