import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import bgLoginImage from "../assets/bg-login.jpg";

// Add shake animation styles
const shakeAnimationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
    20%, 40%, 60%, 80% { transform: translateX(8px); }
  }
  
  .animate-shake {
    animation: shake 0.4s ease-in-out;
  }
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

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
      setError("Please enter both username and password.");
      setLoading(false);
      return;
    }

    try {
      const apiUrl = `${window.location.protocol}//${window.location.host}/api/admin/login`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data and token
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('userRole', 'admin');
        
        // Redirect to admin dashboard
        navigate('/admin/dashboard');
      } else {
        const serverErrors = {};
        if (response.status === 401) {
          serverErrors.username = 'Invalid credentials';
          serverErrors.password = 'Invalid credentials';
        }
        setFieldErrors(serverErrors);
        setShakeFields(serverErrors);
        setTimeout(() => setShakeFields({}), 400);
        setError(data.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Login error:', err);
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

  return (
    <>
      <style>{shakeAnimationStyles}</style>
      <div className="h-screen w-screen bg-white flex m-0 p-0 overflow-hidden">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-start p-12 relative overflow-hidden" style={{backgroundImage: `url(${bgLoginImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-40 h-40 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"></div>
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 z-0"></div>
        
        {/* Logo at top */}
        <div className="relative z-10 pt-8">
          <img 
            src="/Sanctuario_Logo_Good.png" 
            alt="Sanctuario De Carmona Memorial Park" 
            style={{ height: '76px' }}
            className="w-auto object-contain"
            onError={(e) => {
              console.error('Logo failed to load:', e.target.src);
              e.target.outerHTML = `
                <div style="height: 76px; width: 76px;" class="bg-white rounded-full flex items-center justify-center">
                  <svg class="w-9 h-9 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              `;
            }}
          />
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/Sanctuario_Logo_Good.png" 
              alt="Sanctuario De Carmona Memorial Park" 
              className="h-16 w-auto object-contain mx-auto mb-4"
              onError={(e) => {
                console.error('Logo failed to load:', e.target.src);
                e.target.outerHTML = `
                  <div class="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                `;
              }}
            />
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
          </div>

          {/* Desktop heading */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-900 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => handleFieldFocus('username')}
                className={`w-full px-4 py-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  fieldErrors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'
                } ${shakeFields.username ? 'animate-shake' : ''}`}
                placeholder="Enter your username"
                required
              />
              {fieldErrors.username && (
                <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.username}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => handleFieldFocus('password')}
                  className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    fieldErrors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  } ${shakeFields.password ? 'animate-shake' : ''}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1 text-xs text-red-600 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account? <span className="text-gray-500">Contact the admin</span>
          </p>

          {/* Copyright */}
          <p className="text-center text-xs text-gray-500 mt-4">© 2026 Sanctuario De Carmona. All rights reserved.</p>
        </div>

        {/* Spacer for bottom padding */}
        <div className="h-12"></div>
      </div>
    </div>
    </>
  );
};

export default Login;
