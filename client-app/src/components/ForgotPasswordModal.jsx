import React, { useState } from 'react';
import './ForgotPasswordModal.css';

function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [step, setStep] = useState('email'); // 'email' or 'sent'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessageType('success');
        setMessage(data.message);
        setStep('sent');
        setEmail('');
      } else {
        setMessageType('error');
        setMessage(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessageType('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setMessage('');
    setMessageType('');
    setStep('email');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="forgot-password-overlay" onClick={handleClose}>
      <div className="forgot-password-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Reset Your Password</h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-content">
          {step === 'email' ? (
            <>
              <p className="modal-description">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                  />
                </div>

                {message && (
                  <div className={`message ${messageType}`}>
                    {messageType === 'error' && '⚠️ '}
                    {messageType === 'success' && '✓ '}
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div className="success-state">
              <div className="success-icon">✓</div>
              <h3>Check Your Email</h3>
              <p>We've sent a password reset link to <strong>{email}</strong></p>
              <p className="info-text">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
              <button className="btn-done" onClick={handleClose}>
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
