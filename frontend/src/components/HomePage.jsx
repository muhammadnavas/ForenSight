
const HomePage = ({ onNavigateToDashboard }) => {
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
    <div style={heroStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>
          ForenSight
        </h1>
        <p style={subtitleStyle}>
          AI-Driven UFDR Analysis for Digital Forensic Investigations
        </p>
        <p style={descriptionStyle}>
          Transform complex forensic data into actionable insights with natural language queries. 
          Extract evidence faster, generate court-ready reports, and uncover hidden connections 
          across digital communications.
        </p>
        <div style={buttonContainerStyle}>
          <button 
            style={primaryButtonStyle}
            onClick={onNavigateToDashboard}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f9ff'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            🚀 Launch Investigation Platform
          </button>
          <button 
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
            📺 Watch Demo
          </button>
        </div>

        {/* Key Features Preview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
          marginTop: '80px',
          maxWidth: '1200px',
          margin: '80px auto 0'
        }}>
          {[
            { 
              icon: '💬', 
              title: 'Natural Language Queries', 
              desc: 'Ask questions in plain English and get instant forensic insights',
              color: '#0ea5e9',
              gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)'
            },
            { 
              icon: '🤖', 
              title: 'AI-Powered Analysis', 
              desc: 'Advanced RAG and NLP algorithms for deep forensic analysis',
              color: '#059669',
              gradient: 'linear-gradient(135deg, #059669, #047857)'
            },
            { 
              icon: '⚖️', 
              title: 'Court-Ready Reports', 
              desc: 'Professional legal documentation with chain of custody',
              color: '#7c3aed',
              gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)'
            },
            { 
              icon: '🔗', 
              title: 'Cross-Data Linkages', 
              desc: 'Discover hidden connections across multiple data sources',
              color: '#dc2626',
              gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: feature.gradient,
              padding: '32px',
              borderRadius: '20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200px',
                height: '200px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'rotate(0deg)',
                animation: 'float 6s ease-in-out infinite'
              }} />
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '16px',
                position: 'relative',
                zIndex: 2
              }}>{feature.icon}</div>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                marginBottom: '12px',
                position: 'relative',
                zIndex: 2
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '0.9rem',
                lineHeight: '1.6',
                position: 'relative',
                zIndex: 2
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;