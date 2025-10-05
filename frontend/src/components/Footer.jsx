
const Footer = () => {
  const footerStyle = {
    backgroundColor: '#111827',
    color: 'white',
    padding: '48px 0'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '32px',
    marginBottom: '48px'
  };

  const brandStyle = {
    gridColumn: 'span 2'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px'
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

  const brandTextStyle = {
    fontSize: '1.5rem',
    fontWeight: 'bold'
  };

  const descriptionStyle = {
    color: '#9ca3af',
    marginBottom: '24px',
    maxWidth: '400px',
    lineHeight: '1.6'
  };

  const socialStyle = {
    display: 'flex',
    gap: '16px'
  };

  const socialIconStyle = {
    width: '32px',
    height: '32px',
    backgroundColor: '#374151',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease'
  };

  const sectionTitleStyle = {
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '16px'
  };

  const linkListStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  };

  const linkStyle = {
    color: '#9ca3af',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  };

  const bottomStyle = {
    borderTop: '1px solid #374151',
    paddingTop: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px'
  };

  const copyrightStyle = {
    color: '#9ca3af',
    fontSize: '0.875rem'
  };

  const bottomLinksStyle = {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap'
  };

  return (
    <footer className="bg-gray-900 text-white py-12" style={footerStyle}>
      <div className="container mx-auto px-6" style={containerStyle}>
        <div className="grid md:grid-cols-4 gap-8" style={gridStyle}>
          {/* Brand */}
          <div className="md:col-span-2" style={brandStyle}>
            <div className="flex items-center space-x-3 mb-6" style={logoStyle}>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center" style={logoIconStyle}>
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-2xl font-bold" style={brandTextStyle}>ForenSight</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md" style={descriptionStyle}>
              Empowering law enforcement with AI-driven forensic analysis tools 
              for faster, more accurate digital investigations.
            </p>
            <div className="flex space-x-4" style={socialStyle}>
              <div 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                style={socialIconStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
              >
                <span className="text-sm">📧</span>
              </div>
              <div 
                className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                style={socialIconStyle}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#374151'}
              >
                <span className="text-sm">🔗</span>
              </div>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={sectionTitleStyle}>Product</h3>
            <ul className="space-y-2 text-gray-400" style={linkListStyle}>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Demo</a></li>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Documentation</a></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={sectionTitleStyle}>Support</h3>
            <ul className="space-y-2 text-gray-400" style={linkListStyle}>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Training</a></li>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Security</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center" style={bottomStyle}>
          <p className="text-gray-400 text-sm" style={copyrightStyle}>
            © 2025 ForenSight. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0" style={bottomLinksStyle}>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors" style={linkStyle} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;