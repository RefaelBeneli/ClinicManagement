import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
      await register(formData);
      navigate('/login', { 
        state: { message: 'Registration successful! Please login with your credentials.' }
      });
    } catch (error: any) {
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        // Extract field-specific validation errors
        const validationErrors = error.response.data.errors;
        const errorMessages = Object.keys(validationErrors).map(field => {
          const fieldErrors = validationErrors[field];
          return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${fieldErrors.join(', ')}`;
        });
        setError(errorMessages.join('\n'));
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Clinic Management</h1>
        <h2>Create Account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="fullName">Full Name:</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              title="Full name must be 2-100 characters long"
            />
            <small className="field-hint">Enter your full name (2-100 characters)</small>
          </div>

          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_]+"
              title="Username must be 3-50 characters long and contain only letters, numbers, and underscores"
            />
            <small className="field-hint">Username must be 3-50 characters long</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              title="Please enter a valid email address"
            />
            <small className="field-hint">Enter a valid email address</small>
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
              minLength={6}
              title="Password must be at least 6 characters long"
            />
            <small className="field-hint">Password must be at least 6 characters long</small>
          </div>
          
          <button type="submit" disabled={loading} className="register-button">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="login-link">
          <p>Already have an account?</p>
          <button onClick={handleLoginClick} className="login-button">
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register; 