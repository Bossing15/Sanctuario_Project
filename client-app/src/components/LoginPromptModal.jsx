import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModernModal from './ModernModal';
import '../styles/modals.css';

function LoginPromptModal({ onClose }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
    onClose();
  };

  const handleSignup = () => {
    navigate('/signup');
    onClose();
  };

  const footer = (
    <div className="confirmation-actions">
      <button className="modal-btn secondary" onClick={onClose}>
        Cancel
      </button>
      <button className="modal-btn primary" onClick={handleLogin}>
        Login
      </button>
      <button className="modal-btn success" onClick={handleSignup}>
        Sign Up
      </button>
    </div>
  );

  return (
    <ModernModal
      isOpen={true}
      onClose={onClose}
      title="Login Required"
      icon="👤"
      footer={footer}
      size="sm"
    >
      <div className="login-prompt-message">
        Please login or create an account to book a service
      </div>
    </ModernModal>
  );
}

export default LoginPromptModal;
