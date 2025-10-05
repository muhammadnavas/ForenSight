import { useState } from 'react';

const AIChatInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([
    {
      type: 'system',
      content: 'AI Investigation Assistant activated. Please upload evidence files or ask me to analyze your case data.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000
  };

  const chatContainerStyle = {
    width: '800px',
    height: '600px',
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyle = {
    backgroundColor: '#0f172a',
    padding: '16px 20px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const messagesStyle = {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const inputStyle = {
    backgroundColor: '#334155',
    border: '1px solid #475569',
    borderRadius: '8px',
    padding: '12px 16px',
    color: 'white',
    fontSize: '14px',
    width: '100%',
    outline: 'none'
  };

  const inputContainerStyle = {
    padding: '20px',
    borderTop: '1px solid #334155',
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  };

  const sendButtonStyle = {
    backgroundColor: '#1e40af',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage = {
        type: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          type: 'ai',
          content: generateAIResponse(inputMessage),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const generateAIResponse = (userInput) => {
    const responses = {
      'crypto': 'I found 3 cryptocurrency wallet addresses in the evidence: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa, 3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy, and bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh. These appear in chat messages dated between March 15-18, 2024.',
      'communications': 'Analysis shows 156 total communications: 89 SMS messages, 45 WhatsApp messages, 12 email exchanges, and 10 voice calls. Peak activity occurred on March 16, 2024 with 23 interactions.',
      'timeline': 'Key timeline: March 15 - Initial contact established, March 16 - Peak communication activity, March 17 - Financial discussions, March 18 - Last known contact. Suspicious 6-hour gap on March 17 between 2:00-8:00 PM.',
      'contacts': 'Identified 12 unique contacts, including 4 international numbers (+44, +86, +971, +49). Most frequent contact: +1-555-0123 (47 interactions). High-risk contact: +971-xxx-xxxx (linked to flagged entity database).'
    };

    const input = userInput.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (input.includes(key)) {
        return response;
      }
    }

    return 'I\'m analyzing the evidence for patterns related to your query. Based on the current case data, I can help you explore communications, financial transactions, timeline analysis, contact networks, or generate specific reports. What would you like to investigate further?';
  };

  const renderMessage = (message, index) => {
    const isUser = message.type === 'user';
    const isSystem = message.type === 'system';
    
    const messageStyle = {
      maxWidth: '70%',
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      backgroundColor: isSystem ? '#334155' : (isUser ? '#1e40af' : '#374151'),
      color: 'white',
      padding: '12px 16px',
      borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
      fontSize: '14px',
      lineHeight: '1.4'
    };

    return (
      <div key={index} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={messageStyle}>
          {!isUser && !isSystem && (
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              🤖 AI Assistant
            </div>
          )}
          {isSystem && (
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
              📋 System
            </div>
          )}
          <div>{message.content}</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={overlayStyle} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={chatContainerStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#0ea5e9' }}>🤖</span>
              AI Investigation Assistant
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
              Ready to analyze your case data
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={messagesStyle}>
          {messages.map(renderMessage)}
        </div>

        <div style={inputContainerStyle}>
          <input
            style={inputStyle}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about evidence, communications, patterns, or request analysis..."
          />
          <button style={sendButtonStyle} onClick={handleSendMessage}>
            Send
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            'Show me crypto addresses',
            'Analyze communication patterns', 
            'Generate timeline',
            'List foreign contacts'
          ].map((suggestion, index) => (
            <button
              key={index}
              style={{
                backgroundColor: '#334155',
                color: 'white',
                border: '1px solid #475569',
                borderRadius: '16px',
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setInputMessage(suggestion)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#334155'}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChatInterface;