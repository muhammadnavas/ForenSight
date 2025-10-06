import { useEffect, useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';

const DatabaseSearch = () => {
  const { selectedCase, selectedFiles, getSelectedFileObjects } = useCaseContext();
  const { caseData, hasData, statistics } = useCaseData();
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'suspects', 'victims', 'evidence', 'locations', 'financial'
  const [filterCriteria, setFilterCriteria] = useState({
    dateRange: 'all', // 'all', '7d', '30d', '90d', '1y'
    riskLevel: 'all', // 'all', 'low', 'medium', 'high', 'critical'
    category: 'all', // 'all', 'person', 'location', 'digital', 'financial', 'physical'
    status: 'all' // 'all', 'active', 'inactive', 'pending', 'resolved'
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  // Advanced search options
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    phoneNumber: '',
    emailAddress: '',
    ipAddress: '',
    location: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    deviceId: '',
    keywords: []
  });

  // Search function
  const performSearch = async () => {
    if (!hasData || !caseData) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const results = [];
      const query = searchQuery.toLowerCase().trim();

      // Search through different data types
      if (searchType === 'all' || searchType === 'suspects') {
        if (caseData.suspects) {
          caseData.suspects.forEach(suspect => {
            if (matchesSearchCriteria(suspect, query, 'suspect')) {
              results.push({
                ...suspect,
                type: 'suspect',
                category: 'person',
                icon: '👤',
                color: '#dc2626'
              });
            }
          });
        }
      }

      if (searchType === 'all' || searchType === 'victims') {
        if (caseData.victims) {
          caseData.victims.forEach(victim => {
            if (matchesSearchCriteria(victim, query, 'victim')) {
              results.push({
                ...victim,
                type: 'victim',
                category: 'person',
                icon: '🎯',
                color: '#f59e0b'
              });
            }
          });
        }
      }

      if (searchType === 'all' || searchType === 'evidence') {
        if (caseData.evidence) {
          caseData.evidence.forEach(evidence => {
            if (matchesSearchCriteria(evidence, query, 'evidence')) {
              results.push({
                ...evidence,
                type: 'evidence',
                category: evidence.type === 'digital' ? 'digital' : 'physical',
                icon: evidence.type === 'digital' ? '💾' : '📄',
                color: '#0ea5e9'
              });
            }
          });
        }
      }

      if (searchType === 'all' || searchType === 'locations') {
        // Search through geographic data
        const geoData = caseData.geographic || {};
        Object.values(geoData).forEach(location => {
          if (matchesSearchCriteria(location, query, 'location')) {
            results.push({
              ...location,
              type: 'location',
              category: 'location',
              icon: '📍',
              color: '#10b981'
            });
          }
        });
      }

      if (searchType === 'all' || searchType === 'financial') {
        if (caseData.financial) {
          caseData.financial.transactions?.forEach(transaction => {
            if (matchesSearchCriteria(transaction, query, 'financial')) {
              results.push({
                ...transaction,
                type: 'financial',
                category: 'financial',
                icon: '💰',
                color: '#8b5cf6'
              });
            }
          });

          caseData.financial.accounts?.forEach(account => {
            if (matchesSearchCriteria(account, query, 'account')) {
              results.push({
                ...account,
                type: 'account',
                category: 'financial',
                icon: '🏦',
                color: '#8b5cf6'
              });
            }
          });
        }
      }

      // Apply filters
      const filteredResults = applyFilters(results);
      setSearchResults(filteredResults);

      // Add to search history
      if (query && !searchHistory.includes(query)) {
        setSearchHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
      }

    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if item matches search criteria
  const matchesSearchCriteria = (item, query, itemType) => {
    if (!query) return true;

    const searchableFields = [
      item.name,
      item.label,
      item.id,
      item.description,
      item.email,
      item.phone,
      item.address,
      item.type,
      item.category,
      item.status,
      item.location,
      item.deviceId,
      item.ipAddress,
      item.accountNumber,
      item.walletAddress,
      JSON.stringify(item.metadata || {}),
      JSON.stringify(item.tags || [])
    ];

    // Advanced filters matching
    if (advancedFilters.phoneNumber && item.phone && !item.phone.includes(advancedFilters.phoneNumber)) {
      return false;
    }
    if (advancedFilters.emailAddress && item.email && !item.email.toLowerCase().includes(advancedFilters.emailAddress.toLowerCase())) {
      return false;
    }
    if (advancedFilters.ipAddress && item.ipAddress && !item.ipAddress.includes(advancedFilters.ipAddress)) {
      return false;
    }
    if (advancedFilters.location && item.location && !item.location.toLowerCase().includes(advancedFilters.location.toLowerCase())) {
      return false;
    }

    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(query)
    );
  };

  // Apply filters to results
  const applyFilters = (results) => {
    return results.filter(item => {
      // Risk level filter
      if (filterCriteria.riskLevel !== 'all' && item.risk !== filterCriteria.riskLevel) {
        return false;
      }

      // Category filter
      if (filterCriteria.category !== 'all' && item.category !== filterCriteria.category) {
        return false;
      }

      // Status filter
      if (filterCriteria.status !== 'all' && item.status !== filterCriteria.status) {
        return false;
      }

      // Date range filter
      if (filterCriteria.dateRange !== 'all' && item.timestamp) {
        const itemDate = new Date(item.timestamp);
        const now = new Date();
        const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
        
        switch (filterCriteria.dateRange) {
          case '7d':
            if (daysDiff > 7) return false;
            break;
          case '30d':
            if (daysDiff > 30) return false;
            break;
          case '90d':
            if (daysDiff > 90) return false;
            break;
          case '1y':
            if (daysDiff > 365) return false;
            break;
        }
      }

      return true;
    });
  };

  // Perform search when query or filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, filterCriteria, advancedFilters, hasData, caseData]);

  // Render search result item
  const renderSearchResult = (item, index) => (
    <div
      key={`${item.type}-${item.id || index}`}
      style={{
        backgroundColor: selectedItem?.id === item.id ? '#1e40af' : '#1e293b',
        border: '1px solid #475569',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => setSelectedItem(item)}
      onMouseEnter={(e) => {
        if (selectedItem?.id !== item.id) {
          e.target.style.backgroundColor = '#334155';
        }
      }}
      onMouseLeave={(e) => {
        if (selectedItem?.id !== item.id) {
          e.target.style.backgroundColor = '#1e293b';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{item.icon}</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: 'white' }}>
            {item.name || item.label || item.id || 'Unknown'}
          </h4>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
            {item.type} • {item.category}
            {item.risk && <span style={{ color: item.risk === 'high' ? '#ef4444' : item.risk === 'medium' ? '#f59e0b' : '#10b981' }}> • {item.risk} risk</span>}
          </p>
        </div>
        <div style={{
          backgroundColor: item.color,
          width: '4px',
          height: '40px',
          borderRadius: '2px'
        }} />
      </div>
      
      {item.description && (
        <p style={{ fontSize: '14px', color: '#94a3b8', margin: '8px 0 0 0', lineHeight: '1.4' }}>
          {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
        </p>
      )}
      
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
        {item.phone && <span>📞 {item.phone}</span>}
        {item.email && <span>✉️ {item.email}</span>}
        {item.location && <span>📍 {item.location}</span>}
        {item.timestamp && <span>🕒 {new Date(item.timestamp).toLocaleDateString()}</span>}
      </div>
    </div>
  );

  // Render detailed view of selected item
  const renderItemDetails = () => {
    if (!selectedItem) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>Select a search result to view details</p>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontSize: '24px' }}>{selectedItem.icon}</span>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: 'white' }}>
              {selectedItem.name || selectedItem.label || selectedItem.id}
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '4px 0 0 0' }}>
              {selectedItem.type} • {selectedItem.category}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.entries(selectedItem).map(([key, value]) => {
            if (['icon', 'color', 'type', 'category'].includes(key) || !value) return null;
            
            return (
              <div key={key} style={{ display: 'flex', gap: '12px' }}>
                <span style={{ 
                  minWidth: '100px', 
                  fontSize: '12px', 
                  color: '#64748b', 
                  textTransform: 'capitalize',
                  fontWeight: '500'
                }}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}:
                </span>
                <span style={{ fontSize: '14px', color: 'white', wordBreak: 'break-word' }}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!hasData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#0f172a',
        color: '#64748b',
        borderRadius: '8px',
        border: '2px dashed #475569',
        margin: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Data Available</h3>
        <p style={{ textAlign: 'center', maxWidth: '300px' }}>
          Upload UFDR files to start searching through case data, evidence, and forensic information.
        </p>
      </div>
    );
  }

  // Show file selection prompt if no case or files selected
  if (!selectedCase) {
    return (
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#0f172a',
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px',
          backgroundColor: '#334155',
          borderRadius: '20px',
          border: '1px solid #475569',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>🗂️</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#e2e8f0', fontWeight: '700' }}>
            No Case Selected
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.5' }}>
            Please select a case from the header to start database search
          </p>
        </div>
      </div>
    );
  }

  if (selectedFiles.length === 0) {
    return (
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 120px)',
        backgroundColor: '#0f172a',
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px',
          backgroundColor: '#334155',
          borderRadius: '20px',
          border: '1px solid #475569',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>🔍</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#e2e8f0', fontWeight: '700' }}>
            No Files Selected
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
            Please select files from the header dropdown to search their database contents
          </p>
          <div style={{ 
            padding: '12px 16px',
            backgroundColor: '#1e40af',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'white'
          }}>
            💡 Tip: Click the Files button in the header to select files for search
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      backgroundColor: '#0f172a',
      color: 'white',
      fontFamily: 'Inter, system-ui, sans-serif',
      overflow: 'hidden',
      width: '100%',
      maxWidth: '100vw'
    }}>
      {/* Search Panel */}
      <div style={{
        width: '400px',
        minWidth: '400px',
        maxWidth: '400px',
        backgroundColor: '#1e293b',
        borderRight: '1px solid #475569',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Search Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #475569' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
            🔍 Database Search
          </h2>
          
          {/* Search Input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases, suspects, evidence..."
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                backgroundColor: '#334155',
                border: '1px solid #475569',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748b'
            }}>
              🔍
            </div>
          </div>

          {/* Search Type Selector */}
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              backgroundColor: '#334155',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              marginBottom: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="all">All Data Types</option>
            <option value="suspects">Suspects</option>
            <option value="victims">Victims</option>
            <option value="evidence">Evidence</option>
            <option value="locations">Locations</option>
            <option value="financial">Financial</option>
          </select>

          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { key: 'riskLevel', options: [
                { value: 'all', label: 'All Risk' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]},
              { key: 'dateRange', options: [
                { value: 'all', label: 'All Time' },
                { value: '7d', label: '7 Days' },
                { value: '30d', label: '30 Days' },
                { value: '90d', label: '90 Days' }
              ]}
            ].map(filter => (
              <select
                key={filter.key}
                value={filterCriteria[filter.key]}
                onChange={(e) => setFilterCriteria(prev => ({
                  ...prev,
                  [filter.key]: e.target.value
                }))}
                style={{
                  padding: '6px 8px',
                  backgroundColor: '#475569',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '11px',
                  flex: 1,
                  minWidth: '80px'
                }}
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ))}
          </div>

          {/* Advanced Search Toggle */}
          <button
            onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: showAdvancedSearch ? '#1e40af' : 'transparent',
              border: '1px solid #475569',
              borderRadius: '6px',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            {showAdvancedSearch ? '▼' : '▶'} Advanced Search
          </button>

          {/* Advanced Search Panel */}
          {showAdvancedSearch && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: '#334155',
              borderRadius: '8px',
              border: '1px solid #475569'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { key: 'phoneNumber', label: 'Phone Number', placeholder: '+1-555-...' },
                  { key: 'emailAddress', label: 'Email Address', placeholder: 'user@domain.com' },
                  { key: 'ipAddress', label: 'IP Address', placeholder: '192.168.1.1' },
                  { key: 'location', label: 'Location', placeholder: 'City, State' },
                  { key: 'deviceId', label: 'Device ID', placeholder: 'ABC123...' }
                ].map(field => (
                  <div key={field.key}>
                    <label style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px', display: 'block' }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      value={advancedFilters[field.key]}
                      onChange={(e) => setAdvancedFilters(prev => ({
                        ...prev,
                        [field.key]: e.target.value
                      }))}
                      placeholder={field.placeholder}
                      style={{
                        width: '100%',
                        padding: '8px',
                        backgroundColor: '#475569',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
              Search Results ({searchResults.length})
            </h4>
            {isLoading && (
              <div style={{ fontSize: '12px', color: '#64748b' }}>Searching...</div>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                {searchQuery ? '❌' : '💡'}
              </div>
              <p style={{ fontSize: '14px' }}>
                {searchQuery ? 'No results found for your search' : 'Enter a search term to begin'}
              </p>
            </div>
          ) : (
            <div>
              {searchResults.map((item, index) => renderSearchResult(item, index))}
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div style={{
        flex: 1,
        backgroundColor: '#0f172a',
        overflow: 'auto',
        minWidth: 0
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #475569' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
            📋 Item Details
          </h3>
        </div>
        {renderItemDetails()}
      </div>
    </div>
  );
};

export default DatabaseSearch;
