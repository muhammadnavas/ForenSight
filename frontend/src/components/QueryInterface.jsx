import { useState } from 'react';
import { GEMINI_CONFIG, makeGeminiRequest } from '../config/geminiConfig.js';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';

const QueryInterface = () => {
  const { selectedCase, caseFiles, selectedFiles = [], getSelectedFileObjects } = useCaseContext();
  const { caseData, hasData, statistics } = useCaseData();
  
  // Get case data from selected case and files
  const selectedCaseData = hasData ? caseData : (selectedCase ? {
    case: selectedCase,
    files: caseFiles,
    selectedFiles: getSelectedFileObjects()
  } : null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');
  
  const availableFiles = selectedFiles.length;
  const totalDataSize = selectedCaseData ? JSON.stringify(selectedCaseData).length : 0;

  // Format markdown report for proper display
  const formatMarkdownReport = (text) => {
    if (!text) return '';
    
    return text
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert ### headers to h3
      .replace(/^### (.*$)/gm, '<h3 style="color: #1e293b; font-size: 16px; font-weight: 700; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">$1</h3>')
      // Convert ## headers to h2  
      .replace(/^## (.*$)/gm, '<h2 style="color: #1e293b; font-size: 18px; font-weight: 700; margin: 24px 0 12px 0;">$1</h2>')
      // Convert # headers to h1
      .replace(/^# (.*$)/gm, '<h1 style="color: #1e293b; font-size: 20px; font-weight: 700; margin: 24px 0 16px 0;">$1</h1>')
      // Convert numbered lists
      .replace(/^\d+\.\s+\*\*(.*?)\*\*(.*?)$/gm, '<div style="margin: 12px 0;"><strong style="color: #059669;">$1</strong>$2</div>')
      .replace(/^\d+\.\s+(.*?)$/gm, '<div style="margin: 8px 0; padding-left: 16px; border-left: 3px solid #059669;"><strong style="color: #059669;">$1</strong></div>')
      // Convert bullet points with indentation
      .replace(/^(\s*)\*\s+\*\*(.*?)\*\*(.*?)$/gm, '<div style="margin: 8px 0; padding-left: 24px;"><strong style="color: #0ea5e9;">$2</strong>$3</div>')
      .replace(/^(\s*)\*\s+(.*?)$/gm, '<div style="margin: 6px 0; padding-left: 20px; color: #475569;">• $2</div>')
      // Convert horizontal rules
      .replace(/^---$/gm, '<hr style="border: none; border-top: 2px solid #e2e8f0; margin: 20px 0;" />')
      // Convert line breaks
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      // Style case ID and metadata
      .replace(/\*\*Case ID:\*\* (.*?)<br>/g, '<div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; margin: 8px 0;"><strong>Case ID:</strong> <code style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">$1</code></div>')
      .replace(/\*\*Search Query:\*\* "(.*?)"<br>/g, '<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 6px; margin: 8px 0;"><strong>Search Query:</strong> <em style="color: #0ea5e9;">"$1"</em></div>')
      .replace(/\*\*Date of Analysis:\*\* (.*?)<br>/g, '<div style="background: #f0fdf4; padding: 8px 12px; border-radius: 6px; margin: 8px 0;"><strong>Date of Analysis:</strong> $1</div>')
      // Style relevance scores
      .replace(/\*\*Relevance Score:\*\* (\d+)%/g, '<span style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">$1% Relevance</span>')
      // Style evidence types
      .replace(/\*\*Type:\*\* (COMMUNICATION|PHYSICAL|DIGITAL|FINANCIAL)/g, '<span style="background: #8b5cf6; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600;">$1</span>')
      // Style metadata
      .replace(/\*\*Metadata:\*\* (.*?)<br>/g, '<div style="background: #fafafa; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #64748b; border-left: 3px solid #cbd5e1; margin: 4px 0;">📋 <strong>Metadata:</strong> $1</div>');
  };

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    width: '100%',
    color: '#1e293b'
  };

  const headerStyle = {
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px'
  };

  const subtitleStyle = {
    color: '#64748b',
    fontSize: '16px',
    marginBottom: '16px'
  };
  
  const statusStyle = {
    display: 'flex',
    gap: '24px',
    marginTop: '16px'
  };
  
  const statusItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '14px'
  };

  const searchContainerStyle = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid #e2e8f0'
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#ffffff',
    border: '2px solid #cbd5e1',
    borderRadius: '8px',
    padding: '16px 20px',
    color: '#1e293b',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '16px'
  };

  const buttonStyle = {
    backgroundColor: '#0ea5e9',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const suggestionsStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '16px'
  };

  const suggestionButtonStyle = {
    backgroundColor: '#f1f5f9',
    color: '#1e293b',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const resultsStyle = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  const resultItemStyle = {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0'
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    if (!selectedCase || !selectedCaseData) {
      setError('Please select a case with data to perform AI-powered search.');
      return;
    }

    setIsSearching(true);
    setError('');
    setSearchResults([]);
    
    // Add to search history
    if (!searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
    }

    try {
      // Create AI-powered search prompt with detailed case data
      const searchPrompt = `
You are an expert forensic investigator and digital evidence analyst. Create a comprehensive forensic analysis report in the following EXACT format for the search query. Use proper markdown formatting with headers, bullet points, and structured sections.

**Forensic Analysis Report: [Query Topic]**

**Case ID:** ${hasData ? (caseData.caseId || 'FS-2025-XXX') : 'FS-2025-XXX'}
**Search Query:** "${query}"
**Date of Analysis:** ${new Date().toISOString().split('T')[0]}

---

### 1. Relevant Evidence Items that Match the Query

[List all evidence items with detailed analysis including:]
*   **Evidence Type:** [Type]
    *   **Description:** [Detailed description]
    *   **Type:** [COMMUNICATION/PHYSICAL/DIGITAL/FINANCIAL]
    *   **Relevance:** [How it relates to the query]
    *   **Relevance Score:** [X]%
    *   **Metadata:** Source: [Source], Status: [Status], Hash: [Hash], Timeline: [Timeline]

---

### 2. Key Findings and Insights from the Case Data

[Numbered list of key discoveries with relevance scores:]
1.  **[Finding Title]:** [Detailed explanation]
    *   **Relevance Score:** [X]%

---

### 3. Context and Significance of the Findings

[Analysis of what the findings mean for the investigation, explaining the broader context and implications]

---

### 4. Connections Between Different Evidence Pieces

*   [Detailed explanation of how evidence items connect and support each other]

---

### 5. Relevance Score for Each Finding

[Summary of relevance scores with justification]

---

### 6. Timestamps and Metadata

*   **Timestamps:** [Available timestamp information]
*   **Metadata:** [Hash values, sources, status information]

---

### 7. Investigative Recommendations Based on the Findings

[Numbered list of specific actionable recommendations for investigators:]
1.  **[Recommendation Title]:** [Detailed explanation of what investigators should do next]

CASE DATA:
${hasData ? `
CASE OVERVIEW:
- Case ID: ${caseData.caseId || 'Unknown'}
- Name: ${caseData.name || 'Unknown'}
- Type: ${caseData.type || 'Unknown'}
- Status: ${caseData.status || 'Unknown'}
- Priority: ${caseData.priority || 'Unknown'}
- Description: ${caseData.description || 'No description'}

SUSPECTS:
${caseData.suspects ? caseData.suspects.map(suspect => `
- Name: ${suspect.name || 'Unknown'}
- Role: ${suspect.role || 'Unknown'}
- Status: ${suspect.status || 'Unknown'}
- Details: ${suspect.details || 'No details'}
- Evidence: ${suspect.evidence ? suspect.evidence.join(', ') : 'None'}
- Associations: ${suspect.associations ? suspect.associations.join(', ') : 'None'}
`).join('') : 'No suspects data'}

VICTIMS:
${caseData.victims ? caseData.victims.map(victim => `
- Name: ${victim.name || 'Unknown'}
- Type: ${victim.type || 'Unknown'}
- Status: ${victim.status || 'Unknown'}
- Impact: ${victim.impact || 'Unknown'}
- Details: ${victim.details || 'No details'}
`).join('') : 'No victims data'}

EVIDENCE:
${caseData.evidence ? caseData.evidence.map(evidence => `
- Type: ${evidence.type || 'Unknown'}
- Description: ${evidence.description || 'No description'}
- Source: ${evidence.source || 'Unknown'}
- Status: ${evidence.status || 'Unknown'}
- Hash: ${evidence.hash || 'No hash'}
- Timeline: ${evidence.timeline || 'No timeline'}
`).join('') : 'No evidence data'}

TIMELINE:
${caseData.timeline ? caseData.timeline.map(event => `
- Date: ${event.date || 'Unknown'}
- Event: ${event.event || 'Unknown'}
- Type: ${event.type || 'Unknown'}
- Description: ${event.description || 'No description'}
- Evidence: ${event.evidence ? event.evidence.join(', ') : 'None'}
`).join('') : 'No timeline data'}

NETWORK TOPOLOGY:
${caseData.network ? `
- Infrastructure: ${caseData.network.infrastructure ? caseData.network.infrastructure.map(infra => `${infra.name} (${infra.type})`).join(', ') : 'None'}
- Connections: ${caseData.network.connections ? caseData.network.connections.map(conn => `${conn.from} -> ${conn.to} (${conn.type})`).join(', ') : 'None'}
- Communication Patterns: ${caseData.network.communicationPatterns || 'None'}
- Access Patterns: ${caseData.network.accessPatterns || 'None'}
` : 'No network data'}

GEOGRAPHIC DATA:
${caseData.geographic ? caseData.geographic.map(geo => `
- Location: ${geo.name || 'Unknown'} (${geo.latitude}, ${geo.longitude})
- Type: ${geo.type || 'Unknown'}
- Significance: ${geo.significance || 'No significance'}
- Evidence: ${geo.evidence ? geo.evidence.join(', ') : 'None'}
`).join('') : 'No geographic data'}

FINANCIAL ANALYSIS:
${caseData.financial ? `
- Cryptocurrency: ${caseData.financial.cryptocurrency ? caseData.financial.cryptocurrency.map(crypto => `${crypto.address} (${crypto.currency}): ${crypto.amount}`).join(', ') : 'None'}
- Transactions: ${caseData.financial.transactions ? caseData.financial.transactions.map(tx => `${tx.from} -> ${tx.to}: ${tx.amount} on ${tx.date}`).join(', ') : 'None'}
- Money Flow: ${caseData.financial.moneyFlow || 'No analysis'}
` : 'No financial data'}

DIGITAL FORENSICS:
${caseData.digitalForensics ? `
- File Analysis: ${caseData.digitalForensics.fileAnalysis || 'None'}
- Network Traffic: ${caseData.digitalForensics.networkTraffic || 'None'}
- System Logs: ${caseData.digitalForensics.systemLogs || 'None'}
- Malware Analysis: ${caseData.digitalForensics.malwareAnalysis || 'None'}
- Data Recovery: ${caseData.digitalForensics.dataRecovery || 'None'}
` : 'No digital forensics data'}
` : JSON.stringify(selectedCaseData, null, 2)}

SEARCH QUERY: "${query}"

CRITICAL INSTRUCTIONS:
- Follow the EXACT report format shown above with proper markdown formatting
- Use **bold** for headers and important terms
- Use numbered lists (1. 2. 3.) for key findings and recommendations
- Use bullet points (*) for evidence items and sub-items
- Include relevance scores as percentages (X%) for ALL findings
- Provide detailed, professional forensic analysis
- Include specific actionable investigative recommendations
- If insufficient data exists, explain limitations and suggest additional data collection approaches
- Maintain the professional tone and structure of a forensic investigation report
      `;

      const requestBody = {
        contents: [{
          parts: [{
            text: searchPrompt
          }]
        }]
      };

      console.log('AI Search Request:', {
        caseId: selectedCase ? (selectedCase.caseId || selectedCase._id) : null,
        query: query,
        model: GEMINI_CONFIG.MODEL
      });

      const aiResponse = await makeGeminiRequest(searchPrompt);
      
      // Parse AI response into search results format
      const searchResult = {
        id: Date.now(),
        query: query,
        timestamp: new Date().toISOString(),
        aiAnalysis: aiResponse,
        caseId: selectedCase ? (selectedCase.caseId || selectedCase._id) : null,
        type: 'AI Analysis',
        relevance: 95 // AI responses are highly relevant to the query
      };
      
      setSearchResults([searchResult]);
    } catch (error) {
      console.error('AI Search failed:', error);
      setError(`Search failed: ${error.message}`);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };



  const renderSearchResult = (result, index) => {
    const typeColors = {
      'AI Analysis': '#8b5cf6',
      'Communication': '#059669',
      'File': '#0ea5e9',
      'Call Log': '#8b5cf6',
      'Email': '#f59e0b'
    };

    return (
      <div key={index} style={resultItemStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              backgroundColor: typeColors[result.type] || '#6b7280',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              🤖 {result.type}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Query: "{result.query}"
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: result.relevance > 90 ? '#059669' : result.relevance > 70 ? '#f59e0b' : '#6b7280',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {result.relevance}% relevant
            </span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>
              {new Date(result.timestamp).toLocaleString()}
            </span>
          </div>
        </div>
        <div style={{ 
          backgroundColor: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '2px solid #e2e8f0'
          }}>
            <span style={{ fontSize: '20px' }}>📋</span>
            <h4 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1e293b' }}>
              Forensic Analysis Report
            </h4>
            <span style={{
              backgroundColor: '#059669',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              marginLeft: 'auto'
            }}>
              AI Generated
            </span>
          </div>
          <div 
            style={{ 
              color: '#1e293b', 
              lineHeight: '1.7',
              fontSize: '14px',
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            dangerouslySetInnerHTML={{ 
              __html: formatMarkdownReport(result.aiAnalysis) 
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginTop: '12px' }}>
          <span><strong>Case:</strong> {result.caseId}</span>
          <span><strong>Search Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}</span>
          <span><strong>AI Model:</strong> Gemini-1.5-Flash</span>
        </div>
      </div>
    );
  };

  // Show case selection prompt if no case selected
  if (!selectedCase) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 'calc(100vh - 200px)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px',
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>🗂️</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
              No Case Selected
            </h3>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5' }}>
              Please select a case from Case Management to start AI-powered querying
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedCaseData) {
    return (
      <div style={containerStyle}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 'calc(100vh - 200px)'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 40px',
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>🔍</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
              No Case Data Available
            </h3>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
              The selected case has no data available for AI analysis
            </p>
            <div style={{ 
              padding: '12px 16px',
              backgroundColor: '#8b5cf6',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'white'
            }}>
              🤖 AI-Powered: Upload case data to enable intelligent search
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📋 Forensic Report Generator - {selectedCase ? (selectedCase.name || selectedCase.caseId || selectedCase._id) : 'No Case'}</h1>
        <p style={subtitleStyle}>
          Generate comprehensive forensic analysis reports on any aspect of the case using AI-powered investigation
        </p>
        <div style={statusStyle}>
          <div style={statusItemStyle}>
            <span>📁</span>
            <span>Case: {selectedCase ? (selectedCase.name || selectedCase.caseId || selectedCase._id) : 'None'}</span>
          </div>
          <div style={statusItemStyle}>
            <span>📋</span>
            <span>Report Generator: Ready</span>
          </div>
          <div style={statusItemStyle}>
            <span>💾</span>
            <span>{Math.round(totalDataSize / 1024)} KB Data</span>
          </div>
          <div style={{
            ...statusItemStyle,
            backgroundColor: hasData ? '#059669' : (selectedCaseData ? '#8b5cf6' : '#dc2626'),
            color: 'white'
          }}>
            <span>{hasData ? '🟢' : (selectedCaseData ? '�' : '❌')}</span>
            <span>
              {hasData ? 'Detailed Case Data Available' : 
               selectedCaseData ? 'Basic Case Data Only' : 
               'No Data Available'}
            </span>
          </div>
          {hasData && statistics && (
            <div style={statusItemStyle}>
              <span>📊</span>
              <span>
                {statistics.suspectsCount || 0} suspects, {statistics.victimsCount || 0} victims, {statistics.evidenceCount || 0} evidence
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AI Search Interface */}
      <div style={searchContainerStyle}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          📋 Forensic Analysis Query:
        </label>
        <input
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter topic for forensic analysis: suspects, evidence, victims, financial data, network analysis..."
        />
        <button 
          style={{
            ...buttonStyle,
            backgroundColor: isSearching ? '#6b7280' : '#8b5cf6'
          }}
          onClick={handleSearch}
          disabled={isSearching || !selectedCaseData}
          onMouseEnter={(e) => !isSearching && selectedCaseData && (e.target.style.backgroundColor = '#7c3aed')}
          onMouseLeave={(e) => !isSearching && selectedCaseData && (e.target.style.backgroundColor = '#8b5cf6')}
        >
          {isSearching ? '⚖️' : '⚖️'}
          {isSearching ? 'Generating Report...' : 'Generate Report'}
        </button>

        {/* AI Query Suggestions */}
        <div style={suggestionsStyle}>
          <span style={{ fontSize: '14px', color: '#64748b', marginRight: '8px' }}>📋 Report suggestions:</span>
          {[
            'suspects',
            'evidence',
            'victims', 
            'financial transactions',
            'network connections',
            'timeline analysis',
            'digital artifacts',
            'communication patterns'
          ].map((suggestion, index) => (
            <button
              key={index}
              style={suggestionButtonStyle}
              onClick={() => setQuery(suggestion)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            >
              📋 {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          borderColor: '#fecaca',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
            ❌ Search Error
          </div>
          <div style={{ color: '#7f1d1d', fontSize: '14px' }}>
            {error}
          </div>
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🤖 Recent AI Queries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {searchHistory.slice(0, 5).map((historyItem, index) => (
              <button
                key={index}
                style={{
                  backgroundColor: '#f8fafc',
                  color: '#1e293b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background-color 0.2s ease'
                }}
                onClick={() => setQuery(historyItem)}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
              >
                🤖 {historyItem}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            🤖 AI Analysis Results ({searchResults.length} found)
          </h3>
          <div style={resultsStyle}>
            {searchResults.map(renderSearchResult)}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && query && !error && (
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>AI Analysis Complete</h3>
          <p style={{ color: '#64748b' }}>
            The AI didn't find specific results. Try rephrasing your query or asking more specific questions.
          </p>
        </div>
      )}

      {/* AI Loading State */}
      {isSearching && (
        <div style={{
          backgroundColor: '#faf5ff',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #d8b4fe'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#7c3aed' }}>
            AI is Analyzing Evidence...
          </h3>
          <p style={{ color: '#64748b' }}>
            Gemini AI is processing your query and examining the case data for relevant insights.
          </p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '16px auto'
          }}></div>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;
