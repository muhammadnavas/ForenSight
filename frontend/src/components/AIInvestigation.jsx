import { useEffect, useRef, useState } from 'react';
import { makeGeminiRequest } from '../config/geminiConfig.js';
import { useCaseContext } from '../contexts/CaseContext.jsx';
import { useCaseData } from '../contexts/CaseDataContext.jsx';

const AIInvestigation = () => {
  const { selectedCase, caseFiles, getSelectedFileObjects } = useCaseContext();
  const { caseData, hasData, statistics, getNetworkData, getGeographicData, getEvidenceData } = useCaseData();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  // Add CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Get case data from selected case and files
  const selectedCaseData = selectedCase ? {
    case: selectedCase,
    files: caseFiles,
    selectedFiles: getSelectedFileObjects()
  } : null;

  // Predefined forensic investigation prompts
  const forensicPrompts = [
    {
      title: "Timeline Analysis",
      prompt: "Analyze the digital evidence timeline and identify key events, potential gaps, and suspicious patterns in chronological order."
    },
    {
      title: "Artifact Correlation",
      prompt: "Examine the digital artifacts and identify correlations between different types of evidence (files, communications, system logs, etc.)."
    },
    {
      title: "Anomaly Detection",
      prompt: "Review the evidence for unusual patterns, deleted files, system modifications, or other anomalies that might indicate tampering or suspicious activity."
    }
  ];

  const sendMessage = async (messageText = null, isQuickPrompt = false) => {
    const messageToSend = messageText || query.trim();
    
    if (!messageToSend || loading) return;
    
    if (!selectedCase || !selectedCaseData) {
      addSystemMessage('Please select a case first to perform AI investigation.', 'error');
      return;
    }

    // Add user message to chat
    const userMessage = {
      id: Date.now() + Math.random(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
      isQuickPrompt
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setQuery('');
    setLoading(true);

    try {
      // Create comprehensive prompt with case context
      const contextPrompt = `
You are a forensic digital investigation AI assistant. Analyze the following case data and respond to the investigation query.

CASE INFORMATION:
Case ID: ${selectedCase.caseId || selectedCase._id}
Case Name: ${selectedCase.name || selectedCase.title}
Case Description: ${selectedCase.description || 'No description available'}
Case Status: ${selectedCase.status || 'Unknown'}
Priority: ${selectedCase.priority || 'Unknown'}
Investigator: ${selectedCase.investigator || 'Unknown'}

${caseData ? `
DETAILED CASE DATA:

SUSPECTS:
${caseData.suspects ? caseData.suspects.map(suspect => `
- ${suspect.name} (${suspect.nationality}, Age: ${suspect.age})
  Role: ${suspect.role}
  Risk Level: ${suspect.riskLevel}
  Aliases: ${suspect.alias ? suspect.alias.join(', ') : 'None'}
  Known Addresses: ${suspect.knownAddresses ? suspect.knownAddresses.join('; ') : 'Unknown'}
  Digital Footprint: ${suspect.digitalFootprint ? JSON.stringify(suspect.digitalFootprint) : 'None'}
`).join('\n') : 'No suspect information available'}

VICTIMS:
${caseData.victims ? caseData.victims.map(victim => `
- ${victim.name} (${victim.type})
  Financial Loss: $${victim.financialLoss ? victim.financialLoss.toLocaleString() : 'Unknown'}
  Incident Date: ${victim.incidentDate || 'Unknown'}
  Systems Affected: ${victim.systemsAffected ? victim.systemsAffected.join(', ') : 'Unknown'}
  Compromised Assets: ${victim.compromisedAssets ? victim.compromisedAssets.join(', ') : 'Unknown'}
`).join('\n') : 'No victim information available'}

EVIDENCE:
${caseData.evidence ? caseData.evidence.map(evidence => `
- ${evidence.name} (${evidence.type} - ${evidence.category})
  Description: ${evidence.description}
  Collection Date: ${evidence.collectedDate}
  Analysis Status: ${evidence.analysis?.status || 'Pending'}
  Key Findings: ${evidence.analysis?.findings ? JSON.stringify(evidence.analysis.findings) : 'None'}
`).join('\n') : 'No evidence information available'}

NETWORK TOPOLOGY:
${caseData.networkTopology ? `
Nodes: ${caseData.networkTopology.nodes ? caseData.networkTopology.nodes.map(node => 
  `${node.label} (${node.type}, Risk: ${node.riskLevel})`).join(', ') : 'None'}
Connections: ${caseData.networkTopology.edges ? caseData.networkTopology.edges.length : 0} relationships
` : 'No network topology available'}

GEOGRAPHIC DATA:
Suspect Locations: ${caseData.geographicData?.suspectLocations?.length || 0}
Criminal Activities: ${caseData.geographicData?.criminalActivity?.length || 0}
Infrastructure Points: ${caseData.geographicData?.infrastructure?.length || 0}

FINANCIAL ANALYSIS:
${caseData.cryptoAnalysis ? `
Total Value: $${caseData.cryptoAnalysis.totalValueUSD?.toLocaleString() || 'Unknown'}
Unique Wallets: ${caseData.cryptoAnalysis.uniqueWallets || 'Unknown'}
Exchanges Used: ${caseData.cryptoAnalysis.exchangesUsed || 'Unknown'}
` : 'No financial analysis available'}

DIGITAL FORENSICS:
${caseData.digitalForensics ? `
Key Findings: ${caseData.digitalForensics.keyFindings ? caseData.digitalForensics.keyFindings.join('; ') : 'None'}
Tools Used: ${caseData.digitalForensics.forensicTools ? caseData.digitalForensics.forensicTools.join(', ') : 'None'}
Recovery Stats: ${caseData.digitalForensics.dataRecovery ? JSON.stringify(caseData.digitalForensics.dataRecovery) : 'None'}
` : 'No digital forensics data available'}
` : 'No detailed case data loaded - only basic case information available'}

CASE STATISTICS:
- Total Suspects: ${statistics.totalSuspects}
- Total Victims: ${statistics.totalVictims}
- Total Evidence: ${statistics.totalEvidence}
- Total Locations: ${statistics.totalLocations}
- Risk Level: ${statistics.riskLevel}
- Completion: ${statistics.completionPercentage}%

INVESTIGATION QUERY:
${messageToSend}

Please provide a detailed forensic analysis based on the available evidence and case information. Focus on actionable insights, professional forensic investigation practices, and specific details from the case data provided above.
      `;

      const result = await makeGeminiRequest(contextPrompt);
      
      if (result) {
        // Add AI response to chat
        const aiMessage = {
          id: Date.now() + Math.random(),
          type: 'ai',
          content: result,
          timestamp: new Date()
        };
        
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        addSystemMessage('No response received from AI service', 'error');
      }
    } catch (error) {
      console.error('AI Investigation Error:', error);
      addSystemMessage(`Failed to analyze case: ${error.message || 'Unknown error occurred'}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const addSystemMessage = (message, type = 'info') => {
    const systemMessage = {
      id: Date.now() + Math.random(),
      type: 'system',
      content: message,
      timestamp: new Date(),
      messageType: type
    };
    setChatHistory(prev => [...prev, systemMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const exportChat = () => {
    if (chatHistory.length === 0) return;
    
    const exportData = {
      caseId: selectedCase?.caseId || selectedCase?._id,
      caseName: selectedCase?.name || selectedCase?.title,
      exportDate: new Date().toISOString(),
      chatHistory: chatHistory.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        ...(msg.isQuickPrompt && { isQuickPrompt: true }),
        ...(msg.messageType && { messageType: msg.messageType })
      })),
      evidenceFiles: caseFiles ? caseFiles.map(f => f.originalName || f.filename) : []
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-investigation-chat-${selectedCase?.caseId || 'unknown'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      height: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header with Case Info */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0
          }}>
            🤖 AI Investigation Chat
          </h1>
        </div>
        
        {/* Case Info in Top Right */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '12px 16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minWidth: '300px'
        }}>
          {selectedCase ? (
            <div>
              <div style={{ color: '#86efac', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                📁 {selectedCase.caseId || selectedCase._id}
              </div>
              <div style={{ color: 'white', fontSize: '16px', fontWeight: '500', marginBottom: '2px' }}>
                {selectedCase.name || selectedCase.title}
              </div>
              <div style={{ color: '#93c5fd', fontSize: '12px' }}>
                📊 {caseFiles ? caseFiles.length : 0} evidence files
              </div>
            </div>
          ) : (
            <div style={{ color: '#fcd34d', fontSize: '14px' }}>
              ⚠️ No case selected
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {forensicPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => sendMessage(prompt.prompt, true)}
              disabled={loading || !selectedCase}
              style={{
                padding: '8px 16px',
                backgroundColor: loading || !selectedCase ? 'rgba(75, 85, 99, 0.3)' : 'rgba(37, 99, 235, 0.3)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '20px',
                color: 'white',
                fontSize: '14px',
                cursor: loading || !selectedCase ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: loading || !selectedCase ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedCase) {
                  e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.5)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedCase) {
                  e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.3)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {prompt.title}
            </button>
          ))}
          <button
            onClick={clearChat}
            disabled={chatHistory.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: chatHistory.length === 0 ? 'rgba(75, 85, 99, 0.3)' : 'rgba(239, 68, 68, 0.3)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              cursor: chatHistory.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: chatHistory.length === 0 ? 0.5 : 1
            }}
          >
            🗑️ Clear
          </button>
          <button
            onClick={exportChat}
            disabled={chatHistory.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: chatHistory.length === 0 ? 'rgba(75, 85, 99, 0.3)' : 'rgba(34, 197, 94, 0.3)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '20px',
              color: 'white',
              fontSize: '14px',
              cursor: chatHistory.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: chatHistory.length === 0 ? 0.5 : 1
            }}
          >
            💾 Export
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Messages Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {chatHistory.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🤖</div>
              <h3 style={{ color: 'white', fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                AI Investigation Assistant
              </h3>
              <p style={{ color: '#93c5fd', fontSize: '16px', marginBottom: '24px', maxWidth: '500px' }}>
                Start your forensic investigation by asking questions or using the quick analysis options above.
              </p>
              {!selectedCase && (
                <div style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  borderRadius: '8px',
                  padding: '16px',
                  color: '#fca5a5'
                }}>
                  ⚠️ Please select a case from Case Management to begin investigation
                </div>
              )}
            </div>
          ) : (
            <>
              {chatHistory.map((message) => (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    animation: 'fadeIn 0.3s ease-out'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: message.type === 'user' 
                      ? 'rgba(37, 99, 235, 0.3)' 
                      : message.type === 'system' 
                      ? `rgba(${message.messageType === 'error' ? '239, 68, 68' : '34, 197, 94'}, 0.2)`
                      : 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid rgba(${
                      message.type === 'user' 
                        ? '59, 130, 246' 
                        : message.type === 'system' 
                        ? message.messageType === 'error' ? '239, 68, 68' : '34, 197, 94'
                        : '255, 255, 255'
                    }, 0.3)`,
                    backdropFilter: 'blur(8px)'
                  }}>
                    {/* Message Header */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px'
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: message.type === 'user' ? '#93c5fd' : message.type === 'system' ? 
                          (message.messageType === 'error' ? '#fca5a5' : '#86efac') : '#86efac'
                      }}>
                        {message.type === 'user' ? '👤 You' : message.type === 'system' ? '⚙️ System' : '🤖 AI Assistant'}
                        {message.isQuickPrompt && <span style={{ color: '#60a5fa', marginLeft: '8px' }}>⚡</span>}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.5)'
                      }}>
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    
                    {/* Message Content */}
                    <div style={{
                      color: 'white',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {loading && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-start'
                }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #60a5fa',
                        borderTop: '2px solid transparent',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }}></div>
                      <span style={{ color: '#93c5fd', fontSize: '14px' }}>
                        AI is analyzing...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            <div style={{ flex: 1 }}>
              <textarea
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedCase ? "Ask a question about the case..." : "Please select a case first"}
                disabled={loading || !selectedCase}
                rows={2}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  lineHeight: '1.4',
                  minHeight: '44px',
                  maxHeight: '120px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !selectedCase || !query.trim()}
              style={{
                padding: '12px 20px',
                backgroundColor: loading || !selectedCase || !query.trim() ? 'rgba(75, 85, 99, 0.5)' : 'rgba(37, 99, 235, 0.8)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '16px',
                cursor: loading || !selectedCase || !query.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                minWidth: '60px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedCase && query.trim()) {
                  e.target.style.backgroundColor = 'rgba(37, 99, 235, 1)';
                  e.target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && selectedCase && query.trim()) {
                  e.target.style.backgroundColor = 'rgba(37, 99, 235, 0.8)';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
            >
              {loading ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                '📤'
              )}
            </button>
          </div>
          
          {/* Input hint */}
          <div style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '8px',
            textAlign: 'center'
          }}>
            Press Enter to send • Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInvestigation;