
const Features = () => {
  const features = [
    {
      title: "Natural Language Queries",
      description: "Ask questions in plain English like 'show me chat records containing crypto addresses' or 'list all communications with foreign numbers'",
      icon: "💬"
    },
    {
      title: "UFDR Ingestion",
      description: "Seamlessly import and process Universal Forensic Extraction Device Reports from various forensic tools",
      icon: "📊"
    },
    {
      title: "AI-Powered Analysis",
      description: "Advanced RAG and NLP algorithms automatically extract entities, patterns, and cross-linkages across forensic data",
      icon: "🤖"
    },
    {
      title: "Multi-Media Support",
      description: "Analyze chats, calls, images, videos, and metadata from seized digital devices comprehensively",
      icon: "📱"
    },
    {
      title: "Court-Ready Reports",
      description: "Generate explainable, professional reports that meet legal standards for digital evidence presentation",
      icon: "⚖️"
    },
    {
      title: "Cross-Data Linkages",
      description: "Discover hidden connections and relationships across different data types and communication channels",
      icon: "🔗"
    }
  ];

  const sectionStyle = {
    padding: '80px 0',
    backgroundColor: '#f9fafb'
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px'
  };

  const headerStyle = {
    maxWidth: '800px',
    margin: '0 auto 64px',
    textAlign: 'center'
  };

  const titleStyle = {
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px'
  };

  const subtitleStyle = {
    fontSize: '1.25rem',
    color: '#6b7280'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '32px',
    maxWidth: '1400px',
    margin: '0 auto'
  };

  const cardStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #f3f4f6',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const iconStyle = {
    fontSize: '3rem',
    marginBottom: '16px',
    display: 'block'
  };

  const cardTitleStyle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px'
  };

  const cardDescStyle = {
    color: '#6b7280',
    lineHeight: '1.6'
  };

  return (
    <div className="py-20 bg-gray-50" style={sectionStyle}>
      <div className="container mx-auto px-6" style={containerStyle}>
        <div className="max-w-4xl mx-auto text-center mb-16" style={headerStyle}>
          <h2 className="text-4xl font-bold text-gray-900 mb-6" style={titleStyle}>
            Powerful Features for Digital Forensics
          </h2>
          <p className="text-xl text-gray-600" style={subtitleStyle}>
            Advanced AI capabilities designed specifically for law enforcement and forensic investigators
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" style={gridStyle}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100" 
              style={cardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div className="text-4xl mb-4" style={iconStyle}>{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4" style={cardTitleStyle}>
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed" style={cardDescStyle}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;