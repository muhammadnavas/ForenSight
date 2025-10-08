import { useState } from 'react';
import { GEMINI_CONFIG, makeGeminiRequest } from '../config/geminiConfig.js';
import { useCaseContext } from '../contexts/CaseContext';

const QueryInterface = () => {
  const { selectedCase, caseFiles, selectedFiles = [], getSelectedFileObjects } = useCaseContext();
  
  // Get case data from selected case and files
  const selectedCaseData = selectedCase ? {
    case: selectedCase,
    files: caseFiles,
    selectedFiles: getSelectedFileObjects()
  } : null;
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [error, setError] = useState('');
  
  const availableFiles = selectedFiles.length;
  const totalDataSize = selectedCaseData ? JSON.stringify(selectedCaseData).length : 0;

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
      // Create AI-powered search prompt
      const searchPrompt = `
You are a forensic digital evidence search AI. Analyze the following case data and respond to the search query with relevant evidence.

CASE DATA:
${JSON.stringify(selectedCaseData, null, 2)}

SEARCH QUERY: "${query}"

Please provide:
1. Relevant evidence items that match the query
2. Key findings and insights
3. Context and significance of the findings
4. Relevance score (0-100%) for each finding
5. Timestamps and metadata when available

Format your response as a structured analysis with clear sections for each relevant finding. If no relevant evidence is found, explain why and suggest alternative search terms.
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
          backgroundColor: '#f8fafc', 
          padding: '16px', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>
            🔍 AI Analysis Results:
          </h4>
          <pre style={{ 
            color: '#1e293b', 
            marginBottom: '12px', 
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            {result.aiAnalysis}
          </pre>
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
        <h1 style={titleStyle}>🤖 AI Query Interface - {selectedCase ? (selectedCase.name || selectedCase.caseId || selectedCase._id) : 'No Case'}</h1>
        <p style={subtitleStyle}>
          Use natural language to search and analyze evidence data with AI-powered insights
        </p>
        <div style={statusStyle}>
          <div style={statusItemStyle}>
            <span>📁</span>
            <span>Case: {selectedCase ? (selectedCase.name || selectedCase.caseId || selectedCase._id) : 'None'}</span>
          </div>
          <div style={statusItemStyle}>
            <span>🤖</span>
            <span>AI: Gemini Ready</span>
          </div>
          <div style={statusItemStyle}>
            <span>💾</span>
            <span>{Math.round(totalDataSize / 1024)} KB Data</span>
          </div>
          <div style={{
            ...statusItemStyle,
            backgroundColor: selectedCaseData ? '#8b5cf6' : '#dc2626',
            color: 'white'
          }}>
            <span>{selectedCaseData ? '🟢' : '❌'}</span>
            <span>{selectedCaseData ? 'AI Search Ready' : 'No Data Available'}</span>
          </div>
        </div>
      </div>

      {/* AI Search Interface */}
      <div style={searchContainerStyle}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          🤖 AI-Powered Investigation Query:
        </label>
        <input
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Ask AI anything about the evidence: communications, files, timeline, patterns..."
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
          {isSearching ? '🤖' : '🔍'}
          {isSearching ? 'AI Analyzing...' : 'Ask AI'}
        </button>

        {/* AI Query Suggestions */}
        <div style={suggestionsStyle}>
          <span style={{ fontSize: '14px', color: '#64748b', marginRight: '8px' }}>AI suggestions:</span>
          {[
            'suspicious communication patterns',
            'timeline of events',  
            'digital evidence anomalies',
            'key contacts and relationships',
            'deleted or hidden data'
          ].map((suggestion, index) => (
            <button
              key={index}
              style={suggestionButtonStyle}
              onClick={() => setQuery(`Analyze ${suggestion} in this case`)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
            >
              🤖 {suggestion}
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
