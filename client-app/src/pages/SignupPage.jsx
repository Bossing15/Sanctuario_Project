import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaLock, FaCheckCircle, FaTimes, FaFileAlt } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import { MAIN_LOGO, LOGO_ALT_TEXT, LOGO_CLASSES } from '../config/logoConfig';
import './SignupPage.css';


function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    username: '',
    password: '',
    confirmPassword: '',
    agree: false,
  });
  
  const [requirements, setRequirements] = useState([]);
  const [requirementFiles, setRequirementFiles] = useState({});
  const [viewingSample, setViewingSample] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const [loading, setLoading] = useState(false);
  const [loadingRequirements, setLoadingRequirements] = useState(true);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
    setRequirementFiles(prev => ({ ...prev, [requirementId]: file }));
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
    setFieldErrors({});

    // Client-side validation
    const errors = {};
    if (!form.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!form.username.trim()) {
      errors.username = 'Username is required';
    }
    if (!form.password) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!form.agree) {
      errors.agree = 'You must agree to the Terms & Conditions';
      setError('Please agree to the Terms & Conditions to continue.');
    }

    const mandatoryRequirements = requirements.filter(req => req.is_mandatory);
    const missingRequirements = mandatoryRequirements.filter(req => !requirementFiles[req.id]);
    if (missingRequirements.length > 0) {
      errors.requirements = true;
      setError(`Please upload all required documents: ${missingRequirements.map(r => r.name).join(', ')}`);
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShakeFields(errors);
      setTimeout(() => setShakeFields({}), 400);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
          password: form.password,
          password_confirmation: form.confirmPassword,
          role: 'client',
          access_level: 'client',
          phone: form.phone,
          address: form.address,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowSuccessModal(true);
      } else {
        const serverErrors = {};
        if (data.errors) {
          Object.keys(data.errors).forEach(key => {
            serverErrors[key] = data.errors[key][0];
          });
        }
        setFieldErrors(serverErrors);
        setShakeFields(serverErrors);
        setTimeout(() => setShakeFields({}), 400);
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFieldFocus = (fieldName) => {
    setFocusedField(fieldName);
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };
  
  const handleFieldBlur = () => {
    setFocusedField(null);
  };

  return (
    <div className="signup-wrapper">
      <div className="left-panel">
        <div className="brand-row">
          <img src={MAIN_LOGO} alt={LOGO_ALT_TEXT.main} className={LOGO_CLASSES.page} />
        </div>
        
        <div className="form-card">
          <div className="signup-header">
            <h2>Create Account</h2>
            <p>Join Sanctuario De Carmona Memorial Park</p>
          </div>
          
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="signup-form">

            {/* ── Personal Information ── */}
            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.name ? 'error' : ''} ${shakeFields.name ? 'shake' : ''}`}>
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('name')}
                  onBlur={handleFieldBlur}
                  required
                  autoComplete="name"
                  className={form.name || focusedField === 'name' ? 'has-value' : ''}
                />
              </div>
              {fieldErrors.name && (
                <span className="field-error-message">{fieldErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.email ? 'error' : ''} ${shakeFields.email ? 'shake' : ''}`}>
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="e.g., name@company.com"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('email')}
                  onBlur={handleFieldBlur}
                  required
                  autoComplete="email"
                  className={form.email || focusedField === 'email' ? 'has-value' : ''}
                />
              </div>
              {fieldErrors.email && (
                <span className="field-error-message">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.phone ? 'error' : ''} ${shakeFields.phone ? 'shake' : ''}`}>
                <FaPhone className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="e.g., +63 912 345 6789"
                  value={form.phone}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('phone')}
                  onBlur={handleFieldBlur}
                  autoComplete="tel"
                  className={form.phone || focusedField === 'phone' ? 'has-value' : ''}
                />
              </div>
              {fieldErrors.phone && (
                <span className="field-error-message">{fieldErrors.phone}</span>
              )}
            </div>

            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.address ? 'error' : ''} ${shakeFields.address ? 'shake' : ''}`}>
                <FaMapMarkerAlt className="input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="e.g., 123 Main St, City"
                  value={form.address}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('address')}
                  onBlur={handleFieldBlur}
                  autoComplete="street-address"
                  className={form.address || focusedField === 'address' ? 'has-value' : ''}
                />
              </div>
              {fieldErrors.address && (
                <span className="field-error-message">{fieldErrors.address}</span>
              )}
            </div>

            {/* ── Account Credentials ── */}
            <div className="form-divider">
              <span>Account Credentials</span>
            </div>

            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.username ? 'error' : ''} ${shakeFields.username ? 'shake' : ''}`}>
                <FaUser className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={form.username}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('username')}
                  onBlur={handleFieldBlur}
                  required
                  autoComplete="username"
                  className={form.username || focusedField === 'username' ? 'has-value' : ''}
                />
              </div>
              {fieldErrors.username && (
                <span className="field-error-message">{fieldErrors.username}</span>
              )}
            </div>

            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.password ? 'error' : ''} ${shakeFields.password ? 'shake' : ''}`}>
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('password')}
                  onBlur={handleFieldBlur}
                  required
                  autoComplete="new-password"
                  className={form.password || focusedField === 'password' ? 'has-value' : ''}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex="-1">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="field-hint">Minimum 8 characters</div>
              {fieldErrors.password && (
                <span className="field-error-message">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <div className={`input-wrapper ${fieldErrors.confirmPassword ? 'error' : ''} ${shakeFields.confirmPassword ? 'shake' : ''}`}>
                <FaLock className="input-icon" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  onFocus={() => handleFieldFocus('confirmPassword')}
                  onBlur={handleFieldBlur}
                  required
                  autoComplete="new-password"
                  className={form.confirmPassword || focusedField === 'confirmPassword' ? 'has-value' : ''}
                />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} tabIndex="-1">
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="field-error-message">{fieldErrors.confirmPassword}</span>
              )}
            </div>
            
            {/* ── Required Documents ── */}
            {requirements.length > 0 && (
              <>
                <div className="form-divider">
                  <span>Required Documents</span>
                </div>
                <div className="requirements-section">
                  {loadingRequirements ? (
                    <div className="loading-requirements">Loading requirements...</div>
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
                          {requirement.sample_image_path && (
                            <div className="sample-image-container">
                              <img
                                src={`http://localhost:8000/storage/${requirement.sample_image_path}`}
                                alt={`Sample ${requirement.name}`}
                                className="sample-image-thumb"
                                onClick={() => setViewingSample(requirement.sample_image_path)}
                              />
                              <button type="button" className="view-sample-btn" onClick={() => setViewingSample(requirement.sample_image_path)}>
                                View Sample
                              </button>
                            </div>
                          )}
                          <div className="requirement-upload">
                            <input
                              type="file"
                              id={`req-${requirement.id}`}
                              accept="image/*,.pdf"
                              onChange={(e) => handleRequirementFileChange(requirement.id, e.target.files[0])}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor={`req-${requirement.id}`} className="upload-btn">
                              {requirementFiles[requirement.id] ? <><FaCheckCircle /> File Selected</> : 'Choose File'}
                            </label>
                            {requirementFiles[requirement.id] && (
                              <div className="uploaded-file-info">
                                <span className="file-name">{requirementFiles[requirement.id].name}</span>
                                <button type="button" className="remove-file-btn" onClick={() => handleRemoveRequirementFile(requirement.id)}>×</button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* ── Terms & Conditions ── */}
            <div className="form-divider-plain"></div>

            <div className="terms-row">
              <input
                type="checkbox"
                id="agree"
                name="agree"
                checked={form.agree}
                onChange={handleChange}
                className="custom-checkbox"
              />
              <label htmlFor="agree" className="terms-label">
                I have read and agree to the{' '}
                <button
                  type="button"
                  className="terms-link"
                  onClick={() => setShowTermsModal(true)}
                >
                  Terms &amp; Conditions
                </button>
              </label>
            </div>
            
            <button
              type="submit"
              className={`btn-signup ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg className="spinner-icon" fill="none" viewBox="0 0 24 24" style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }}>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
            
            <div className="login-prompt">
              <span>Already have an account? </span>
              <button type="button" className="login-link" onClick={() => navigate('/login')} disabled={loading}>
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="right-panel" />
      
      {/* ── Terms & Conditions Modal ── */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <div className="terms-modal-title">
                <FaFileAlt className="terms-title-icon" />
                <h2>Terms &amp; Conditions</h2>
              </div>
              <button className="terms-modal-close" onClick={() => setShowTermsModal(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="terms-modal-body">
              <p className="terms-effective">
                <strong>Effective Date:</strong> January 1, 2024 &nbsp;|&nbsp;
                <strong>Sanctuario De Carmona Memorial Park</strong><br />
                Calumpang Rd, Carmona, Cavite, Philippines
              </p>

              <p className="terms-intro">
                Welcome to Sanctuario De Carmona Memorial Park. By creating an account and using our
                website or services, you agree to be bound by the following Terms &amp; Conditions.
                Please read them carefully before proceeding.
              </p>

              <div className="terms-section">
                <h3>1. Acceptance of Terms</h3>
                <p>
                  By registering for an account, accessing our website, or using any of our services,
                  you acknowledge that you have read, understood, and agree to be bound by these Terms
                  &amp; Conditions and our Privacy Policy. If you do not agree, please do not use our
                  services.
                </p>
              </div>

              <div className="terms-section">
                <h3>2. About Sanctuario De Carmona Memorial Park</h3>
                <p>
                  Sanctuario De Carmona Memorial Park is a peaceful sanctuary dedicated to honoring
                  the memory of your loved ones. With over a decade of experience, we provide
                  compassionate care and professional services in a serene environment located in
                  Carmona, Cavite, Philippines. Our services include:
                </p>
                <ul>
                  <li>Memorial Lots &amp; Burial Services (Lawn Lots, Family Estates)</li>
                  <li>Columbarium &amp; Cremation Services</li>
                  <li>Interment Services</li>
                  <li>Grave Maintenance &amp; Landscaping (cleaning, repainting, restoration)</li>
                  <li>Memorial Planning &amp; Consultation</li>
                  <li>24/7 Security &amp; Care</li>
                </ul>
              </div>

              <div className="terms-section">
                <h3>3. Account Registration</h3>
                <p>
                  To access certain features of our platform, you must register for an account. You agree to:
                </p>
                <ul>
                  <li>Provide accurate, current, and complete information during registration.</li>
                  <li>Choose a unique username and a strong password of at least 8 characters.</li>
                  <li>Keep your login credentials confidential and not share them with any third party.</li>
                  <li>Notify us immediately of any unauthorized use of your account.</li>
                  <li>Be responsible for all activities that occur under your account.</li>
                </ul>
                <p>
                  We reserve the right to suspend or terminate accounts that provide false information
                  or violate these Terms.
                </p>
              </div>

              <div className="terms-section">
                <h3>4. Services &amp; Bookings</h3>
                <p>
                  All service requests, reservations, and bookings made through our platform are subject
                  to availability and management approval. We reserve the right to accept or decline any
                  service request at our discretion. Once a booking is approved, you will be notified
                  via your registered email address.
                </p>
                <p>
                  For grave maintenance services — including Grave Maintenance, Grave Repainting, Grave
                  Restoration, and Grave Cleaning — you must have an existing grave plot (Lawn Lot,
                  Columbarium, or Family Estate) registered under your account before requesting
                  maintenance services.
                </p>
              </div>

              <div className="terms-section">
                <h3>5. Payments &amp; Billing</h3>
                <p>
                  All payments for our products and services must be made through the official payment
                  channels provided on our platform. By making a payment, you agree that:
                </p>
                <ul>
                  <li>All fees are stated in Philippine Peso (₱) and are subject to change.</li>
                  <li>Payment plans (Monthly, Quarterly, Yearly) are available for select services.</li>
                  <li>Payments are due on the dates specified in your billing schedule.</li>
                  <li>Overdue payments may result in suspension of services.</li>
                  <li>All transactions are processed securely through our payment provider (PayMongo).</li>
                </ul>
                <p>
                  Refunds, if applicable, are subject to our refund policy and will be processed within
                  a reasonable timeframe. Please contact us for refund inquiries.
                </p>
              </div>

              <div className="terms-section">
                <h3>6. Required Documents</h3>
                <p>
                  Certain services require the submission of supporting documents during registration
                  or service application. You agree to upload only genuine, accurate, and legally valid
                  documents. Submission of falsified or fraudulent documents will result in immediate
                  account termination and may be subject to legal action.
                </p>
              </div>

              <div className="terms-section">
                <h3>7. User Conduct</h3>
                <p>You agree not to:</p>
                <ul>
                  <li>Use our platform for any unlawful purpose or in violation of any regulations.</li>
                  <li>Attempt to gain unauthorized access to any part of our system.</li>
                  <li>Upload malicious content, viruses, or harmful code.</li>
                  <li>Harass, abuse, or harm other users or our staff.</li>
                  <li>Misrepresent your identity or affiliation.</li>
                  <li>Use automated tools to scrape or extract data from our platform.</li>
                </ul>
              </div>

              <div className="terms-section">
                <h3>8. Privacy &amp; Data Protection</h3>
                <p>
                  We are dedicated to ensuring the privacy and security of all individuals who access
                  our website and services. We collect your name, email address, phone number, and
                  address solely to facilitate service requests, process payments, provide support, and
                  enhance your user experience.
                </p>
                <p>
                  Your information may be shared with service providers who perform functions on our
                  behalf. These providers are obligated to maintain the confidentiality and security of
                  your information. We implement appropriate technical and organizational measures —
                  including encryption — to protect your personal data.
                </p>
                <p>
                  For full details, please review our{' '}
                  <button
                    type="button"
                    className="terms-link inline"
                    onClick={() => { setShowTermsModal(false); navigate('/privacy'); }}
                  >
                    Privacy Policy
                  </button>.
                </p>
              </div>

              <div className="terms-section">
                <h3>9. Intellectual Property</h3>
                <p>
                  All content on this platform — including text, images, logos, and service
                  descriptions — is the property of Sanctuario De Carmona Memorial Park and is
                  protected by applicable intellectual property laws. You may not reproduce, distribute,
                  or create derivative works without our express written permission.
                </p>
              </div>

              <div className="terms-section">
                <h3>10. Limitation of Liability</h3>
                <p>
                  Sanctuario De Carmona Memorial Park shall not be liable for any indirect, incidental,
                  special, or consequential damages arising from your use of our services or platform.
                  Our total liability shall not exceed the amount paid by you for the specific service
                  giving rise to the claim.
                </p>
              </div>

              <div className="terms-section">
                <h3>11. Modifications to Terms</h3>
                <p>
                  We reserve the right to update or modify these Terms &amp; Conditions at any time.
                  Changes will be posted on our website with an updated effective date. Continued use
                  of our services after any changes constitutes your acceptance of the new Terms.
                </p>
              </div>

              <div className="terms-section">
                <h3>12. Governing Law</h3>
                <p>
                  These Terms &amp; Conditions are governed by and construed in accordance with the
                  laws of the Republic of the Philippines. Any disputes arising from these Terms shall
                  be subject to the exclusive jurisdiction of the courts of Cavite, Philippines.
                </p>
              </div>

              <div className="terms-section">
                <h3>13. Contact Us</h3>
                <p>
                  For questions, concerns, or inquiries regarding these Terms &amp; Conditions, please
                  contact us:
                </p>
                <ul>
                  <li><strong>Address:</strong> Calumpang Rd, Carmona, Cavite, Philippines</li>
                  <li><strong>Email:</strong> info@sanctuariodecarmona.com</li>
                  <li><strong>Phone:</strong> 0912-345-6789</li>
                </ul>
              </div>
            </div>

            <div className="terms-modal-footer">
              <button
                type="button"
                className="terms-accept-btn"
                onClick={() => {
                  setForm(prev => ({ ...prev, agree: true }));
                  setShowTermsModal(false);
                }}
              >
                I Accept the Terms &amp; Conditions
              </button>
              <button
                type="button"
                className="terms-decline-btn"
                onClick={() => setShowTermsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <AlertModal
          type="success"
          message="Registration successful! Please login with your credentials."
          onClose={() => { setShowSuccessModal(false); navigate('/login'); }}
        />
      )}

      {/* Sample Image Modal */}
      {viewingSample && (
        <div className="sample-modal-overlay" onClick={() => setViewingSample(null)}>
          <div className="sample-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="sample-modal-close" onClick={() => setViewingSample(null)}>×</button>
            <img
              src={`http://localhost:8000/storage/${viewingSample}`}
              alt="Sample Document"
              className="sample-modal-image"
            />
            <p className="sample-modal-hint">Please upload a document that matches this format</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignupPage;

