import { useEffect, useState } from 'react';
import { useCaseData } from '../contexts/CaseDataContext';
import { useFiles } from './Dashboard';

const NetworkAnalysis = () => {
  const { uploadedFiles, processedFiles } = useFiles();
  const { caseData, hasData, getNetworkData, statistics } = useCaseData();
  const [selectedNode, setSelectedNode] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('contacts'); // 'contacts', 'locations', 'transactions'
  const [timeRange, setTimeRange] = useState('all');

  const [networkData, setNetworkData] = useState({
    contacts: {
      nodes: [],
      connections: []
    },
    locations: {
      nodes: [],
      connections: []
    },
    transactions: {
      nodes: [],
      connections: []
    }
  });
  
  // Load network data from case data when available
  useEffect(() => {
    if (hasData && caseData) {
      const realNetworkData = getNetworkData();
      
      // Organize data by analysis mode
      const organizedData = {
        contacts: {
          nodes: realNetworkData.nodes.filter(node => 
            node.type === 'person' || node.group === 'suspect' || node.group === 'victim'
          ),
          connections: realNetworkData.edges.filter(edge => 
            edge.type === 'communication' || edge.type === 'relationship'
          )
        },
        locations: {
          nodes: realNetworkData.nodes.filter(node => 
            node.type === 'location' || node.group === 'location'
          ),
          connections: realNetworkData.edges.filter(edge => 
            edge.type === 'travel' || edge.type === 'presence'
          )
        },
        transactions: {
          nodes: realNetworkData.nodes.filter(node => 
            node.type === 'wallet' || node.type === 'account' || node.group === 'financial'
          ),
          connections: realNetworkData.edges.filter(edge => 
            edge.type === 'financial' || edge.type === 'transaction'
          )
        }
      };
      
      setNetworkData(organizedData);
    }
  }, [hasData, caseData, getNetworkData]);
  
  const hasProcessedData = processedFiles.length > 0 || hasData;
  const availableDataTypes = processedFiles.map(file => file.fileType).filter(Boolean);

  // TODO: Load network data from API
  // useEffect(() => {
  //   const loadNetworkData = async () => {
  //     try {
  //       const response = await fetch(`/api/network-analysis/${analysisMode}`);
  //       const data = await response.json();
  //       setNetworkData(prev => ({ ...prev, [analysisMode]: data }));
  //     } catch (error) {
  //       console.error('Failed to load network data:', error);
  //     }
  //   };
  //   loadNetworkData();
  // }, [analysisMode]);

  const containerStyle = {
    display: 'flex',
    height: '100vh',
    width: '100%',
    backgroundColor: '#1e293b',
    color: 'white'
  };
  
  const emptyStateStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '40px'
  };

  const canvasContainerStyle = {
    flex: 1,
    position: 'relative',
    backgroundColor: '#0f172a',
    margin: '24px',
    borderRadius: '12px',
    border: '1px solid #334155',
    overflow: 'hidden'
  };

  const sidebarStyle = {
    width: '320px',
    backgroundColor: '#334155',
    padding: '24px',
    borderLeft: '1px solid #475569',
    overflowY: 'auto'
  };

  const toolbarStyle = {
    position: 'absolute',
    top: '20px',
    left: '20px',
    display: 'flex',
    gap: '12px',
    zIndex: 10
  };

  const getNodeColor = (node) => {
    const colors = {
      'subject': '#ef4444',
      'contact': '#3b82f6',
      'unknown': '#f59e0b',
      'international': '#8b5cf6',
      'critical': '#dc2626'
    };
    return colors[node.type] || '#6b7280';
  };

  const getConnectionColor = (connection) => {
    const colors = {
      'calls': '#10b981',
      'messages': '#3b82f6',
      'encrypted': '#ef4444',
      'financial': '#f59e0b'
    };
    return colors[connection.type] || '#6b7280';
  };

  const renderNetworkGraph = () => {
    const data = networkData[analysisMode];
    
    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Render connections */}
        {data.connections.map((connection, index) => {
          const fromNode = data.nodes.find(n => n.id === connection.from);
          const toNode = data.nodes.find(n => n.id === connection.to);
          
          return (
            <g key={index}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={getConnectionColor(connection)}
                strokeWidth={Math.max(1, connection.strength / 10)}
                strokeOpacity={0.6}
              />
              {/* Connection label */}
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 5}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                {connection.strength}
              </text>
            </g>
          );
        })}
        
        {/* Render nodes */}
        {data.nodes.map((node, index) => (
          <g key={index}>
            <circle
              cx={node.x}
              cy={node.y}
              r={Math.max(20, node.connections * 3)}
              fill={getNodeColor(node)}
              stroke={selectedNode?.id === node.id ? '#ffffff' : 'transparent'}
              strokeWidth="3"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedNode(node)}
            />
            <text
              x={node.x}
              y={node.y + 35}
              fill="white"
              fontSize="12"
              textAnchor="middle"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setSelectedNode(node)}
            >
              {node.name.length > 15 ? node.name.substring(0, 15) + '...' : node.name}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderNodeDetails = () => {
    if (!selectedNode) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <p>Select a node to view details</p>
        </div>
      );
    }

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: getNodeColor(selectedNode)
          }}></div>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedNode.name}</h3>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Type:</span>
            <span style={{ textTransform: 'capitalize' }}>{selectedNode.type}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Connections:</span>
            <span>{selectedNode.connections}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Risk Level:</span>
            <span style={{
              backgroundColor: selectedNode.risk === 'critical' ? '#ef4444' : 
                            selectedNode.risk === 'high' ? '#f59e0b' :
                            selectedNode.risk === 'medium' ? '#10b981' : '#6b7280',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>
              {selectedNode.risk}
            </span>
          </div>
        </div>

        {/* Connection Details */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Connections ({selectedNode.connections})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {networkData[analysisMode].connections
              .filter(conn => conn.from === selectedNode.id || conn.to === selectedNode.id)
              .map((conn, index) => {
                const otherNodeId = conn.from === selectedNode.id ? conn.to : conn.from;
                const otherNode = networkData[analysisMode].nodes.find(n => n.id === otherNodeId);
                
                return (
                  <div key={index} style={{
                    backgroundColor: '#1e293b',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #475569'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px' }}>{otherNode.name}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          backgroundColor: getConnectionColor(conn),
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '10px',
                          textTransform: 'uppercase'
                        }}>
                          {conn.type}
                        </span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {conn.strength} interactions
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{
            backgroundColor: '#1e40af',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🔍 Deep Analysis
          </button>
          <button style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📊 Generate Report
          </button>
          <button style={{
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🌐 Expand Network
          </button>
        </div>
      </div>
    );
  };

  // Show empty state if no processed data
  if (!hasProcessedData) {
    return (
      <div style={emptyStateStyle}>
        <div>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🌐</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Network Analysis Ready
          </h2>
          <p style={{ color: '#64748b', fontSize: '16px', marginBottom: '24px', maxWidth: '400px' }}>
            {hasData ? 
              'Case data loaded successfully. Network analysis is available with real forensic data.' :
              'Upload and process UFDR files to generate network visualizations of contacts, locations, and transaction patterns.'
            }
          </p>
          {hasData && (
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#334155', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>Case: {caseData.caseName}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {statistics.totalSuspects} suspects, {statistics.networkComplexity} network elements
              </div>
            </div>
          )}
          <button 
            style={{
              backgroundColor: hasData ? '#059669' : '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
            onClick={() => hasData ? setAnalysisMode('contacts') : (window.location.hash = '#upload')}
          >
            {hasData ? '🌐 View Network' : '📤 Upload UFDR Files'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Main Canvas */}
      <div style={canvasContainerStyle}>
        {/* Toolbar */}
        <div style={toolbarStyle}>
          <div style={{ display: 'flex', backgroundColor: '#334155', borderRadius: '8px', padding: '4px' }}>
            {[
              { id: 'contacts', label: '👥 Contacts', icon: '👥' },
              { id: 'locations', label: '📍 Locations', icon: '📍' },
              { id: 'transactions', label: '💰 Finance', icon: '💰' }
            ].map(mode => (
              <button
                key={mode.id}
                style={{
                  backgroundColor: analysisMode === mode.id ? '#1e40af' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={() => setAnalysisMode(mode.id)}
              >
                {mode.icon} {mode.label.split(' ')[1]}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', backgroundColor: '#334155', borderRadius: '8px', padding: '4px' }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' }
            ].map(range => (
              <button
                key={range.id}
                style={{
                  backgroundColor: timeRange === range.id ? '#059669' : 'transparent',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onClick={() => setTimeRange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#334155',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #475569'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Legend</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
              <span>Subject</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
              <span>Known Contact</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
              <span>Unknown</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></div>
              <span>International</span>
            </div>
          </div>
        </div>

        {/* Network Graph */}
        {renderNetworkGraph()}

        {/* Stats Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: '#334155',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #475569'
        }}>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <div>
              <span style={{ color: '#64748b' }}>Nodes: </span>
              <span style={{ fontWeight: '600' }}>{networkData[analysisMode].nodes.length}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Connections: </span>
              <span style={{ fontWeight: '600' }}>{networkData[analysisMode].connections.length}</span>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>High Risk: </span>
              <span style={{ fontWeight: '600', color: '#ef4444' }}>
                {networkData[analysisMode].nodes.filter(n => n.risk === 'high' || n.risk === 'critical').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
          🌐 Network Analysis
        </h2>

        {/* Analysis Summary */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #475569'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Entities:</span>
              <span>{networkData[analysisMode].nodes.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Relationships:</span>
              <span>{networkData[analysisMode].connections.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Risk Entities:</span>
              <span style={{ color: '#ef4444' }}>
                {networkData[analysisMode].nodes.filter(n => n.risk === 'high' || n.risk === 'critical').length}
              </span>
            </div>
          </div>
        </div>

        {/* Node Details */}
        <div style={{
          backgroundColor: '#1e293b',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #475569'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            {selectedNode ? 'Node Details' : 'Select Node'}
          </h4>
          {renderNodeDetails()}
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalysis;