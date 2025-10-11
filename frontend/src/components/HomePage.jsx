import { useEffect, useState } from 'react';

const HomePage = ({ onNavigateToDashboard }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: '🔍',
      title: 'RAG-Powered Queries',
      description: 'Advanced Retrieval-Augmented Generation enables natural language queries across vast UFDR datasets with contextual understanding.',
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      details: ['Vector-based document search', 'Semantic similarity matching', 'Multi-modal evidence retrieval', 'Real-time knowledge synthesis']
    },
    {
      icon: '🤖',
      title: 'AI Evidence Analysis',
      description: 'Deep learning models automatically classify, correlate, and extract insights from digital artifacts with forensic precision.',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
      details: ['Automated artifact classification', 'Timeline reconstruction', 'Anomaly detection', 'Predictive analysis']
    },
    {
      icon: '🕸️',
      title: 'Network Intelligence',
      description: 'Advanced graph analytics reveal hidden connections, communication patterns, and criminal network structures.',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
      details: ['Social network analysis', 'Communication mapping', 'Entity relationship graphs', 'Behavioral clustering']
    },
    {
      icon: '🔐',
      title: 'Crypto Forensics',
      description: 'Comprehensive blockchain analysis, wallet tracking, and cryptocurrency transaction flow investigation capabilities.',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      details: ['Multi-blockchain support', 'Wallet clustering', 'Transaction tracing', 'DeFi protocol analysis']
    },
    {
      icon: '📱',
      title: 'Mobile Forensics',
      description: 'Extract and analyze data from iOS, Android, and legacy mobile devices with advanced recovery techniques.',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
      details: ['Physical & logical extraction', 'Deleted data recovery', 'App data analysis', 'Location intelligence']
    },
    {
      icon: '☁️',
      title: 'Cloud Investigation',
      description: 'Investigate cloud storage, SaaS applications, and distributed infrastructure with proper legal compliance.',
      color: '#06b6d4',
      bgColor: 'rgba(6, 182, 212, 0.1)',
      details: ['Multi-cloud platform support', 'API-based acquisition', 'Metadata preservation', 'Compliance frameworks']
    },
    {
      icon: '🧬',
      title: 'Malware Analysis',
      description: 'Dynamic and static malware analysis with behavioral profiling, IOC extraction, and threat attribution.',
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.1)',
      details: ['Sandbox environments', 'Code disassembly', 'Behavior monitoring', 'Threat intelligence integration']
    },
    {
      icon: '📊',
      title: 'Visual Analytics',
      description: 'Interactive dashboards, timeline analysis, and 3D network visualizations for complex case understanding.',
      color: '#7c3aed',
      bgColor: 'rgba(124, 58, 237, 0.1)',
      details: ['Real-time dashboards', 'Timeline reconstruction', '3D network graphs', 'Geospatial analysis']
    },
    {
      icon: '🔬',
      title: 'Memory Analysis',
      description: 'Advanced RAM dump analysis, process reconstruction, and volatile data recovery from system memory.',
      color: '#059669',
      bgColor: 'rgba(5, 150, 105, 0.1)',
      details: ['Process analysis', 'Network connections', 'Registry extraction', 'Encryption key recovery']
    },
    {
      icon: '🌐',
      title: 'Internet Evidence',
      description: 'Web history analysis, social media investigation, and deep web artifact recovery with metadata preservation.',
      color: '#0891b2',
      bgColor: 'rgba(8, 145, 178, 0.1)',
      details: ['Browser forensics', 'Social media analysis', 'Web cache recovery', 'Internet history timeline']
    },
    {
      icon: '🛡️',
      title: 'Chain of Custody',
      description: 'Automated evidence integrity verification, digital signatures, and blockchain-based custody tracking.',
      color: '#7c2d12',
      bgColor: 'rgba(124, 45, 18, 0.1)',
      details: ['Cryptographic verification', 'Audit trail logging', 'Evidence integrity checks', 'Legal compliance']
    },
    {
      icon: '⚖️',
      title: 'Legal Reporting',
      description: 'Generate court-ready reports, expert testimony support, and compliance documentation with legal standards.',
      color: '#b45309',
      bgColor: 'rgba(180, 83, 9, 0.1)',
      details: ['Automated report generation', 'Legal templates', 'Expert witness support', 'Compliance verification']
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
                console.log('Explore Platform button clicked');
                console.log('onNavigateToDashboard prop:', onNavigateToDashboard);
                if (onNavigateToDashboard) {
                  console.log('Calling onNavigateToDashboard() from main CTA');
                  onNavigateToDashboard();
                } else {
                  console.error('onNavigateToDashboard prop is undefined! Using fallback scroll');
                  // Fallback: scroll to features section
                  document.querySelector('h2').scrollIntoView({ behavior: 'smooth' });
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
              Explore Platform
            </button>
          </div>
        </div>

        {/* RAG Technology Highlight */}
        <div style={{
          marginBottom: '100px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '32px',
          padding: '80px 40px',
          animation: isVisible ? 'slideInUp 1s ease-out 0.8s both' : 'none'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🧠</div>
            <h2 style={{
              fontSize: '3rem',
              fontWeight: '900',
              marginBottom: '24px',
              background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              RAG-Powered Intelligence
            </h2>
            <p style={{
              fontSize: '1.3rem',
              color: '#475569',
              maxWidth: '800px',
              margin: '0 auto',
              lineHeight: '1.8'
            }}>
              Revolutionary Retrieval-Augmented Generation technology transforms how forensic investigators 
              interact with evidence. Ask complex questions and receive intelligent, context-aware answers 
              from your entire case database.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            {[
              {
                icon: '🔗',
                title: 'Semantic Search',
                description: 'Vector embeddings understand context, not just keywords. Find related evidence across different file types and formats.',
                examples: ['Find all communications about "Project X"', 'Show financial transfers to offshore accounts', 'Identify suspicious login patterns']
              },
              {
                icon: '🎯',
                title: 'Contextual Answers',
                description: 'AI synthesizes information from multiple sources to provide comprehensive, accurate responses with evidence citations.',
                examples: ['What was the suspect\'s location on March 15?', 'Summarize cryptocurrency transactions', 'Explain the attack timeline']
              },
              {
                icon: '⚡',
                title: 'Real-time Analysis',
                description: 'Process new evidence instantly and update knowledge base automatically. No manual indexing required.',
                examples: ['Auto-categorize uploaded files', 'Detect anomalous patterns', 'Generate investigation leads']
              }
            ].map((ragFeature, index) => (
              <div key={index} style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(203, 213, 225, 0.3)',
                borderRadius: '24px',
                padding: '40px 32px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{ragFeature.icon}</div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  marginBottom: '16px',
                  color: '#1e293b'
                }}>
                  {ragFeature.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  lineHeight: '1.6',
                  marginBottom: '24px'
                }}>
                  {ragFeature.description}
                </p>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#475569',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Example Queries:
                  </h4>
                  {ragFeature.examples.map((example, i) => (
                    <div key={i} style={{
                      padding: '8px 12px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      fontSize: '0.85rem',
                      color: '#3b82f6',
                      fontFamily: 'monospace'
                    }}>
                      "{example}"
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            animation: isVisible ? 'slideInUp 1s ease-out 1.2s both' : 'none'
          }}>
            Comprehensive Forensic Capabilities
          </h2>
          
          <p style={{
            fontSize: '1.1rem',
            color: '#64748b',
            marginBottom: '60px',
            animation: isVisible ? 'slideInUp 1s ease-out 1.4s both' : 'none'
          }}>
            Advanced tools for every aspect of digital investigation
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            maxWidth: '1400px',
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
                  padding: '32px 24px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: hoveredFeature === index ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                  boxShadow: hoveredFeature === index 
                    ? `0 25px 50px -12px ${feature.color}30` 
                    : '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                  animation: `slideInUp 0.6s ease-out ${Math.floor(index / 4) * 0.3 + (index % 4) * 0.1 + 1.6}s both`
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                {/* Feature Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{
                    fontSize: '2rem',
                    marginRight: '16px',
                    transform: hoveredFeature === index ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }}>
                    {feature.icon}
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: hoveredFeature === index ? '#1e293b' : '#64748b',
                    margin: 0
                  }}>
                    {feature.title}
                  </h3>
                </div>

                {/* Feature Description */}
                <p style={{
                  color: hoveredFeature === index ? '#475569' : '#64748b',
                  lineHeight: '1.6',
                  fontSize: '0.95rem',
                  marginBottom: '20px'
                }}>
                  {feature.description}
                </p>

                {/* Feature Details */}
                {feature.details && (
                  <div style={{
                    display: hoveredFeature === index ? 'block' : 'none',
                    animation: hoveredFeature === index ? 'fadeIn 0.3s ease-out' : 'none'
                  }}>
                    <h4 style={{
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#475569',
                      marginBottom: '12px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Key Features:
                    </h4>
                    <div style={{ display: 'grid', gap: '6px' }}>
                      {feature.details.map((detail, i) => (
                        <div key={i} style={{
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '0.85rem',
                          color: '#64748b'
                        }}>
                          <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: feature.color,
                            marginRight: '10px'
                          }} />
                          {detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Section */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '24px',
          padding: '80px 40px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          animation: isVisible ? 'slideInUp 1s ease-out 3.6s both' : 'none'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🚀</div>
          
          <h2 style={{
            fontSize: '3rem',
            fontWeight: '900',
            marginBottom: '24px',
            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Transform Your Investigations Today
          </h2>
          
          <p style={{
            fontSize: '1.3rem',
            color: '#475569',
            marginBottom: '48px',
            maxWidth: '700px',
            margin: '0 auto 48px',
            lineHeight: '1.7'
          }}>
            Join thousands of forensic professionals who have accelerated their investigations 
            with AI-powered intelligence. Experience the future of digital forensics.
          </p>
          
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => {
                console.log('Start Exploring button clicked');
                if (onNavigateToDashboard) {
                  onNavigateToDashboard();
                } else {
                  // Fallback: scroll to RAG section for demo
                  document.querySelector('[style*="RAG-Powered Intelligence"]')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                padding: '20px 48px',
                borderRadius: '16px',
                fontSize: '1.2rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '240px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-4px) scale(1.05)';
                e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.6)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.4)';
              }}
            >
              <span>⚡</span>
              Start Exploring
            </button>

            <button
              onClick={() => {
                // Scroll to features section for demo
                document.querySelector('h2').scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'transparent',
                color: '#3b82f6',
                border: '2px solid #3b82f6',
                padding: '18px 40px',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span>🎯</span>
              Explore Features
            </button>
          </div>

          {/* Trust indicators */}
          <div style={{
            marginTop: '60px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '40px',
            flexWrap: 'wrap',
            opacity: '0.8'
          }}>
            {[
              { icon: '🔒', text: 'SOC 2 Compliant' },
              { icon: '⚖️', text: 'Legally Defensible' },
              { icon: '🌍', text: 'Global Deployment' },
              { icon: '🛡️', text: 'Zero Trust Security' }
            ].map((trust, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.9rem',
                color: '#64748b'
              }}>
                <span>{trust.icon}</span>
                <span>{trust.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            transform: translateY(60px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(-10px) translateX(-5px);
          }
          75% {
            transform: translateY(-15px) translateX(-10px);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .gradient-text {
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981);
          background-size: 200% 200%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease-in-out infinite;
        }

        .feature-hover {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-hover:hover {
          transform: translateY(-12px) scale(1.03);
        }

        .tech-spec {
          position: relative;
          overflow: hidden;
        }

        .tech-spec::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transform: rotate(45deg);
          transition: transform 0.6s;
        }

        .tech-spec:hover::before {
          transform: rotate(45deg) translateX(100%);
        }

        .rag-demo {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.1), 
            rgba(139, 92, 246, 0.1), 
            rgba(16, 185, 129, 0.1));
          background-size: 400% 400%;
          animation: gradientShift 8s ease-in-out infinite;
        }

        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          
          .text-responsive {
            font-size: 1rem;
            line-height: 1.6;
          }
          
          .title-responsive {
            font-size: 2rem;
          }
        }

        .loading-shimmer {
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.4), 
            transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .particle-animation {
          position: relative;
        }

        .particle-animation::before {
          content: '';
          position: absolute;
          width: 2px;
          height: 2px;
          background: currentColor;
          border-radius: 50%;
          opacity: 0.6;
          animation: particle-float 6s ease-in-out infinite;
        }

        @keyframes particle-float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-30px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default HomePage;
