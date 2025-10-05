
const CTA = () => {
  const sectionStyle = {
    padding: '80px 0',
    background: 'linear-gradient(90deg, #2563eb 0%, #3730a3 100%)',
    color: 'white',
    textAlign: 'center'
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    marginBottom: '24px'
  };

  const descStyle = {
    fontSize: '1.25rem',
    marginBottom: '40px',
    color: '#dbeafe'
  };

  const buttonContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const primaryButtonStyle = {
    backgroundColor: 'white',
    color: '#2563eb',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    minWidth: '180px'
  };

  const secondaryButtonStyle = {
    backgroundColor: 'transparent',
    color: 'white',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: '2px solid white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minWidth: '180px'
  };

  return (
    <div className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white" style={sectionStyle}>
      <div className="container mx-auto px-6 text-center" style={containerStyle}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6" style={titleStyle}>
            Ready to Transform Your Digital Investigations?
          </h2>
          <p className="text-xl mb-10 text-blue-100" style={descStyle}>
            Join law enforcement agencies worldwide in revolutionizing forensic analysis 
            with AI-powered insights and natural language processing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={buttonContainerStyle}>
            <button 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Request Demo
            </button>
            <button 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;