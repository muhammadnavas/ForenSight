import { useState } from 'react';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import { CaseProvider } from './contexts/CaseContext';

// Main App Content Component
const AppContent = () => {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'dashboard'

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  // Navigation Header Component
  const NavigationHeader = () => {
    if (currentView === 'home') return null; // HomePage has its own navigation

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
            </nav>
          </div>
        </div>
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onNavigateToDashboard={navigateToDashboard} />;
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
      </div>
    </CaseProvider>
  );
};

function App() {
  return <AppContent />;
}

export default App
