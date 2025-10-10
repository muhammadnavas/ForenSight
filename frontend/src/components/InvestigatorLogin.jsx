import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const InvestigatorLogin = ({ onLogin, onBack, onSwitchToRegister, error: externalError }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { users, loadUsers } = useAuth();

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, []); // Remove dependency to avoid re-renders



  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
      }
      .investigator-card {
        animation: slideIn 0.5s ease-out;
        transition: all 0.3s ease;
      }
      .investigator-card:hover {
        transform: translateY(-4px);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowPasswordField(true);
    setPassword('');
    setErrors({});
  };

  const handleLogin = async () => {
    if (!selectedUser || !password) {
      setErrors({ form: 'Please enter your password' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onLogin({
        email: selectedUser.email,
        password: password
      });
    } catch (error) {
      setErrors({ form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': '#dc2626',
      'supervisor': '#f59e0b',
      'investigator': '#0ea5e9',
      'analyst': '#059669'
    };
    return colors[role] || '#64748b';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'admin': '🛡️',
      'supervisor': '👨‍💼',
      'investigator': '🔍',
      'analyst': '📊'
    };
    return icons[role] || '👤';
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: showPasswordField ? '500px' : '800px',
        transition: 'all 0.3s ease'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <button
              onClick={onBack}
              style={{
                position: 'absolute',
                left: '40px',
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              ←
            </button>
            <div style={{
              fontSize: '48px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #1e40af 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              🔬
            </div>
          </div>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            {showPasswordField ? 'Enter Your Password' : 'Select Your Profile'}
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            margin: 0
          }}>
            {showPasswordField 
              ? `Sign in as ${selectedUser?.firstName} ${selectedUser?.lastName}`
              : 'Choose your investigator profile to access your cases'
            }
          </p>
        </div>

        {/* Error Display */}
        {(externalError || errors.form) && (
          <div style={{
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
          }}>
            <span>⚠️</span>
            {externalError || errors.form}
          </div>
        )}

        {!showPasswordField ? (
          /* User Selection Grid */
          users.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              backgroundColor: '#f8fafc',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '24px' }}>👥</div>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                No Users Available
              </h3>
              <p style={{
                fontSize: '16px',
                color: '#64748b',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                No user accounts have been created yet. Create your first administrator account to get started.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={onBack}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    backgroundColor: '#64748b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  ← Back to Homepage
                </button>
                <button
                  onClick={onSwitchToRegister}
                  style={{
                    padding: '12px 24px',
                    fontSize: '14px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  🔧 Create First Account
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px'
            }}>
              {users.map((user) => {
              const caseInfo = {
                name: 'Access Your Cases',
                description: 'Sign in to view your assigned investigations and case files',
                caseCount: '•',
                recentActivity: 'Login to view recent activity'
              };

              return (
                <div
                  key={user.id}
                  className="investigator-card"
                  onClick={() => handleUserSelect(user)}
                  style={{
                    border: `2px solid ${getRoleColor(user.role)}20`,
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = getRoleColor(user.role);
                    e.currentTarget.style.boxShadow = `0 8px 25px -5px ${getRoleColor(user.role)}40`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = getRoleColor(user.role) + '20';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Role Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {user.role}
                  </div>

                  {/* User Avatar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: getRoleColor(user.role),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '600'
                    }}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#1e293b',
                        marginBottom: '4px'
                      }}>
                        {user.firstName} {user.lastName}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        {user.department}
                      </div>
                    </div>
                  </div>

                  {/* Case Information */}
                  <div style={{
                    backgroundColor: '#f8fafc',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '8px'
                    }}>
                      Current Case: {caseInfo.name}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      lineHeight: '1.4',
                      marginBottom: '8px'
                    }}>
                      {caseInfo.description}
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      color: '#64748b'
                    }}>
                      <span>📁 {caseInfo.caseCount} Cases</span>
                      <span>🕒 {caseInfo.recentActivity}</span>
                    </div>
                  </div>

                  {/* Login Button */}
                  <button style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: getRoleColor(user.role),
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}>
                    🔐 Sign In
                  </button>
                </div>
              );
              })}
            </div>
          )
        ) : (
          /* Password Input Form */
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* Selected User Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              marginBottom: '24px',
              border: `1px solid ${getRoleColor(selectedUser.role)}20`
            }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                backgroundColor: getRoleColor(selectedUser.role),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px'
              }}>
                {getRoleIcon(selectedUser.role)}
              </div>
              <div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b'
                }}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b'
                }}>
                  {selectedUser.email}
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = getRoleColor(selectedUser.role);
                  e.target.style.boxShadow = `0 0 0 3px ${getRoleColor(selectedUser.role)}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin();
                  }
                }}
              />
            </div>

            {/* Demo Password Hint */}
            <div style={{
              padding: '12px',
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              border: '1px solid #bae6fd',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '12px',
                color: '#0369a1',
                margin: 0,
                fontWeight: '600'
              }}>
                💡 Demo Password: {selectedUser.email === 'investigator@forensight.com' ? 'forensic123' : 
                                   selectedUser.email === 'admin@forensight.com' ? 'admin123' : 'analyst123'}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPasswordField(false);
                  setSelectedUser(null);
                  setPassword('');
                  setErrors({});
                }}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '14px',
                  backgroundColor: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                ← Back to Selection
              </button>
              
              <button
                onClick={handleLogin}
                disabled={isLoading || !password}
                style={{
                  flex: 2,
                  padding: '16px',
                  fontSize: '14px',
                  backgroundColor: isLoading ? '#94a3b8' : getRoleColor(selectedUser.role),
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
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
                    Signing In...
                  </>
                ) : (
                  <>🚀 Access Dashboard</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InvestigatorLogin;