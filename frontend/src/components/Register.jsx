import { useEffect, useState } from 'react';

const Register = ({ onRegister, onSwitchToLogin, error: externalError }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'investigator',
    badgeNumber: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      .register-form {
        animation: slideIn 0.5s ease-out;
      }
      .register-error {
        animation: shake 0.5s ease-out;
      }
      .register-button:hover {
        animation: pulse 0.3s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
      }
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Department validation
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    // Badge Number validation (optional but if provided, must be valid)
    if (formData.badgeNumber && !/^\d{3,10}$/.test(formData.badgeNumber)) {
      newErrors.badgeNumber = 'Badge number must be 3-10 digits';
    }

    // Phone validation (optional but if provided, must be valid)
    if (formData.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Call the onRegister callback with form data
      const { confirmPassword, ...registrationData } = formData;
      await onRegister(registrationData);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ form: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: `2px solid ${errors[fieldName] ? '#dc2626' : '#e2e8f0'}`,
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit'
  });

  const roles = [
    { value: 'investigator', label: 'Investigator' },
    { value: 'analyst', label: 'Digital Forensic Analyst' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'admin', label: 'System Administrator' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div 
        className="register-form"
        style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🔬
          </div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '700', 
            color: '#1e293b',
            marginBottom: '8px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            Join ForenSight
          </h1>
          <p style={{ 
            fontSize: '16px', 
            color: '#64748b',
            margin: 0
          }}>
            Create your forensic investigation account
          </p>
        </div>

        {/* Error Display */}
        {(externalError || errors.form) && (
          <div 
            className="register-error"
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>⚠️</span>
            {externalError || errors.form}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={inputStyle('firstName')}
                placeholder="John"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                }}
                onBlur={(e) => {
                  if (!errors.firstName) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.firstName && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.firstName}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={inputStyle('lastName')}
                placeholder="Doe"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                }}
                onBlur={(e) => {
                  if (!errors.lastName) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.lastName && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle('email')}
              placeholder="john.doe@department.gov"
              disabled={isLoading}
              onFocus={(e) => {
                e.target.style.borderColor = '#059669';
                e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            {errors.email && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  style={{
                    ...inputStyle('password'),
                    paddingRight: '40px'
                  }}
                  placeholder="Min 8 characters"
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                  }}
                  onBlur={(e) => {
                    if (!errors.password) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px'
                  }}
                  disabled={isLoading}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#dc2626', fontSize: '11px', margin: '4px 0 0 0', lineHeight: '1.3' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  style={{
                    ...inputStyle('confirmPassword'),
                    paddingRight: '40px'
                  }}
                  placeholder="Repeat password"
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#059669';
                    e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                  }}
                  onBlur={(e) => {
                    if (!errors.confirmPassword) {
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px'
                  }}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Department and Role */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                style={inputStyle('department')}
                placeholder="Digital Forensics Unit"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                }}
                onBlur={(e) => {
                  if (!errors.department) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.department && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.department}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  ...inputStyle('role'),
                  cursor: 'pointer'
                }}
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                }}
                onBlur={(e) => {
                  if (!errors.role) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              >
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Badge Number and Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Badge Number
              </label>
              <input
                type="text"
                name="badgeNumber"
                value={formData.badgeNumber}
                onChange={handleChange}
                style={inputStyle('badgeNumber')}
                placeholder="12345 (optional)"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                }}
                onBlur={(e) => {
                  if (!errors.badgeNumber) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.badgeNumber && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.badgeNumber}
                </p>
              )}
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle('phone')}
                placeholder="+1 (555) 123-4567 (optional)"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#059669';
                  e.target.style.boxShadow = '0 0 0 3px rgba(5, 150, 105, 0.1)';
                }}
                onBlur={(e) => {
                  if (!errors.phone) {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              {errors.phone && (
                <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                  {errors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                required
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: '#059669',
                  marginTop: '2px'
                }}
              />
              <span style={{ color: '#374151', fontSize: '13px', lineHeight: '1.4' }}>
                I agree to the{' '}
                <a href="#" style={{ color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                  Terms of Service
                </a>
                {' '}and{' '}
                <a href="#" style={{ color: '#059669', textDecoration: 'none', fontWeight: '500' }}>
                  Privacy Policy
                </a>
                . I understand that this system is for authorized law enforcement personnel only.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="register-button"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: isLoading ? '#94a3b8' : '#059669',
              border: 'none',
              borderRadius: '12px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isLoading ? 'none' : '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
              marginTop: '8px'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#047857';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 8px 12px -1px rgba(5, 150, 105, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(5, 150, 105, 0.3)';
              }
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Creating Account...
              </>
            ) : (
              <>
                👤 Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: '#059669',
                fontWeight: '600',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '14px',
                padding: 0
              }}
              onMouseEnter={(e) => e.target.style.color = '#047857'}
              onMouseLeave={(e) => e.target.style.color = '#059669'}
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>

      {/* Add spinning animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Register;