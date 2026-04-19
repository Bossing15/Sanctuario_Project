import React, { useState, useEffect } from 'react';
import './RequirementReviewPanel.css';

function RequirementReviewPanel({ bookingId, onReviewComplete }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [bookingId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:8000/api/requirements/booking/${bookingId}/submissions`, {
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
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId, status) => {
    try {
      setReviewing(submissionId);
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`http://localhost:8000/api/requirements/submission/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          admin_notes: reviewNotes,
        }),
      });

      if (response.ok) {
        setSuccess(`Submission ${status} successfully`);
        setReviewNotes('');
        fetchSubmissions();
        if (onReviewComplete) {
          onReviewComplete();
        }
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to review submission');
      }
    } catch (err) {
      console.error('Error reviewing submission:', err);
      setError('An error occurred while reviewing');
    } finally {
      setReviewing(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fff3cd',
      approved: '#d4edda',
      rejected: '#f8d7da',
    };
    return colors[status] || '#f9f9f9';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      pending: '#856404',
      approved: '#155724',
      rejected: '#721c24',
    };
    return colors[status] || '#333';
  };

  if (loading) {
    return <div className="review-panel-loading">Loading submissions...</div>;
  }

  if (!submissions || submissions.length === 0) {
    return <div className="review-panel-empty">No submissions to review</div>;
  }

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');

  return (
    <div className="requirement-review-panel">
      <h3>Requirement Review</h3>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="submissions-list">
        {submissions.map((submission) => (
          <div 
            key={submission.id} 
            className="submission-card"
            style={{ backgroundColor: getStatusColor(submission.status) }}
          >
            <div className="submission-header">
              <div className="submission-info">
                <h4>{submission.requirement.name}</h4>
                <p className="filename">File: {submission.original_filename}</p>
              </div>
              <span 
                className="status-label"
                style={{ color: getStatusTextColor(submission.status) }}
              >
                {submission.status.toUpperCase()}
              </span>
            </div>

            {submission.admin_notes && (
              <div className="admin-notes">
                <strong>Admin Notes:</strong> {submission.admin_notes}
              </div>
            )}

            {submission.status === 'pending' && (
              <div className="review-actions">
                <textarea
                  placeholder="Add review notes (optional)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="review-notes"
                  rows="3"
                />
                <div className="action-buttons">
                  <button
                    className="btn btn-approve"
                    onClick={() => handleReview(submission.id, 'approved')}
                    disabled={reviewing === submission.id}
                  >
                    {reviewing === submission.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    className="btn btn-reject"
                    onClick={() => handleReview(submission.id, 'rejected')}
                    disabled={reviewing === submission.id}
                  >
                    {reviewing === submission.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {pendingSubmissions.length === 0 && (
        <div className="all-reviewed-message">
          All submissions have been reviewed
        </div>
      )}
    </div>
  );
}

export default RequirementReviewPanel;
