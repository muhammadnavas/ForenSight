import { useState } from 'react';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';
import { CaseProvider } from './contexts/CaseContext';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'dashboard'

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  return (
    <CaseProvider>
      <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        {currentView === 'home' ? (
          <HomePage onNavigateToDashboard={navigateToDashboard} />
        ) : (
          <Dashboard onNavigateToHome={navigateToHome} />
        )}
      </div>
    </CaseProvider>
  );
}

export default App
