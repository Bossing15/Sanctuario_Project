import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import AlertModal from '../components/AlertModal';
import './LoginPage.css';
import logo from '../assets/images/home_logo/main_logo.jpg';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:8000/api/client/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({
          email,
          password,
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
        
        console.log('Stored user ID:', data.user.id); // Debug log
        console.log('Stored email:', data.user.email); // Debug log
        
        // Navigate to home page after successful login
        navigate('/home');
        if (onLogin) onLogin();
      } else {
        console.error('Login failed:', response.status, data);
        
        if (response.status === 401) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (response.status === 422) {
          setError(data.message || 'Please provide valid email and password.');
        } else {
          setError(data.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Google/Firebase auth temporarily disabled

  return (
    <div className="login-wrapper">
      {/* Left side background */}
      <div className="login-left" />

      {/* Right side form */}
      <div className="login-right">
        <div className="brand-row">
          <img src={logo} alt="Sanctuario De Carmona Memorial Park Logo" className="brand-logo enlarged-logo" />
        </div>

        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Log in to your account</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">
                <FaUser />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <FaLock />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="form-input"
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword(prev => !prev)}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

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
                  setShowInfoModal(true);
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
    </div>
  );
}

export default LoginPage;
