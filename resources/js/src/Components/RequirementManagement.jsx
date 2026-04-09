import { useState, useEffect } from "react";
import requirementIcon from "../assets/icons/Requirements.png";
import usePermissions from '../utils/usePermissions';

function SubmissionReviewCard({ booking, onReviewComplete, canManageRequirements }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [viewingImage, setViewingImage] = useState(null);

  useEffect(() => {
    fetchBookingSubmissions();
  }, [booking.id]);

  const fetchBookingSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/requirements/booking/${booking.id}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions || []);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId, status, notes = '') => {
    if (!canManageRequirements) {
      return;
    }
    
    try {
      setReviewing(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/requirements/submission/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          status,
          admin_notes: notes,
        }),
      });

      if (response.ok) {
        alert(`Submission ${status} successfully!`);
        fetchBookingSubmissions();
        onReviewComplete();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Review failed:', errorData);
        alert(`Failed to review submission: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert('An error occurred while reviewing');
    } finally {
      setReviewing(false);
    }
  };

  const handleApproveAll = async () => {
    if (!confirm('Are you sure you want to approve all submissions for this booking?')) return;

    for (const submission of submissions) {
      if (submission.status === 'pending') {
        await handleReview(submission.id, 'approved');
      }
    }
  };

  const handleRejectSubmission = async (submissionId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    await handleReview(submissionId, 'rejected', reason);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-800">
            Booking #{booking.id} - {booking.service?.title}
          </h4>
          <p className="text-sm text-gray-600">
            Client: {booking.user?.name} ({booking.user?.email})
          </p>
          <p className="text-sm text-gray-500">
            Submitted: {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handleApproveAll}
          disabled={!canManageRequirements || reviewing || submissions.every(s => s.status !== 'pending')}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title={!canManageRequirements ? 'You do not have permission to approve submissions' : ''}
        >
          Approve All
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-600">Loading submissions...</p>
      ) : (
        <div className="space-y-3 mt-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="border border-gray-100 rounded p-3 bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{submission.requirement?.name}</p>
                  <p className="text-sm text-gray-600">{submission.original_filename}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {submission.status.toUpperCase()}
                    </span>
                    {submission.validation_status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        submission.validation_status === 'auto_approved' ? 'bg-green-100 text-green-800' :
                        submission.validation_status === 'flagged' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {submission.validation_status === 'auto_approved' ? '✓ AUTO-APPROVED' :
                         submission.validation_status === 'flagged' ? '⚠ FLAGGED' :
                         '⚡ NEEDS REVIEW'}
                      </span>
                    )}
                    {submission.similarity_score !== null && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Score: {submission.similarity_score}%
                      </span>
                    )}
                  </div>
                  {submission.validation_notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Validation:</strong> {submission.validation_notes}
                    </p>
                  )}
                  {submission.admin_notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Admin Notes:</strong> {submission.admin_notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      const imagePath = `http://localhost:8000/storage/${submission.file_path}`;
                      console.log('Opening image:', imagePath);
                      console.log('File path:', submission.file_path);
                      setViewingImage(imagePath);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    View
                  </button>
                  {submission.status === 'pending' && canManageRequirements && (
                    <>
                      <button
                        onClick={() => handleReview(submission.id, 'approved')}
                        disabled={reviewing}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectSubmission(submission.id)}
                        disabled={reviewing}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {viewingImage && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
          onClick={() => setViewingImage(null)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-8">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              style={{ cursor: 'pointer' }}
            >
              ×
            </button>
            <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
              <img
                src={viewingImage}
                alt="Requirement Document"
                style={{ 
                  maxWidth: '80vw', 
                  maxHeight: '80vh', 
                  objectFit: 'contain',
                  display: 'block'
                }}
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => {
                  console.error('Image failed to load:', viewingImage);
                  alert('Failed to load image. Path: ' + viewingImage);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequirementManagement() {
  const { canPerformActions } = usePermissions();
  const canManageRequirements = canPerformActions('requirements');
  const [activeTab, setActiveTab] = useState("requirements");
  
  // Debug log to verify component is loaded
  console.log('RequirementManagement component loaded, activeTab:', activeTab);
  const [requirements, setRequirements] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState(null);
  const [sampleImage, setSampleImage] = useState(null);
  const [sampleImagePreview, setSampleImagePreview] = useState(null);
  const [newRequirement, setNewRequirement] = useState({
    name: "",
    description: "",
    file_type: "image",
    max_file_size: 5242880,
    is_mandatory: true
  });

  useEffect(() => {
    if (activeTab === "requirements") {
      fetchRequirements();
    } else if (activeTab === "review") {
      fetchSubmissions();
    }
  }, [activeTab]);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/requirements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequirements(data.requirements);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/bookings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const bookingsWithSubmissions = (data.bookings || []).filter(booking => 
          booking.service?.category === 'Grave Maintenance' && 
          booking.requirement_submissions && 
          booking.requirement_submissions.length > 0
        );
        setSubmissions(bookingsWithSubmissions);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    
    if (!canManageRequirements) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const url = editingRequirement 
        ? `/api/requirements/${editingRequirement.id}`
        : '/api/requirements';
      const method = editingRequirement ? 'PUT' : 'POST';

      const formData = new FormData();
      formData.append('name', newRequirement.name);
      formData.append('description', newRequirement.description || '');
      formData.append('file_type', newRequirement.file_type);
      formData.append('max_file_size', newRequirement.max_file_size);
      formData.append('is_mandatory', newRequirement.is_mandatory ? '1' : '0');
      
      if (sampleImage) {
        formData.append('sample_image', sampleImage);
      }

      if (method === 'PUT') {
        formData.append('_method', 'PUT');
      }

      const response = await fetch(url, {
        method: method === 'PUT' ? 'POST' : method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingRequirement(null);
        setSampleImage(null);
        setSampleImagePreview(null);
        setNewRequirement({
          name: "",
          description: "",
          file_type: "image",
          max_file_size: 5242880,
          is_mandatory: true
        });
        fetchRequirements();
        alert(editingRequirement ? 'Requirement updated successfully!' : 'Requirement created successfully!');
      } else if (response.status === 403) {
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        alert('Error: ' + (errorData.message || 'Failed to save requirement'));
      }
    } catch (error) {
      console.error('Error saving requirement:', error);
      alert('Error saving requirement: ' + error.message);
    }
  };

  const handleEditRequirement = (requirement) => {
    setEditingRequirement(requirement);
    setNewRequirement({
      name: requirement.name,
      description: requirement.description || "",
      file_type: requirement.file_type,
      max_file_size: requirement.max_file_size,
      is_mandatory: requirement.is_mandatory
    });
    setSampleImage(null);
    setSampleImagePreview(requirement.sample_image_path ? `http://localhost:8000/storage/${requirement.sample_image_path}` : null);
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingRequirement(null);
    setSampleImage(null);
    setSampleImagePreview(null);
    setNewRequirement({
      name: "",
      description: "",
      file_type: "image",
      max_file_size: 5242880,
      is_mandatory: true
    });
  };

  const handleSampleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSampleImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSampleImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteRequirement = async (id) => {
    if (!canManageRequirements) {
      return;
    }
    
    if (!confirm('Are you sure you want to delete this requirement?')) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/requirements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        fetchRequirements();
      }
    } catch (error) {
      console.error('Error deleting requirement:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* FRESH REBUILD - Component Version 2.0 */}
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={requirementIcon} alt="Requirements Icon" style={{ width: '2.5rem', height: '2.5rem', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', margin: '0' }}>Requirement Management</h1>
        </div>
        {!canManageRequirements && (
          <p style={{ fontSize: '0.875rem', color: '#ea580c', marginTop: '0.5rem', marginLeft: '3.5rem' }}>
            <span style={{ fontWeight: '600' }}>View Only:</span> You can view requirements but cannot add, edit, or delete them.
          </p>
        )}
      </div>

      {/* Tabs - BILLING STYLE WITH ROUNDED BACKGROUNDS */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('requirements')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
            background: activeTab === 'requirements' ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : '#ffffff',
            color: activeTab === 'requirements' ? '#ffffff' : '#374151',
            boxShadow: activeTab === 'requirements' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            display: 'inline-block',
            whiteSpace: 'nowrap'
          }}
        >
          Manage Requirements
        </button>
        <button
          onClick={() => setActiveTab('review')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
            background: activeTab === 'review' ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : '#ffffff',
            color: activeTab === 'review' ? '#ffffff' : '#374151',
            boxShadow: activeTab === 'review' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
            display: 'inline-block',
            whiteSpace: 'nowrap'
          }}
        >
          Review Submissions
        </button>
      </div>

      {/* Requirements Tab */}
      {activeTab === 'requirements' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', backgroundColor: 'white', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0' }}>Requirement Definitions</h3>
            <button
              onClick={() => canManageRequirements && setShowAddForm(true)}
              disabled={!canManageRequirements}
              style={{
                background: '#16a34a',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: canManageRequirements ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                fontSize: '0.875rem',
                opacity: canManageRequirements ? 1 : 0.5
              }}
              title={!canManageRequirements ? 'You do not have permission to add requirements' : ''}
            >
              Add New Requirement
            </button>
          </div>

          {showAddForm && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e5e7eb', borderRadius: '0.75rem', backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                {editingRequirement ? 'Edit Requirement' : 'Create New Requirement'}
              </h4>
              <form onSubmit={handleCreateRequirement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={newRequirement.name}
                      onChange={(e) => setNewRequirement({...newRequirement, name: e.target.value})}
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                      File Type
                    </label>
                    <select
                      value={newRequirement.file_type}
                      onChange={(e) => setNewRequirement({...newRequirement, file_type: e.target.value})}
                      style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                    >
                      <option value="image">Image Only</option>
                      <option value="pdf">PDF</option>
                      <option value="document">Document</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Description
                  </label>
                  <textarea
                    value={newRequirement.description}
                    onChange={(e) => setNewRequirement({...newRequirement, description: e.target.value})}
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem', minHeight: '100px' }}
                    rows="3"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                    Sample Image (Reference for Users)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSampleImageChange}
                    style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                    Upload a sample image showing users what format their document should look like
                  </p>
                  {sampleImagePreview && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Preview:</p>
                      <img 
                        src={sampleImagePreview} 
                        alt="Sample preview" 
                        style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #d1d5db', borderRadius: '0.5rem', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                  >
                    {editingRequirement ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    style={{
                      background: '#6b7280',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.5rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Sample</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requirements.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                      <div style={{ fontSize: '1rem', fontWeight: '500' }}>
                        📋 No requirements found
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
                        Create your first requirement to get started
                      </p>
                    </td>
                  </tr>
                ) : (
                  requirements.map((requirement) => (
                    <tr key={requirement.id}>
                      <td>
                        <div>
                          <div className="font-bold">{requirement.name}</div>
                          <div className="text-sm text-gray-500">{requirement.description}</div>
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`status-badge ${
                          requirement.file_type === 'image' 
                            ? 'info' 
                            : requirement.file_type === 'pdf'
                            ? 'warning'
                            : 'info'
                        }`}>
                          {requirement.file_type === 'image' ? 'Image Only' : requirement.file_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-center">
                        {requirement.sample_image_path ? (
                          <span className="status-badge completed">✓ Has Sample</span>
                        ) : (
                          <span className="status-badge inactive">No Sample</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => canManageRequirements && handleEditRequirement(requirement)}
                            disabled={!canManageRequirements}
                            className={`action-btn primary ${!canManageRequirements ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!canManageRequirements ? 'You do not have permission to edit requirements' : ''}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRequirement(requirement.id)}
                            disabled={!canManageRequirements}
                            className={`action-btn danger ${!canManageRequirements ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={!canManageRequirements ? 'You do not have permission to delete requirements' : ''}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Tab */}
      {activeTab === 'review' && (
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '2rem' }}>Review Requirement Submissions</h3>
          {loading ? (
            <p>Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <p className="text-gray-600">No pending submissions to review.</p>
          ) : (
            <div className="space-y-4">
              {submissions.map((booking) => (
                <SubmissionReviewCard 
                  key={booking.id} 
                  booking={booking} 
                  onReviewComplete={fetchSubmissions}
                  canManageRequirements={canManageRequirements}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
