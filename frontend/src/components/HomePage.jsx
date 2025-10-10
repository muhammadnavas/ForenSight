import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = ({ onNavigateToDashboard, onShowLogin }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: '🔍',
      title: 'Natural Language Queries',
      description: 'Ask questions in plain English and get instant forensic insights from complex UFDR data structures.',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'Advanced machine learning algorithms analyze digital evidence with unprecedented accuracy and speed.',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Interactive dashboards and network visualizations reveal hidden patterns in forensic data.',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      icon: '⚖️',
      title: 'Court-Ready Reports',
      description: 'Generate comprehensive legal documentation with complete chain of custody and evidence integrity.',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)',
      color: '#1e293b',
      overflow: 'hidden'
    }}>
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
          radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.05) 0%, transparent 50%)
        `,
        pointerEvents: 'none'
      }} />

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: Math.random() * 4 + 2 + 'px',
            height: Math.random() * 4 + 2 + 'px',
            backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'][i % 4] + '80',
            borderRadius: '50%',
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            animation: `float ${8 + Math.random() * 4}s ease-in-out infinite ${Math.random() * 2}s`
          }}
        />
      ))}

      {/* Main Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px',
        textAlign: 'center'
      }}>
        {/* Hero Section */}
        <div style={{
          marginBottom: '80px',
          animation: isVisible ? 'slideInUp 1s ease-out' : 'none'
        }}>
          {/* Simple Header */}
          <h1 style={{
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            fontWeight: '900',
            color: '#1e293b',
            margin: '0 0 32px 0',
            lineHeight: 1,
            textShadow: '0 4px 8px rgba(30, 41, 59, 0.1)'
          }}>
            Insightic
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: 'clamp(1.25rem, 4vw, 2rem)',
            color: '#475569',
            fontWeight: '600',
            marginBottom: '24px',
            animation: isVisible ? 'slideInUp 1s ease-out 0.2s both' : 'none'
          }}>
            AI-Driven Digital Forensics Platform
          </p>

          {/* Description */}
          <p style={{
            fontSize: '1.2rem',
            color: '#64748b',
            maxWidth: '800px',
            margin: '0 auto 48px',
            lineHeight: '1.8',
            animation: isVisible ? 'slideInUp 1s ease-out 0.4s both' : 'none'
          }}>
            Transform complex UFDR data into actionable intelligence with natural language queries. 
            Accelerate investigations, uncover hidden connections, and generate court-ready reports 
            with the power of advanced AI analysis.
          </p>

          {/* CTA Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            animation: isVisible ? 'slideInUp 1s ease-out 0.6s both' : 'none'
          }}>
            <button
              onClick={() => {
                if (user) {
                  // User is already logged in, navigate to dashboard
                  if (onNavigateToDashboard) {
                    onNavigateToDashboard();
                  } else {
                    console.error('onNavigateToDashboard function not provided');
                  }
                } else {
                  // User is not logged in, show login
                  if (onShowLogin) {
                    onShowLogin();
                  } else {
                    console.error('onShowLogin function not provided');
                  }
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                minWidth: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
              }}
            >
              <span>🚀</span>
              Launch Platform
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          marginBottom: '100px'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '800',
            marginBottom: '16px',
            background: 'linear-gradient(45deg, #1e293b, #475569)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: isVisible ? 'slideInUp 1s ease-out 0.8s both' : 'none'
          }}>
            Powerful Forensic Capabilities
          </h2>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            marginBottom: '60px',
            animation: isVisible ? 'slideInUp 1s ease-out 1s both' : 'none'
          }}>
            Everything you need for comprehensive digital investigations
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  background: hoveredFeature === index 
                    ? `linear-gradient(135deg, ${feature.color}15, ${feature.color}08)` 
                    : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${hoveredFeature === index ? feature.color + '30' : 'rgba(203, 213, 225, 0.3)'}`,
                  borderRadius: '20px',
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredFeature === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredFeature === index 
                    ? `0 25px 50px -12px ${feature.color}30` 
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  animation: `slideInUp 0.6s ease-out ${index * 0.1 + 1.2}s both`
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Feature Icon */}
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '24px',
                  transform: hoveredFeature === index ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.3s ease'
                }}>
                  {feature.icon}
                </div>

                {/* Feature Title */}
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: hoveredFeature === index ? '#1e293b' : '#64748b'
                }}>
                  {feature.title}
                </h3>

                {/* Feature Description */}
                <p style={{
                  color: hoveredFeature === index ? '#475569' : '#64748b',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '24px',
          padding: '60px 40px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          animation: isVisible ? 'slideInUp 1s ease-out 1.6s both' : 'none'
        }}>
          <h2 style={{
            fontSize: '2.2rem',
            fontWeight: '800',
            marginBottom: '20px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Ready to Revolutionize Your Investigations?
          </h2>
          
          <p style={{
            fontSize: '1.2rem',
            color: '#475569',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Join forensic professionals worldwide who trust Insightic for faster, 
            more accurate digital investigations.
          </p>
          
          <button
            onClick={() => {
              console.log('Start Your Investigation button clicked');
              if (user) {
                // User is already logged in, navigate to dashboard
                if (onNavigateToDashboard) {
                  onNavigateToDashboard();
                } else {
                  console.error('onNavigateToDashboard function not provided');
                }
              } else {
                // User is not logged in, show login
                if (onShowLogin) {
                  onShowLogin();
                } else {
                  console.error('onShowLogin function not provided');
                }
              }
            }}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              border: 'none',
              padding: '18px 40px',
              borderRadius: '14px',
              fontSize: '1.2rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.3s ease',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
            }}
          >
            <span>⚡</span>
            Start Your Investigation
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
