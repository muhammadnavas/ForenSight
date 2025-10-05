import { useState } from 'react';
import Dashboard from './components/Dashboard';
import HomePage from './components/HomePage';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'dashboard'

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: currentView === 'dashboard' ? '#1e293b' : 'white' }}>
      {currentView === 'home' ? (
        <HomePage onNavigateToDashboard={navigateToDashboard} />
      ) : (
        <Dashboard onNavigateToHome={navigateToHome} />
      )}
    </div>
  );
}

export default App
