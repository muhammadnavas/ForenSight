import { useEffect, useState } from 'react';
import AuthComponent from './components/AuthComponent';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import UserManagement from './components/UserManagement';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CaseProvider } from './contexts/CaseContext';

// Protected Route Component
const ProtectedRoute = ({ children, allowHomepage = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f8fafc',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #0ea5e9',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#64748b', fontSize: '14px' }}>Loading ForenSight...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user && !allowHomepage) {
    return <AuthFlow />;
  }

  return children;
};

// Simple Auth Flow - just returns AuthComponent
const AuthFlow = ({ onClose, onLoginSuccess }) => {
  return (
    <AuthComponent 
      onClose={onClose}
      onLoginSuccess={onLoginSuccess}
    />
  );
};

// Main App Content Component
const AppContent = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'dashboard', 'users'
  const [showAuth, setShowAuth] = useState(false); // For showing login/register overlay
  const [pendingNavigation, setPendingNavigation] = useState(null); // Store where user wanted to go
  const { user, logout } = useAuth();

  // Effect to handle route protection and redirect unauthorized access
  useEffect(() => {
    // If user is not logged in and trying to access protected routes
    if (!user && (currentView === 'dashboard' || currentView === 'users')) {
      setCurrentView('home');
      setShowAuth(true);
    }
    // If user is logged in but not admin and trying to access user management
    else if (user && currentView === 'users' && user.role !== 'admin') {
      setCurrentView('dashboard');
    }
  }, [user, currentView]);

  // Effect to handle pending navigation after successful login
  useEffect(() => {
    if (user && pendingNavigation) {
      console.log('User logged in with pending navigation:', pendingNavigation);
      // User just logged in and has a pending navigation
      if (pendingNavigation === 'dashboard') {
        setCurrentView('dashboard');
      } else if (pendingNavigation === 'users' && user.role === 'admin') {
        setCurrentView('users');
      } else if (pendingNavigation === 'users' && user.role !== 'admin') {
        setCurrentView('dashboard'); // Redirect non-admin to dashboard
      }
      setShowAuth(false);
      setPendingNavigation(null);
    }
  }, [user, pendingNavigation]);

  const navigateToDashboard = () => {
    if (user) {
      setCurrentView('dashboard');
      setPendingNavigation(null);
    } else {
      setPendingNavigation('dashboard');
      setShowAuth(true);
    }
  };

  const navigateToHome = () => {
    setCurrentView('home');
    setShowAuth(false);
    setPendingNavigation(null);
  };

  const navigateToUsers = () => {
    if (user) {
      setCurrentView('users');
      setPendingNavigation(null);
    } else {
      setPendingNavigation('users');
      setShowAuth(true);
    }
  };

  const showLogin = () => {
    setShowAuth(true);
  };

  const hideAuth = () => {
    setShowAuth(false);
    setPendingNavigation(null);
  };

  const handleLoginSuccess = () => {
    console.log('Login success handler called');
    // Navigate to dashboard after successful login
    setCurrentView('dashboard');
    setShowAuth(false);
    setPendingNavigation(null);
  };

  // Navigation Header Component
  const NavigationHeader = () => {
    if (currentView === 'home') return null; // HomePage has its own navigation
    if (!user) return null; // Only show navigation when user is logged in

    return (
      <div style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '12px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '100%'
        }}>
          {/* Left: Logo and Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div 
              onClick={navigateToHome}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#1e293b',
                textDecoration: 'none'
              }}
            >
              <span style={{ fontSize: '24px' }}>🔬</span>
              <span style={{ fontSize: '18px', fontWeight: '700' }}>ForenSight</span>
            </div>

            <nav style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
              <button
                onClick={navigateToDashboard}
                style={{
                  background: 'none',
                  border: 'none',
                  color: currentView === 'dashboard' ? '#0ea5e9' : '#64748b',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  padding: '8px 0',
                  borderBottom: currentView === 'dashboard' ? '2px solid #0ea5e9' : 'none'
                }}
              >
                📊 Dashboard
              </button>
              
              {user?.role === 'admin' && (
                <button
                  onClick={navigateToUsers}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'users' ? '#0ea5e9' : '#64748b',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    padding: '8px 0',
                    borderBottom: currentView === 'users' ? '2px solid #0ea5e9' : 'none'
                  }}
                >
                  👥 Users
                </button>
              )}
            </nav>
          </div>

          {/* Right: User Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>
                {user?.role} • {user?.department}
              </div>
            </div>
            
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>

            <button
              onClick={logout}
              style={{
                padding: '8px 16px',
                fontSize: '12px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigateToDashboard={navigateToDashboard} onShowLogin={showLogin} />;
      case 'users':
        return <UserManagement />;
      case 'dashboard':
      default:
        return <Dashboard onNavigateToHome={navigateToHome} />;
    }
  };

  return (
    <CaseProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <NavigationHeader />
        {renderCurrentView()}
        
        {/* Auth Overlay */}
        {showAuth && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              overflow: 'auto'
            }}>
              <button
                onClick={hideAuth}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001
                }}
              >
                ×
              </button>
              <AuthFlow 
                onClose={hideAuth}
                onLoginSuccess={handleLoginSuccess}
                pendingNavigation={pendingNavigation}
              />
            </div>
          </div>
        )}
      </div>
    </CaseProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute allowHomepage={true}>
        <AppContent />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App
