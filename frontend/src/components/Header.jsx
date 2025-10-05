
const Header = () => {
  const headerStyle = {
    backgroundColor: 'white',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 50
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const navStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px'
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const logoIconStyle = {
    width: '40px',
    height: '40px',
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1.125rem'
  };

  const logoTextStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#111827'
  };

  const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '32px'
  };

  const linkStyle = {
    color: '#6b7280',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  };

  const buttonContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const signInButtonStyle = {
    color: '#6b7280',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  };

  const getStartedButtonStyle = {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '8px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'background-color 0.3s ease'
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200" style={headerStyle}>
      <div className="container mx-auto px-6 py-4" style={containerStyle}>
        <div className="flex items-center justify-between" style={navStyle}>
          <div className="flex items-center space-x-3" style={logoContainerStyle}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center" style={logoIconStyle}>
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-2xl font-bold text-gray-900" style={logoTextStyle}>ForenSight</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8" style={navLinksStyle}>
            <a 
              href="#features" 
              className="text-gray-600 hover:text-blue-600 transition-colors" 
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              Features
            </a>
            <a 
              href="#demo" 
              className="text-gray-600 hover:text-blue-600 transition-colors" 
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              Demo
            </a>
            <a 
              href="#about" 
              className="text-gray-600 hover:text-blue-600 transition-colors" 
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              About
            </a>
            <a 
              href="#contact" 
              className="text-gray-600 hover:text-blue-600 transition-colors" 
              style={linkStyle}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-4" style={buttonContainerStyle}>
            <button 
              className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
              style={signInButtonStyle}
              onMouseEnter={(e) => e.target.style.color = '#2563eb'}
              onMouseLeave={(e) => e.target.style.color = '#6b7280'}
            >
              Sign In
            </button>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              style={getStartedButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;