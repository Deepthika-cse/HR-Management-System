import React, { useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';

const DocumentManager = ({ empId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [formData, setFormData] = useState({
        document_type: 'AADHAAR',
        document_name: '',
        file: null,
        remarks: ''
    });

    const fetchDocuments = async () => {
        try {
            const data = await employeeApi.getDocuments(empId);
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [empId]);

    const handleUpload = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('document_type', formData.document_type);
            data.append('document_name', formData.document_name);
            data.append('file', formData.file);
            if (formData.remarks) data.append('remarks', formData.remarks);

            await employeeApi.uploadDocument(empId, data);
            setShowUpload(false);
            setFormData({ document_type: 'AADHAAR', document_name: '', file: null, remarks: '' });
            fetchDocuments();
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading document. Please check all fields.');
        }
    };

    const handleVerify = async (docId, status) => {
        const remarks = prompt(`Enter remarks for ${status.toLowerCase()}:`);
        if (remarks === null) return;
        try {
            await employeeApi.verifyDocument(empId, docId, { status, remarks });
            fetchDocuments();
        } catch (error) {
            alert('Error updating status.');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED': return <span className="badge bg-success">Verified</span>;
            case 'REJECTED': return <span className="badge bg-danger">Rejected</span>;
            default: return <span className="badge bg-warning text-dark">Pending</span>;
        }
    };

    if (loading) return <div>Loading documents...</div>;

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Compliance Documents</h5>
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowUpload(!showUpload)}
                >
                    {showUpload ? 'Cancel' : 'Add Document'}
                </button>
            </div>
            <div className="card-body">
                {showUpload && (
                    <form onSubmit={handleUpload} className="mb-4 p-3 border rounded bg-light">
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label className="form-label small">Type</label>
                                <select
                                    className="form-select form-select-sm"
                                    value={formData.document_type}
                                    onChange={e => setFormData({ ...formData, document_type: e.target.value })}
                                    required
                                >
                                    <option value="AADHAAR">Aadhaar Card</option>
                                    <option value="PAN">PAN Card</option>
                                    <option value="PASSPORT">Passport</option>
                                    <option value="VOTER_ID">Voter ID</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small">Document Name</label>
                                <input
                                    type="text"
                                    className="form-select form-select-sm"
                                    value={formData.document_name}
                                    onChange={e => setFormData({ ...formData, document_name: e.target.value })}
                                    placeholder="e.g. My PAN Card"
                                    required
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small">Document File</label>
                                <input
                                    type="file"
                                    className="form-control form-control-sm"
                                    onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                    required
                                />
                            </div>
                            <div className="col-12">
                                <button type="submit" className="btn btn-sm btn-success w-100">Upload Record</button>
                            </div>
                        </div>
                    </form>
                )}

                {documents.length === 0 ? (
                    <p className="text-muted text-center my-3">No documents found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th className="small">Document</th>
                                    <th className="small">Type</th>
                                    <th className="small">Status</th>
                                    <th className="small">Uploaded</th>
                                    <th className="small text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {documents.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="fw-bold">{doc.document_name}</div>
                                            <a href={doc.file} target="_blank" rel="noreferrer" className="small">View File</a>
                                        </td>
                                        <td className="small">{doc.document_type_display}</td>
                                        <td>{getStatusBadge(doc.status)}</td>
                                        <td className="small">{new Date(doc.uploaded_at).toLocaleDateString()}</td>
                                        <td className="text-end">
                                            {doc.status === 'PENDING' && (
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-success"
                                                        onClick={() => handleVerify(doc.id, 'VERIFIED')}
                                                    >
                                                        Verify
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleVerify(doc.id, 'REJECTED')}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                            {doc.remarks && <div className="small text-muted mt-1 italic">"{doc.remarks}"</div>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;
