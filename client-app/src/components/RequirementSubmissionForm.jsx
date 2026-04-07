import React, { useState, useEffect } from 'react';
import './RequirementSubmissionForm.css';

function RequirementSubmissionForm({ bookingId, onSubmitSuccess }) {
  const [requirements, setRequirements] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRequirements();
  }, [bookingId]);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/requirements/booking/${bookingId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error('Error fetching requirements:', err);
      setError('Failed to load requirements');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (requirementId, file) => {
    setSubmissions(prev => ({
      ...prev,
      [requirementId]: {
        ...prev[requirementId],
        file: file
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();

      let hasFiles = false;
      Object.entries(submissions).forEach(([requirementId, submission]) => {
        if (submission.file) {
          formData.append(`requirements[${requirementId}][requirement_id]`, requirementId);
          formData.append(`requirements[${requirementId}][file]`, submission.file);
          hasFiles = true;
        }
      });

      if (!hasFiles) {
        setError('Please select at least one file to upload');
        setSubmitting(false);
        return;
      }

      const response = await fetch(`/api/requirements/booking/${bookingId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess('Requirements submitted successfully!');
        fetchRequirements();
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit requirements');
      }
    } catch (err) {
      console.error('Error submitting requirements:', err);
      setError('An error occurred while submitting requirements');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'badge-pending',
      approved: 'badge-approved',
      rejected: 'badge-rejected',
    };
    return statusClasses[status] || 'badge-pending';
  };

  if (loading) {
    return <div className="requirement-form-loading">Loading requirements...</div>;
  }

  if (!submissions || submissions.length === 0) {
    return <div className="requirement-form-empty">No requirements for this booking</div>;
  }

  return (
    <div className="requirement-submission-form">
      <h3>Submit Required Documents</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="requirements-list">
          {submissions.map((submission) => (
            <div key={submission.id} className="requirement-item">
              <div className="requirement-header">
                <h4>{submission.requirement.name}</h4>
                <span className={`status-badge ${getStatusBadge(submission.status)}`}>
                  {submission.status}
                </span>
              </div>

              {submission.requirement.description && (
                <p className="requirement-description">{submission.requirement.description}</p>
              )}

              <div className="file-upload-section">
                {submission.status === 'approved' ? (
                  <div className="approved-file">
                    <span className="checkmark">✓</span>
                    <span>{submission.original_filename}</span>
                  </div>
                ) : submission.status === 'rejected' ? (
                  <>
                    <div className="rejected-file">
                      <span className="x-mark">✕</span>
                      <span>{submission.original_filename}</span>
                    </div>
                    {submission.admin_notes && (
                      <p className="admin-notes">Admin Notes: {submission.admin_notes}</p>
                    )}
                    <label className="file-input-label">
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(submission.requirement_id, e.target.files[0])}
                        accept={submission.requirement.file_type}
                        disabled={submitting}
                      />
                      <span>Resubmit File</span>
                    </label>
                  </>
                ) : (
                  <label className="file-input-label">
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(submission.requirement_id, e.target.files[0])}
                      accept={submission.requirement.file_type}
                      disabled={submitting}
                    />
                    <span>
                      {submissions[submission.requirement_id]?.file?.name || 'Choose File'}
                    </span>
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Requirements'}
        </button>
      </form>
    </div>
  );
}

export default RequirementSubmissionForm;
