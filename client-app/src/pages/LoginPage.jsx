import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import './LoginPage.css';
import { useNavigate } from 'react-router-dom';

const logo = '/Sanctuario_Logo_Good.png';

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [rememberMeWarning, setRememberMeWarning] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const navigate = useNavigate();

  // Clear errors when component mounts (page load or navigation back)
  React.useEffect(() => {
    setError('');
    setFieldErrors({});
    setShakeFields({});
    setUsername('');
    setPassword('');
    setRememberMe(false);
    setShowPassword(false);
  }, []);

  const handleRememberMeChange = (e) => {
    const isChecked = e.target.checked;
    setRememberMe(isChecked);
    
    // Show warning when checking
    if (isChecked) {
      setRememberMeWarning(true);
      // Auto-hide warning after 4 seconds
      setTimeout(() => setRememberMeWarning(false), 4000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    
    // Client-side validation
    const errors = {};
    if (!username.trim()) {
      errors.username = 'Username is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShakeFields(errors);
      setTimeout(() => setShakeFields({}), 400);
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/client/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({
          username,
          password,
          remember_me: rememberMe,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login response data:', data); // Debug log
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userRole', 'client');
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('tokenExpiresAt', data.expires_at);
        localStorage.setItem('rememberMe', rememberMe);
        
        console.log('Stored user ID:', data.user.id); // Debug log
        console.log('Stored email:', data.user.email); // Debug log
        console.log('Token expires at:', data.expires_at); // Debug log
        
        // Navigate to home page after successful login
        navigate('/home');
        if (onLogin) onLogin();
      } else {
        console.error('Login failed:', response.status, data);
        
        const serverErrors = {};
        if (response.status === 401) {
          serverErrors.username = 'Invalid credentials';
          serverErrors.password = 'Invalid credentials';
          setError('Invalid username or password. Please check your credentials and try again.');
        } else if (response.status === 422) {
          if (data.errors) {
            Object.keys(data.errors).forEach(key => {
              serverErrors[key] = data.errors[key][0];
            });
          }
          setError(data.message || 'Please provide valid username and password.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
        
        setFieldErrors(serverErrors);
        setShakeFields(serverErrors);
        setTimeout(() => setShakeFields({}), 400);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFieldFocus = (fieldName) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  };

  // Google/Firebase auth temporarily disabled

  return (
    <div className="login-wrapper">
      {/* Left side background */}
      <div className="login-left" />

      {/* Right side form */}
      <div className="login-right">
        <div className="brand-row">
          <img src={logo} alt="Sanctuario De Carmona Memorial Park Logo" className="brand-logo-img page" />
        </div>

        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Log in to your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className={`input-group ${fieldErrors.username ? 'error' : ''} ${shakeFields.username ? 'shake' : ''}`}>
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => handleFieldFocus('username')}
                required
                disabled={loading}
                className={`form-input ${fieldErrors.username ? 'error' : ''}`}
              />
              {fieldErrors.username && (
                <span className="field-error-message">{fieldErrors.username}</span>
              )}
            </div>

            <div className={`input-group ${fieldErrors.password ? 'error' : ''} ${shakeFields.password ? 'shake' : ''}`}>
              <div className="input-icon">
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => handleFieldFocus('password')}
                required
                disabled={loading}
                className={`form-input ${fieldErrors.password ? 'error' : ''}`}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(prev => !prev)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {fieldErrors.password && (
                <span className="field-error-message">{fieldErrors.password}</span>
              )}
            </div>

            <div className="remember-me-container" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                disabled={loading}
                style={{ 
                  cursor: 'pointer', 
                  width: '18px', 
                  height: '18px', 
                  borderRadius: '4px',
                  WebkitAppearance: 'none',
                  appearance: 'none',
                  border: '2px solid #cbd5e1',
                  transition: 'all 200ms ease',
                  position: 'relative',
                  flexShrink: 0
                }}
              />
              <label htmlFor="rememberMe" style={{ cursor: 'pointer', fontSize: '14px', color: '#666', margin: 0 }}>
                Remember me for 30 days
              </label>
            </div>

            {/* Remember Me Warning */}
            {rememberMeWarning && (
              <div style={{
                marginBottom: '20px',
                padding: '12px 16px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #90caf9',
                borderRadius: '8px',
                color: '#1565c0',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                animation: 'pulse 2s infinite'
              }}>
                <span style={{ fontSize: '18px' }}>ℹ️</span>
                <span><strong>Remember Me Active:</strong> You'll stay logged in for 30 days on this device.</span>
              </div>
            )}
            <button 
              type="submit" 
              className={`btn-login ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Log In'}
            </button>

            <div className="form-footer">
              <button 
                type="button"
                className="forgot-link" 
                onClick={(e) => {
                  e.preventDefault();
                  setShowForgotPasswordModal(true);
                }}
              >
                Forgot your password?
              </button>
              
              <div className="signup-prompt">
                <span>Don't have an account? </span>
                <button 
                  type="button" 
                  className="signup-link" 
                  onClick={() => navigate('/signup')}
                  disabled={loading}
                >
                  Sign up here
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {/* Info Modal */}
      {showInfoModal && (
        <AlertModal
          type="info"
          message="Password reset functionality will be implemented soon."
          onClose={() => setShowInfoModal(false)}
        />
      )}
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
}

export default LoginPage;
