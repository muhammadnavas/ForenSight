
const Hero = () => {
  const heroStyle = {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3730a3 100%)',
    color: 'white',
    padding: '80px 0',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    fontWeight: 'bold',
    marginBottom: '24px',
    lineHeight: '1.1'
  };

  const subtitleStyle = {
    fontSize: 'clamp(1.25rem, 4vw, 2rem)',
    marginBottom: '32px',
    color: '#dbeafe'
  };

  const descriptionStyle = {
    fontSize: '1.125rem',
    marginBottom: '40px',
    color: '#bfdbfe',
    maxWidth: '800px',
    margin: '0 auto 40px'
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
    color: '#1e40af',
    padding: '16px 32px',
    borderRadius: '8px',
    fontSize: '1.125rem',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    minWidth: '200px'
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
    minWidth: '200px'
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white" style={heroStyle}>
      <div className="container mx-auto px-6 py-20" style={containerStyle}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" style={titleStyle}>
            ForenSight
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100" style={subtitleStyle}>
            AI-Driven UFDR Analysis for Digital Forensic Investigations
          </p>
          <p className="text-lg mb-10 text-blue-200 max-w-3xl mx-auto" style={descriptionStyle}>
            Transform complex forensic data into actionable insights with natural language queries. 
            Extract evidence faster, generate court-ready reports, and uncover hidden connections 
            across digital communications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={buttonContainerStyle}>
            <button 
              className="bg-white text-blue-900 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              style={primaryButtonStyle}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f9ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
            >
              Start Investigation
            </button>
            <button 
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-900 transition-colors"
              style={secondaryButtonStyle}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#1e40af';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = 'white';
              }}
            >
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;