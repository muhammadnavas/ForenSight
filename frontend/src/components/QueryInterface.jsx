import { useState } from 'react';
import { useFiles } from './Dashboard';

const QueryInterface = () => {
  const { uploadedFiles, processedFiles } = useFiles();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const availableFiles = processedFiles.length;
  const totalDataSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#1e293b',
    minHeight: '100vh',
    width: '100%',
    color: 'white'
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
    backgroundColor: '#334155',
    borderRadius: '8px',
    fontSize: '14px'
  };

  const searchContainerStyle = {
    backgroundColor: '#334155',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid #475569'
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#1e293b',
    border: '2px solid #475569',
    borderRadius: '8px',
    padding: '16px 20px',
    color: 'white',
    fontSize: '16px',
    outline: 'none',
    marginBottom: '16px'
  };

  const buttonStyle = {
    backgroundColor: '#1e40af',
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
    backgroundColor: '#475569',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const resultsStyle = {
    backgroundColor: '#334155',
    borderRadius: '12px',
    border: '1px solid #475569',
    overflow: 'hidden'
  };

  const resultItemStyle = {
    padding: '20px',
    borderBottom: '1px solid #475569'
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    if (processedFiles.length === 0) {
      alert('No processed files available for search. Please upload and process UFDR files first.');
      return;
    }

    setIsSearching(true);
    
    // Add to search history
    if (!searchHistory.includes(query)) {
      setSearchHistory(prev => [query, ...prev.slice(0, 9)]);
    }

    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/search', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ query, caseId: activeCase.id })
      // });
      // const results = await response.json();
      // setSearchResults(results);
      
      // For now, show empty results
      setSearchResults([]);
      setIsSearching(false);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setIsSearching(false);
    }
  };



  const renderSearchResult = (result, index) => {
    const typeColors = {
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
              {result.type}
            </span>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              {result.title}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              backgroundColor: result.relevance > 90 ? '#ef4444' : result.relevance > 70 ? '#f59e0b' : '#6b7280',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {result.relevance}% match
            </span>
            <span style={{ color: '#64748b', fontSize: '12px' }}>
              {result.timestamp}
            </span>
          </div>
        </div>
        <p style={{ color: '#d1d5db', marginBottom: '12px', lineHeight: '1.5' }}>
          {result.content}
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
          {Object.entries(result.metadata).map(([key, value]) => (
            <span key={key}>
              <strong>{key}:</strong> {value}
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>🔍 Query Interface</h1>
        <p style={subtitleStyle}>
          Use natural language to search and analyze evidence data
        </p>
        <div style={statusStyle}>
          <div style={statusItemStyle}>
            <span>📁</span>
            <span>{uploadedFiles.length} Files Uploaded</span>
          </div>
          <div style={statusItemStyle}>
            <span>⚡</span>
            <span>{processedFiles.length} Files Processed</span>
          </div>
          <div style={statusItemStyle}>
            <span>💾</span>
            <span>{Math.round(totalDataSize / (1024 * 1024))} MB Total Data</span>
          </div>
          <div style={{
            ...statusItemStyle,
            backgroundColor: processedFiles.length > 0 ? '#059669' : '#dc2626'
          }}>
            <span>{processedFiles.length > 0 ? '✅' : '❌'}</span>
            <span>{processedFiles.length > 0 ? 'Ready for Search' : 'No Data Available'}</span>
          </div>
        </div>
      </div>

      {/* Search Interface */}
      <div style={searchContainerStyle}>
        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
          Enter your investigation query:
        </label>
        <input
          style={inputStyle}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter your investigation query in natural language..."
        />
        <button 
          style={buttonStyle}
          onClick={handleSearch}
          disabled={isSearching}
          onMouseEnter={(e) => !isSearching && (e.target.style.backgroundColor = '#1d4ed8')}
          onMouseLeave={(e) => !isSearching && (e.target.style.backgroundColor = '#1e40af')}
        >
          {isSearching ? '🔄' : '🔍'}
          {isSearching ? 'Searching...' : 'Search Evidence'}
        </button>

        {/* Query Suggestions */}
        <div style={suggestionsStyle}>
          <span style={{ fontSize: '14px', color: '#64748b', marginRight: '8px' }}>Quick searches:</span>
          {[
            'crypto addresses',
            'foreign contacts',
            'suspicious keywords',
            'timeline March 16',
            'encrypted files'
          ].map((suggestion, index) => (
            <button
              key={index}
              style={suggestionButtonStyle}
              onClick={() => setQuery(`Show me all ${suggestion}`)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#64748b'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#475569'}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Search History */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Searches</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {searchHistory.slice(0, 5).map((historyItem, index) => (
            <button
              key={index}
              style={{
                backgroundColor: '#334155',
                color: 'white',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '12px 16px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'background-color 0.2s ease'
              }}
              onClick={() => setQuery(historyItem)}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#334155'}
            >
              📝 {historyItem}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Search Results ({searchResults.length} found)
          </h3>
          <div style={resultsStyle}>
            {searchResults.map(renderSearchResult)}
          </div>
        </div>
      )}

      {/* No Results */}
      {!isSearching && searchResults.length === 0 && query && (
        <div style={{
          backgroundColor: '#334155',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #475569'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No results found</h3>
          <p style={{ color: '#64748b' }}>
            Try different keywords or check the search suggestions above.
          </p>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div style={{
          backgroundColor: '#334155',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          border: '1px solid #475569'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>Analyzing Evidence...</h3>
          <p style={{ color: '#64748b' }}>
            Our AI is searching through communications, files, and metadata.
          </p>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;