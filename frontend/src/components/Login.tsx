import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { testCORS } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [corsTestResult, setCorsTestResult] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error: any) {
      // Handle specific error messages from backend
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleCorsTest = async () => {
    try {
      const result = await testCORS();
      setCorsTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setCorsTestResult(JSON.stringify(error, null, 2));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Clinic Management</h1>
        <h2>Login</h2>
        
        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="register-link">
          <p>Don't have an account?</p>
          <button onClick={handleRegisterClick} className="register-button">
            Register
          </button>
        </div>
        
        <div className="approval-info">
          <p className="approval-note">
            <strong>Note:</strong> New accounts require admin approval before login access.
          </p>
        </div>

        <div className="cors-test-section">
          <h3>CORS Test</h3>
          <button onClick={handleCorsTest} className="cors-test-button">
            Test CORS
          </button>
          <pre className="cors-test-result">{corsTestResult}</pre>
        </div>
      </div>
    </div>
  );
};

export default Login; 