import { useEffect, useState } from 'react';
import { useCaseData } from '../contexts/CaseDataContext';

const DatabaseSearch = () => {
  const { caseData, hasData, getNetworkData, statistics } = useCaseData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // 'all', 'suspects', 'evidence', 'locations', 'communications'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: { start: '', end: '' },
    riskLevel: 'all',
    entityType: 'all',
    location: '',
    tags: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Perform search when query or filters change
  useEffect(() => {
    if (searchQuery.trim() || Object.values(advancedFilters).some(v => v && v !== 'all' && (Array.isArray(v) ? v.length > 0 : true))) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchType, advancedFilters, hasData]);

  const performSearch = async () => {
    if (!hasData || !caseData) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const results = [];
      const query = searchQuery.toLowerCase().trim();

      // Search suspects
      if (searchType === 'all' || searchType === 'suspects') {
        caseData.suspects?.forEach(suspect => {
          if (matchesSearchCriteria(suspect, query, 'suspect')) {
            results.push({
              id: suspect.id,
              type: 'suspect',
              title: suspect.name,
              subtitle: suspect.role || 'Suspect',
              content: suspect.description || '',
              metadata: {
                riskLevel: suspect.riskLevel || 'medium',
                location: suspect.location,
                phone: suspect.phone,
                email: suspect.email
              },
              relevanceScore: calculateRelevance(suspect, query)
            });
          }
        });
      }

      // Search victims
      if (searchType === 'all' || searchType === 'victims') {
        caseData.victims?.forEach(victim => {
          if (matchesSearchCriteria(victim, query, 'victim')) {
            results.push({
              id: victim.id,
              type: 'victim',
              title: victim.name,
              subtitle: 'Victim',
              content: victim.description || '',
              metadata: {
                riskLevel: 'low',
                location: victim.location,
                age: victim.age
              },
              relevanceScore: calculateRelevance(victim, query)
            });
          }
        });
      }

      // Search evidence
      if (searchType === 'all' || searchType === 'evidence') {
        caseData.evidence?.forEach(evidence => {
          if (matchesSearchCriteria(evidence, query, 'evidence')) {
            results.push({
              id: evidence.id,
              type: 'evidence',
              title: evidence.name || evidence.type,
              subtitle: evidence.category || 'Evidence',
              content: evidence.description || '',
              metadata: {
                riskLevel: evidence.importance || 'medium',
                location: evidence.location,
                timestamp: evidence.timestamp,
                fileType: evidence.fileType
              },
              relevanceScore: calculateRelevance(evidence, query)
            });
          }
        });
      }

      // Search communications
      if (searchType === 'all' || searchType === 'communications') {
        caseData.communications?.forEach(comm => {
          if (matchesSearchCriteria(comm, query, 'communication')) {
            results.push({
              id: comm.id,
              type: 'communication',
              title: `${comm.type} - ${comm.from} → ${comm.to}`,
              subtitle: 'Communication',
              content: comm.content || comm.subject || '',
              metadata: {
                riskLevel: comm.flagged ? 'high' : 'low',
                timestamp: comm.timestamp,
                type: comm.type,
                encrypted: comm.encrypted
              },
              relevanceScore: calculateRelevance(comm, query)
            });
          }
        });
      }

      // Search locations
      if (searchType === 'all' || searchType === 'locations') {
        const geoData = caseData.geographic;
        if (geoData) {
          Object.entries(geoData).forEach(([key, location]) => {
            if (matchesSearchCriteria(location, query, 'location')) {
              results.push({
                id: key,
                type: 'location',
                title: location.name || location.address,
                subtitle: location.type || 'Location',
                content: location.description || '',
                metadata: {
                  riskLevel: location.riskLevel || 'low',
                  coordinates: location.coordinates,
                  significance: location.significance
                },
                relevanceScore: calculateRelevance(location, query)
              });
            }
          });
        }
      }

      // Apply advanced filters
      const filteredResults = applyAdvancedFilters(results);

      // Sort by relevance score
      filteredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const matchesSearchCriteria = (item, query, type) => {
    if (!query) return true;

    const searchableFields = [
      item.name, item.title, item.description, item.content,
      item.address, item.location, item.phone, item.email,
      item.type, item.category, item.role, item.subject
    ];

    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(query)
    );
  };

  const calculateRelevance = (item, query) => {
    if (!query) return 1;

    let score = 0;
    const searchableText = [
      item.name, item.title, item.description, item.content,
      item.address, item.location, item.role, item.subject
    ].filter(Boolean).join(' ').toLowerCase();

    // Exact match in title/name gets highest score
    if (item.name?.toLowerCase().includes(query) || item.title?.toLowerCase().includes(query)) {
      score += 10;
    }

    // Content matches
    const matches = (searchableText.match(new RegExp(query, 'g')) || []).length;
    score += matches * 2;

    // Length penalty (shorter matches are more relevant)
    score -= Math.log(searchableText.length + 1);

    return Math.max(score, 0);
  };

  const applyAdvancedFilters = (results) => {
    return results.filter(result => {
      // Risk level filter
      if (advancedFilters.riskLevel !== 'all' && 
          result.metadata.riskLevel !== advancedFilters.riskLevel) {
        return false;
      }

      // Entity type filter
      if (advancedFilters.entityType !== 'all' && 
          result.type !== advancedFilters.entityType) {
        return false;
      }

      // Location filter
      if (advancedFilters.location && 
          !result.metadata.location?.toLowerCase().includes(advancedFilters.location.toLowerCase())) {
        return false;
      }

      // Date range filter
      if (advancedFilters.dateRange.start || advancedFilters.dateRange.end) {
        const itemDate = new Date(result.metadata.timestamp);
        if (advancedFilters.dateRange.start && itemDate < new Date(advancedFilters.dateRange.start)) {
          return false;
        }
        if (advancedFilters.dateRange.end && itemDate > new Date(advancedFilters.dateRange.end)) {
          return false;
        }
      }

      return true;
    });
  };

  const getResultIcon = (type) => {
    switch (type) {
      case 'suspect': return '👤';
      case 'victim': return '🤕';
      case 'evidence': return '📋';
      case 'communication': return '💬';
      case 'location': return '📍';
      default: return '📄';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  if (!hasData) {
    return (
      <div style={{ padding: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
          🔍 Database Search
        </h1>
        <div style={{
          backgroundColor: '#1e293b',
          border: '2px dashed #475569',
          borderRadius: '12px',
          padding: '48px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📂</div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>No Data Available</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            Upload UFDR files to enable database search functionality
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
        🔍 Database Search & Analytics
      </h1>

      {/* Search Interface */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid #334155'
      }}>
        {/* Main Search Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search suspects, evidence, communications, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px'
              }}
            />
            <button
              onClick={performSearch}
              disabled={isSearching}
              style={{
                padding: '12px 24px',
                backgroundColor: '#1d4ed8',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSearching ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                opacity: isSearching ? 0.6 : 1
              }}
            >
              {isSearching ? '🔄 Searching...' : '🔍 Search'}
            </button>
          </div>

          {/* Search Type Filter */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Results', icon: '🔍' },
              { id: 'suspects', label: 'Suspects', icon: '👤' },
              { id: 'victims', label: 'Victims', icon: '🤕' },
              { id: 'evidence', label: 'Evidence', icon: '📋' },
              { id: 'communications', label: 'Communications', icon: '💬' },
              { id: 'locations', label: 'Locations', icon: '📍' }
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: searchType === type.id ? '#1d4ed8' : '#334155',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {type.icon} {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#64748b',
            border: '1px solid #334155',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {showAdvanced ? '▼' : '▶'} Advanced Filters
        </button>

        {/* Advanced Filters Panel */}
        {showAdvanced && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            backgroundColor: '#0f172a',
            borderRadius: '8px',
            border: '1px solid #334155'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {/* Risk Level Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8' }}>
                  Risk Level
                </label>
                <select
                  value={advancedFilters.riskLevel}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                >
                  <option value="all">All Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8' }}>
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={advancedFilters.location}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, location: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>

              {/* Date Range */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8' }}>
                  Date From
                </label>
                <input
                  type="date"
                  value={advancedFilters.dateRange.start}
                  onChange={(e) => setAdvancedFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#94a3b8' }}>
                  Date To
                </label>
                <input
                  type="date"
                  value={advancedFilters.dateRange.end}
                  onChange={(e) => setAdvancedFilters(prev => ({ 
                    ...prev, 
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: 'white'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Results List */}
        <div>
          {searchResults.length > 0 && (
            <div style={{ marginBottom: '16px', color: '#94a3b8', fontSize: '14px' }}>
              Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {searchResults.map((result, index) => (
              <div
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => setSelectedResult(result)}
                style={{
                  backgroundColor: selectedResult?.id === result.id ? '#1e40af' : '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>{getResultIcon(result.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                        {result.title}
                      </h3>
                      <div style={{
                        padding: '2px 8px',
                        backgroundColor: getRiskColor(result.metadata.riskLevel),
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {result.metadata.riskLevel}
                      </div>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
                      {result.subtitle}
                    </div>
                    <p style={{ 
                      color: '#cbd5e1', 
                      fontSize: '14px', 
                      margin: 0,
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {result.content || 'No additional details available'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {searchResults.length === 0 && (searchQuery || Object.values(advancedFilters).some(v => v && v !== 'all')) && !isSearching && (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                color: '#64748b'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Results Found</h3>
                <p>Try adjusting your search terms or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Result Details Panel */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #334155',
          height: 'fit-content',
          position: 'sticky',
          top: '24px'
        }}>
          {selectedResult ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '32px' }}>{getResultIcon(selectedResult.type)}</div>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                    {selectedResult.title}
                  </h2>
                  <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                    {selectedResult.subtitle}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '8px 12px',
                backgroundColor: getRiskColor(selectedResult.metadata.riskLevel),
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '16px',
                display: 'inline-block'
              }}>
                Risk Level: {selectedResult.metadata.riskLevel}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Description</h4>
                <p style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                  {selectedResult.content || 'No detailed description available'}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Metadata</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(selectedResult.metadata).map(([key, value]) => (
                    value && (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#94a3b8', textTransform: 'capitalize' }}>
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span style={{ color: '#cbd5e1', fontWeight: '500' }}>
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Select a Result</h3>
              <p>Click on a search result to view detailed information</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Analytics */}
      {searchResults.length > 0 && (
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '24px',
          marginTop: '24px',
          border: '1px solid #334155'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
            📊 Search Analytics
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Result Type Distribution */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Result Types</h4>
              {Object.entries(
                searchResults.reduce((acc, result) => {
                  acc[result.type] = (acc[result.type] || 0) + 1;
                  return acc;
                }, {})
              ).map(([type, count]) => (
                <div key={type} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ textTransform: 'capitalize' }}>{getResultIcon(type)} {type}</span>
                  <span style={{ fontWeight: '600' }}>{count}</span>
                </div>
              ))}
            </div>

            {/* Risk Level Distribution */}
            <div>
              <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '8px' }}>Risk Levels</h4>
              {Object.entries(
                searchResults.reduce((acc, result) => {
                  const risk = result.metadata.riskLevel || 'unknown';
                  acc[risk] = (acc[risk] || 0) + 1;
                  return acc;
                }, {})
              ).map(([risk, count]) => (
                <div key={risk} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: getRiskColor(risk), textTransform: 'capitalize' }}>{risk}</span>
                  <span style={{ fontWeight: '600' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseSearch;