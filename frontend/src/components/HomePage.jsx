import { useState, useEffect } from 'react';import { useEffect, useState } from 'react';



const HomePage = ({ onNavigateToDashboard }) => {const HomePage = ({ onNavigateToDashboard }) => {

  const [isVisible, setIsVisible] = useState(false);  const [isVisible, setIsVisible] = useState(false);

  const [hoveredCard, setHoveredCard] = useState(null);  const [hoveredCard, setHoveredCard] = useState(null);



  useEffect(() => {  useEffect(() => {            {             {             { 

    setIsVisible(true);              icon: '💬', 

  }, []);              title: 'Natural Language Queries', 

              desc: 'Ask questions in plain English and get instant forensic insights from complex data structures',

  const heroStyle = {              color: '#0ea5e9',

    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e40af 75%, #1e3a8a 100%)',              gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',

    backgroundSize: '400% 400%',              borderColor: 'rgba(14, 165, 233, 0.3)'

    animation: 'gradientShift 15s ease infinite',            },

    color: 'white',            { 

    padding: '80px 0 120px',              icon: '🤖', 

    minHeight: '100vh',              title: 'AI-Powered Analysis', 

    display: 'flex',              desc: 'Advanced RAG and NLP algorithms powered by cutting-edge machine learning for deep forensic analysis',

    alignItems: 'center',              color: '#059669',

    position: 'relative',              gradient: 'linear-gradient(135deg, #059669, #047857)',

    overflow: 'hidden'              borderColor: 'rgba(5, 150, 105, 0.3)'

  };            },con: '💬', 

              title: 'Natural Language Queries', 

  const backgroundOverlayStyle = {              desc: 'Ask questions in plain English and get instant forensic insights from complex data structures',

    position: 'absolute',              color: '#0ea5e9',

    top: 0,              gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',

    left: 0,              borderColor: 'rgba(14, 165, 233, 0.3)'

    right: 0,            },

    bottom: 0,            { 

    background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',              icon: '🤖', 

    pointerEvents: 'none'              title: 'AI-Powered Analysis', 

  };              desc: 'Advanced RAG and NLP algorithms powered by cutting-edge machine learning for deep forensic analysis',

              color: '#059669',

  const containerStyle = {              gradient: 'linear-gradient(135deg, #059669, #047857)',

    maxWidth: '1200px',              borderColor: 'rgba(5, 150, 105, 0.3)'

    margin: '0 auto',            },con: '💬', 

    padding: '0 24px',              title: 'Natural Language Queries', 

    textAlign: 'center',              desc: 'Ask questions in plain English and get instant forensic insights from complex data structures',

    position: 'relative',              color: '#0ea5e9',

    zIndex: 2              gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',

  };              borderColor: 'rgba(14, 165, 233, 0.3)'

            },

  const titleStyle = {            { 

    fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',              icon: '🤖', 

    fontWeight: '900',              title: 'AI-Powered Analysis', 

    marginBottom: '24px',              desc: 'Advanced RAG and NLP algorithms powered by cutting-edge machine learning for deep forensic analysis',

    lineHeight: '1.1',              color: '#059669',

    background: 'linear-gradient(45deg, #ffffff, #e2e8f0, #cbd5e1)',              gradient: 'linear-gradient(135deg, #059669, #047857)',

    backgroundClip: 'text',              borderColor: 'rgba(5, 150, 105, 0.3)'

    WebkitBackgroundClip: 'text',            },e(true);

    WebkitTextFillColor: 'transparent',  }, []);

    animation: isVisible ? 'slideInUp 1s ease-out' : 'none',

    textShadow: '0 0 30px rgba(255, 255, 255, 0.1)'  const heroStyle = {

  };    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #334155 50%, #1e40af 75%, #1e3a8a 100%)',

    backgroundSize: '400% 400%',

  const subtitleStyle = {    animation: 'gradientShift 15s ease infinite',

    fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',    color: 'white',

    marginBottom: '32px',    padding: '80px 0 120px',

    color: '#94a3b8',    minHeight: '100vh',

    fontWeight: '600',    display: 'flex',

    animation: isVisible ? 'slideInUp 1s ease-out 0.2s both' : 'none',    alignItems: 'center',

    letterSpacing: '0.5px'    position: 'relative',

  };    overflow: 'hidden'

  };

  const descriptionStyle = {

    fontSize: '1.125rem',  const backgroundOverlayStyle = {

    marginBottom: '48px',    position: 'absolute',

    color: '#cbd5e1',    top: 0,

    maxWidth: '800px',    left: 0,

    margin: '0 auto 48px',    right: 0,

    lineHeight: '1.7',    bottom: 0,

    animation: isVisible ? 'slideInUp 1s ease-out 0.4s both' : 'none'    background: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',

  };    pointerEvents: 'none'

  };

  const buttonContainerStyle = {

    display: 'flex',  const containerStyle = {

    flexDirection: 'row',    maxWidth: '1200px',

    gap: '20px',    margin: '0 auto',

    justifyContent: 'center',    padding: '0 24px',

    alignItems: 'center',    textAlign: 'center',

    flexWrap: 'wrap',    position: 'relative',

    animation: isVisible ? 'slideInUp 1s ease-out 0.6s both' : 'none'    zIndex: 2

  };  };



  const primaryButtonStyle = {  const titleStyle = {

    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',    fontSize: 'clamp(2.5rem, 8vw, 5.5rem)',

    color: 'white',    fontWeight: '900',

    padding: '18px 36px',    marginBottom: '24px',

    borderRadius: '12px',    lineHeight: '1.1',

    fontSize: '1.125rem',    background: 'linear-gradient(45deg, #ffffff, #e2e8f0, #cbd5e1)',

    fontWeight: '700',    backgroundClip: 'text',

    border: 'none',    WebkitBackgroundClip: 'text',

    cursor: 'pointer',    WebkitTextFillColor: 'transparent',

    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',    animation: isVisible ? 'slideInUp 1s ease-out' : 'none',

    transition: 'all 0.3s ease',    textShadow: '0 0 30px rgba(255, 255, 255, 0.1)'

    minWidth: '220px',  };

    position: 'relative',

    overflow: 'hidden'  const subtitleStyle = {

  };    fontSize: 'clamp(1.1rem, 3vw, 1.8rem)',

    marginBottom: '32px',

  const secondaryButtonStyle = {    color: '#94a3b8',

    backgroundColor: 'transparent',    fontWeight: '600',

    color: 'white',    animation: isVisible ? 'slideInUp 1s ease-out 0.2s both' : 'none',

    padding: '18px 36px',    letterSpacing: '0.5px'

    borderRadius: '12px',  };

    fontSize: '1.125rem',

    fontWeight: '600',  const descriptionStyle = {

    border: '2px solid rgba(255, 255, 255, 0.3)',    fontSize: '1.125rem',

    cursor: 'pointer',    marginBottom: '48px',

    transition: 'all 0.3s ease',    color: '#cbd5e1',

    minWidth: '220px',    maxWidth: '800px',

    backdropFilter: 'blur(10px)',    margin: '0 auto 48px',

    background: 'rgba(255, 255, 255, 0.05)'    lineHeight: '1.7',

  };    animation: isVisible ? 'slideInUp 1s ease-out 0.4s both' : 'none'

  };

  return (

    <div style={heroStyle}>  const buttonContainerStyle = {

      <div style={backgroundOverlayStyle} />    display: 'flex',

          flexDirection: 'row',

      {/* Floating particles */}    gap: '20px',

      <div style={{    justifyContent: 'center',

        position: 'absolute',    alignItems: 'center',

        top: '10%',    flexWrap: 'wrap',

        left: '10%',    animation: isVisible ? 'slideInUp 1s ease-out 0.6s both' : 'none'

        width: '6px',  };

        height: '6px',

        backgroundColor: 'rgba(59, 130, 246, 0.6)',  const primaryButtonStyle = {

        borderRadius: '50%',    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',

        animation: 'float 8s ease-in-out infinite'    color: 'white',

      }} />    padding: '18px 36px',

      <div style={{    borderRadius: '12px',

        position: 'absolute',    fontSize: '1.125rem',

        top: '20%',    fontWeight: '700',

        right: '15%',    border: 'none',

        width: '8px',    cursor: 'pointer',

        height: '8px',    boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)',

        backgroundColor: 'rgba(139, 92, 246, 0.6)',    transition: 'all 0.3s ease',

        borderRadius: '50%',    minWidth: '220px',

        animation: 'float 6s ease-in-out infinite 2s'    position: 'relative',

      }} />    overflow: 'hidden'

      <div style={{  };

        position: 'absolute',

        bottom: '30%',  const secondaryButtonStyle = {

        left: '20%',    backgroundColor: 'transparent',

        width: '4px',    color: 'white',

        height: '4px',    padding: '18px 36px',

        backgroundColor: 'rgba(6, 182, 212, 0.6)',    borderRadius: '12px',

        borderRadius: '50%',    fontSize: '1.125rem',

        animation: 'float 10s ease-in-out infinite 1s'    fontWeight: '600',

      }} />    border: '2px solid rgba(255, 255, 255, 0.3)',

          cursor: 'pointer',

      <div style={containerStyle}>    transition: 'all 0.3s ease',

        {/* Main Hero Content */}    minWidth: '220px',

        <div style={{    backdropFilter: 'blur(10px)',

          display: 'flex',    background: 'rgba(255, 255, 255, 0.05)'

          alignItems: 'center',  };

          justifyContent: 'center',

          gap: '20px',  return (

          marginBottom: '24px',    <div style={heroStyle}>

          animation: isVisible ? 'slideInUp 1s ease-out' : 'none'      <div style={backgroundOverlayStyle} />

        }}>      

          <div style={{      {/* Floating particles */}

            fontSize: '4rem',      <div style={{

            animation: 'bounce 2s infinite'        position: 'absolute',

          }}>🔍</div>        top: '10%',

          <h1 style={titleStyle}>        left: '10%',

            ForenSight        width: '6px',

          </h1>        height: '6px',

        </div>        backgroundColor: 'rgba(59, 130, 246, 0.6)',

                borderRadius: '50%',

        <p style={subtitleStyle}>        animation: 'float 8s ease-in-out infinite'

          AI-Driven UFDR Analysis for Digital Forensic Investigations      }} />

        </p>      <div style={{

                position: 'absolute',

        <p style={descriptionStyle}>        top: '20%',

          Transform complex forensic data into actionable insights with natural language queries.         right: '15%',

          Extract evidence faster, generate court-ready reports, and uncover hidden connections         width: '8px',

          across digital communications with the power of advanced AI analysis.        height: '8px',

        </p>        backgroundColor: 'rgba(139, 92, 246, 0.6)',

                borderRadius: '50%',

        <div style={buttonContainerStyle}>        animation: 'float 6s ease-in-out infinite 2s'

          <button       }} />

            style={primaryButtonStyle}      <div style={{

            onClick={onNavigateToDashboard}        position: 'absolute',

            onMouseEnter={(e) => {        bottom: '30%',

              e.target.style.transform = 'translateY(-3px)';        left: '20%',

              e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.5)';        width: '4px',

            }}        height: '4px',

            onMouseLeave={(e) => {        backgroundColor: 'rgba(6, 182, 212, 0.6)',

              e.target.style.transform = 'translateY(0)';        borderRadius: '50%',

              e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)';        animation: 'float 10s ease-in-out infinite 1s'

            }}      }} />

          >      

            <span style={{ marginRight: '8px' }}>🚀</span>      <div style={containerStyle}>

            Launch Investigation Platform        {/* Main Hero Content */}

          </button>        <div style={{

          <button           display: 'flex',

            style={secondaryButtonStyle}          alignItems: 'center',

            onMouseEnter={(e) => {          justifyContent: 'center',

              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';          gap: '20px',

              e.target.style.borderColor = 'white';          marginBottom: '24px',

              e.target.style.transform = 'translateY(-3px)';          animation: isVisible ? 'slideInUp 1s ease-out' : 'none'

            }}        }}>

            onMouseLeave={(e) => {          <div style={{

              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';            fontSize: '4rem',

              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';            animation: 'bounce 2s infinite'

              e.target.style.transform = 'translateY(0)';          }}>🔍</div>

            }}          <h1 style={titleStyle}>

          >            ForenSight

            <span style={{ marginRight: '8px' }}>📺</span>          </h1>

            Watch Demo        </div>

          </button>        

        </div>        <p style={subtitleStyle}>

          AI-Driven UFDR Analysis for Digital Forensic Investigations

        {/* Key Features Preview */}        </p>

        <div style={{        

          display: 'grid',        <p style={descriptionStyle}>

          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',          Transform complex forensic data into actionable insights with natural language queries. 

          gap: '32px',          Extract evidence faster, generate court-ready reports, and uncover hidden connections 

          marginTop: '100px',          across digital communications with the power of advanced AI analysis.

          maxWidth: '1200px',        </p>

          margin: '100px auto 0',        

          animation: isVisible ? 'slideInUp 1s ease-out 0.8s both' : 'none'        <div style={buttonContainerStyle}>

        }}>          <button 

          {[            style={primaryButtonStyle}

            {             onClick={onNavigateToDashboard}

              icon: '💬',             onMouseEnter={(e) => {

              title: 'Natural Language Queries',               e.target.style.transform = 'translateY(-3px)';

              desc: 'Ask questions in plain English and get instant forensic insights from complex data structures',              e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.5)';

              color: '#0ea5e9',            }}

              gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',            onMouseLeave={(e) => {

              borderColor: 'rgba(14, 165, 233, 0.3)'              e.target.style.transform = 'translateY(0)';

            },              e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)';

            {             }}

              icon: '🤖',           >

              title: 'AI-Powered Analysis',             <span style={{ marginRight: '8px' }}>🚀</span>

              desc: 'Advanced RAG and NLP algorithms powered by cutting-edge machine learning for deep forensic analysis',            Launch Investigation Platform

              color: '#059669',          </button>

              gradient: 'linear-gradient(135deg, #059669, #047857)',          <button 

              borderColor: 'rgba(5, 150, 105, 0.3)'            style={secondaryButtonStyle}

            },            onMouseEnter={(e) => {

            {               e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';

              icon: '⚖️',               e.target.style.borderColor = 'white';

              title: 'Court-Ready Reports',               e.target.style.transform = 'translateY(-3px)';

              desc: 'Generate professional legal documentation with complete chain of custody and evidence integrity',            }}

              color: '#7c3aed',            onMouseLeave={(e) => {

              gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';

              borderColor: 'rgba(124, 58, 237, 0.3)'              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';

            },              e.target.style.transform = 'translateY(0)';

            {             }}

              icon: '🔗',           >

              title: 'Cross-Data Linkages',             <span style={{ marginRight: '8px' }}>📺</span>

              desc: 'Discover hidden connections and patterns across multiple data sources and communication channels',            Watch Demo

              color: '#dc2626',          </button>

              gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',        </div>

              borderColor: 'rgba(220, 38, 38, 0.3)'

            }        {/* Key Features Preview */}

          ].map((feature, index) => (        <div style={{

            <div           display: 'grid',

              key={index}           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',

              style={{          gap: '32px',

                background: hoveredCard === index           marginTop: '100px',

                  ? feature.gradient           maxWidth: '1200px',

                  : 'rgba(30, 41, 59, 0.8)',          margin: '100px auto 0',

                padding: '40px 32px',          animation: isVisible ? 'slideInUp 1s ease-out 0.8s both' : 'none'

                borderRadius: '24px',        }}>

                position: 'relative',          {[

                overflow: 'hidden',            { 

                boxShadow: hoveredCard === index              icon: '�️', 

                  ? `0 25px 50px -12px ${feature.color}40`              title: 'Natural Language Queries', 

                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',              desc: 'Ask questions in plain English and get instant forensic insights from complex data structures',

                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',              color: '#0ea5e9',

                cursor: 'pointer',              gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',

                border: `1px solid ${feature.borderColor}`,              borderColor: 'rgba(14, 165, 233, 0.3)'

                backdropFilter: 'blur(10px)',            },

                transform: hoveredCard === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',            { 

                animation: `slideInUp 0.6s ease-out ${0.2 * index}s both`              icon: '�', 

              }}              title: 'AI-Powered Analysis', 

              onMouseEnter={() => setHoveredCard(index)}              desc: 'Advanced RAG and NLP algorithms powered by cutting-edge machine learning for deep forensic analysis',

              onMouseLeave={() => setHoveredCard(null)}              color: '#059669',

            >              gradient: 'linear-gradient(135deg, #059669, #047857)',

              {/* Animated background effect */}              borderColor: 'rgba(5, 150, 105, 0.3)'

              <div style={{            },

                position: 'absolute',            { 

                top: '-50%',              icon: '⚖️', 

                right: '-50%',              title: 'Court-Ready Reports', 

                width: '200px',              desc: 'Generate professional legal documentation with complete chain of custody and evidence integrity',

                height: '200px',              color: '#7c3aed',

                background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,              gradient: 'linear-gradient(135deg, #7c3aed, #6d28d9)',

                borderRadius: '50%',              borderColor: 'rgba(124, 58, 237, 0.3)'

                animation: 'float 8s ease-in-out infinite',            },

                animationDelay: `${index * 2}s`            { 

              }} />              icon: '🔗', 

                            title: 'Cross-Data Linkages', 

              {/* Icon with hover animation */}              desc: 'Discover hidden connections and patterns across multiple data sources and communication channels',

              <div style={{               color: '#dc2626',

                fontSize: '3.5rem',               gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',

                marginBottom: '20px',              borderColor: 'rgba(220, 38, 38, 0.3)'

                position: 'relative',            }

                zIndex: 2,          ].map((feature, index) => (

                transform: hoveredCard === index ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',            <div 

                transition: 'transform 0.3s ease'              key={index} 

              }}>{feature.icon}</div>              style={{

                              background: hoveredCard === index 

              <h3 style={{                   ? feature.gradient 

                fontSize: '1.4rem',                   : 'rgba(30, 41, 59, 0.8)',

                fontWeight: '800',                 padding: '40px 32px',

                marginBottom: '16px',                borderRadius: '24px',

                position: 'relative',                position: 'relative',

                zIndex: 2,                overflow: 'hidden',

                color: hoveredCard === index ? 'white' : '#f1f5f9'                boxShadow: hoveredCard === index

              }}>                  ? `0 25px 50px -12px ${feature.color}40`

                {feature.title}                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',

              </h3>                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',

                              cursor: 'pointer',

              <p style={{                 border: `1px solid ${feature.borderColor}`,

                color: hoveredCard === index ? 'rgba(255, 255, 255, 0.95)' : 'rgba(203, 213, 225, 0.9)',                 backdropFilter: 'blur(10px)',

                fontSize: '1rem',                transform: hoveredCard === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0) scale(1)',

                lineHeight: '1.7',                animation: `slideInUp 0.6s ease-out ${0.2 * index}s both`

                position: 'relative',              }}

                zIndex: 2,              onMouseEnter={() => setHoveredCard(index)}

                transition: 'color 0.3s ease'              onMouseLeave={() => setHoveredCard(null)}

              }}>            >

                {feature.desc}              {/* Animated background effect */}

              </p>              <div style={{

            </div>                position: 'absolute',

          ))}                top: '-50%',

        </div>                right: '-50%',

                        width: '200px',

        {/* Call to Action Section */}                height: '200px',

        <div style={{                background: `radial-gradient(circle, ${feature.color}20 0%, transparent 70%)`,

          marginTop: '120px',                borderRadius: '50%',

          padding: '60px 40px',                animation: 'float 8s ease-in-out infinite',

          background: 'rgba(30, 41, 59, 0.6)',                animationDelay: `${index * 2}s`

          backdropFilter: 'blur(20px)',              }} />

          borderRadius: '32px',              

          border: '1px solid rgba(255, 255, 255, 0.1)',              {/* Icon with hover animation */}

          textAlign: 'center',              <div style={{ 

          animation: isVisible ? 'slideInUp 1s ease-out 1s both' : 'none'                fontSize: '3.5rem', 

        }}>                marginBottom: '20px',

          <h2 style={{                position: 'relative',

            fontSize: '2.2rem',                zIndex: 2,

            fontWeight: '800',                transform: hoveredCard === index ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',

            marginBottom: '20px',                transition: 'transform 0.3s ease'

            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',              }}>{feature.icon}</div>

            backgroundClip: 'text',              

            WebkitBackgroundClip: 'text',              <h3 style={{ 

            WebkitTextFillColor: 'transparent'                fontSize: '1.4rem', 

          }}>                fontWeight: '800', 

            Ready to Transform Your Digital Investigations?                marginBottom: '16px',

          </h2>                position: 'relative',

          <p style={{                zIndex: 2,

            fontSize: '1.2rem',                color: hoveredCard === index ? 'white' : '#f1f5f9'

            color: '#cbd5e1',              }}>

            marginBottom: '40px',                {feature.title}

            maxWidth: '600px',              </h3>

            margin: '0 auto 40px'              

          }}>              <p style={{ 

            Join forensic experts worldwide who trust ForenSight for faster, more accurate digital investigations.                color: hoveredCard === index ? 'rgba(255, 255, 255, 0.95)' : 'rgba(203, 213, 225, 0.9)', 

          </p>                fontSize: '1rem',

          <button                 lineHeight: '1.7',

            style={{                position: 'relative',

              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',                zIndex: 2,

              color: 'white',                transition: 'color 0.3s ease'

              padding: '20px 48px',              }}>

              borderRadius: '16px',                {feature.desc}

              fontSize: '1.25rem',              </p>

              fontWeight: '700',            </div>

              border: 'none',          ))}

              cursor: 'pointer',        </div>

              boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',        

              transition: 'all 0.3s ease'        {/* Call to Action Section */}

            }}        <div style={{

            onClick={onNavigateToDashboard}          marginTop: '120px',

            onMouseEnter={(e) => {          padding: '60px 40px',

              e.target.style.transform = 'translateY(-4px)';          background: 'rgba(30, 41, 59, 0.6)',

              e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.5)';          backdropFilter: 'blur(20px)',

            }}          borderRadius: '32px',

            onMouseLeave={(e) => {          border: '1px solid rgba(255, 255, 255, 0.1)',

              e.target.style.transform = 'translateY(0)';          textAlign: 'center',

              e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3)';          animation: isVisible ? 'slideInUp 1s ease-out 1s both' : 'none'

            }}        }}>

          >          <h2 style={{

            <span style={{ marginRight: '12px' }}>⚡</span>            fontSize: '2.2rem',

            Start Your Investigation Now            fontWeight: '800',

          </button>            marginBottom: '20px',

        </div>            background: 'linear-gradient(45deg, #3b82f6, #8b5cf6)',

      </div>            backgroundClip: 'text',

    </div>            WebkitBackgroundClip: 'text',

  );            WebkitTextFillColor: 'transparent'

};          }}>

            Ready to Transform Your Digital Investigations?

export default HomePage;          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#cbd5e1',
            marginBottom: '40px',
            maxWidth: '600px',
            margin: '0 auto 40px'
          }}>
            Join forensic experts worldwide who trust ForenSight for faster, more accurate digital investigations.
          </p>
          <button 
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: 'white',
              padding: '20px 48px',
              borderRadius: '16px',
              fontSize: '1.25rem',
              fontWeight: '700',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onClick={onNavigateToDashboard}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-4px)';
              e.target.style.boxShadow = '0 25px 50px -12px rgba(59, 130, 246, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span style={{ marginRight: '12px' }}>⚡</span>
            Start Your Investigation Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;