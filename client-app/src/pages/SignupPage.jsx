import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AlertModal from '../components/AlertModal';
import './SignupPage.css';
import logo from '../assets/images/home_logo/main_logo.jpg';


function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    deceasedName: '',
    email: '',
    address: '',
    plotNumber: '',
    section: '',
    phone: '',
    username: '',
    relationship: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  
  const [requirements, setRequirements] = useState([]);
  const [requirementFiles, setRequirementFiles] = useState({});
  const [viewingSample, setViewingSample] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
  
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };
  
  const handleRemoveFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const [loading, setLoading] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch requirements on component mount
  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoadingRequirements(true);
      const response = await fetch('http://localhost:8000/api/public/requirements');
      if (response.ok) {
        const data = await response.json();
        setRequirements(data.requirements || []);
      }
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoadingRequirements(false);
    }
  };

  const handleRequirementFileChange = (requirementId, file) => {
    setRequirementFiles(prev => ({
      ...prev,
      [requirementId]: file
    }));
  };

  const handleRemoveRequirementFile = (requirementId) => {
    setRequirementFiles(prev => {
      const updated = { ...prev };
      delete updated[requirementId];
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.agree) {
      setError('Please agree to the terms and conditions.');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    // Check if all mandatory requirements are uploaded
    const mandatoryRequirements = requirements.filter(req => req.is_mandatory);
    const missingRequirements = mandatoryRequirements.filter(req => !requirementFiles[req.id]);
    
    if (missingRequirements.length > 0) {
      setError(`Please upload all required documents: ${missingRequirements.map(r => r.name).join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
          password: form.password,
          password_confirmation: form.confirmPassword,
          role: 'client',
          access_level: 'client',
          // Client-specific fields
          deceased_name: form.deceasedName,
          grave_location: form.section && form.plotNumber ? `Section ${form.section}, Plot ${form.plotNumber}` : '',
          address: form.address,
          plot_number: form.plotNumber,
          phone: form.phone,
          relationship: form.relationship,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="left-panel">
        <div className="brand-row">
          <img src={logo} alt="Sanctuario De Carmona Memorial Park Logo" className="brand-logo enlarged-logo" />
        </div>
        <div className="form-card">
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Join Sanctuario De Carmona Memorial Park</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="signup-form">
            <input name="name" value={form.name} onChange={handleChange} placeholder="Enter Your Name" required />
            <input name="deceasedName" value={form.deceasedName} onChange={handleChange} placeholder="Deceased Name" required />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter Your Email Address" required />
            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
            <input name="plotNumber" value={form.plotNumber} onChange={handleChange} placeholder="Plot Number" required />
            <input name="section" value={form.section} onChange={handleChange} placeholder="Section (e.g., A, B, C)" required />
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone Number" />
            <input name="relationship" value={form.relationship} onChange={handleChange} placeholder="Relationship to Deceased" />
            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" required />
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" required />
            
            {/* Requirements Upload Section */}
            <div className="requirements-section">
              <label className="requirements-label">Required Documents *</label>
              
              {loadingRequirements ? (
                <div className="loading-requirements">Loading requirements...</div>
              ) : requirements.length === 0 ? (
                <div className="no-requirements">No requirements configured yet.</div>
              ) : (
                <div className="requirements-list">
                  {requirements.map((requirement) => (
                    <div key={requirement.id} className="requirement-item">
                      <div className="requirement-header">
                        <h4 className="requirement-name">
                          {requirement.name}
                          {requirement.is_mandatory && <span className="required-badge">*</span>}
                        </h4>
                        {requirement.description && (
                          <p className="requirement-description">{requirement.description}</p>
                        )}
                      </div>

                      {/* Sample Image Preview */}
                      {requirement.sample_image_path && (
                        <div className="sample-image-container">
                          <p className="sample-label">Sample Format:</p>
                          <div className="sample-image-wrapper">
                            <img 
                              src={`http://localhost:8000/storage/${requirement.sample_image_path}`}
                              alt={`Sample ${requirement.name}`}
                              className="sample-image-thumb"
                              onClick={() => setViewingSample(requirement.sample_image_path)}
                            />
                            <button
                              type="button"
                              className="view-sample-btn"
                              onClick={() => setViewingSample(requirement.sample_image_path)}
                            >
                              View Full Sample
                            </button>
                          </div>
                        </div>
                      )}

                      {/* File Upload */}
                      <div className="requirement-upload">
                        <input
                          type="file"
                          id={`req-${requirement.id}`}
                          accept="image/*,.pdf"
                          onChange={(e) => handleRequirementFileChange(requirement.id, e.target.files[0])}
                          style={{ display: 'none' }}
                        />
                        <label htmlFor={`req-${requirement.id}`} className="upload-btn">
                          {requirementFiles[requirement.id] ? 'Change File' : 'Choose File'}
                        </label>
                        
                        {requirementFiles[requirement.id] && (
                          <div className="uploaded-file-info">
                            <span className="file-name">{requirementFiles[requirement.id].name}</span>
                            <button
                              type="button"
                              className="remove-file-btn"
                              onClick={() => handleRemoveRequirementFile(requirement.id)}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <label className="terms-row">
              <input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />
              <span>Agree to Terms & Conditions</span>
            </label>
            <button 
              type="submit" 
              className={`btn-signup ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
            
            <div className="login-prompt">
              <span>Already have an account? </span>
              <button 
                type="button" 
                className="login-link" 
                onClick={() => navigate('/login')}
                disabled={loading}
              >
                Sign in here
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* Right side scenic background */}
      <div className="right-panel" />
      
      {/* Success Modal */}
      {showSuccessModal && (
        <AlertModal
          type="success"
          message="Registration successful! Please login with your credentials."
          onClose={() => {
            setShowSuccessModal(false);
            navigate('/login');
          }}
        />
      )}

      {/* Sample Image Modal */}
      {viewingSample && (
        <div 
          className="sample-modal-overlay"
          onClick={() => setViewingSample(null)}
        >
          <div className="sample-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="sample-modal-close"
              onClick={() => setViewingSample(null)}
            >
              ×
            </button>
            <img
              src={`http://localhost:8000/storage/${viewingSample}`}
              alt="Sample Document"
              className="sample-modal-image"
            />
            <p className="sample-modal-hint">
              Please upload a document that matches this format
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;
