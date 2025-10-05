import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useCaseData } from '../contexts/CaseDataContext';
import { useFiles } from './Dashboard';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different location types
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${symbol}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

const NetworkAnalysis = () => {
  const { uploadedFiles, processedFiles } = useFiles();
  const { caseData, hasData, getNetworkData, getGeographicData, statistics } = useCaseData();
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
          nodes: getLocationNodes(),
          connections: getLocationConnections()
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

  // Helper functions for location data
  const getLocationNodes = () => {
    if (!hasData || !caseData) return [];
    
    const geoData = getGeographicData();
    const locationNodes = [];
    
    // Add suspect locations
    geoData.suspectLocations.forEach((location, index) => {
      locationNodes.push({
        id: `suspect-loc-${index}`,
        label: location.address || 'Unknown Location',
        type: 'suspect-location',
        category: 'location',
        lat: location.lat,
        lng: location.lng,
        x: 100 + (location.lng + 180) * 3, // Convert to screen coordinates
        y: 100 + (90 - location.lat) * 3,
        suspectId: location.suspectId,
        confidence: location.confidence,
        riskLevel: 'HIGH',
        details: location
      });
    });
    
    // Add crime locations
    geoData.crimeLocations.forEach((location, index) => {
      locationNodes.push({
        id: `crime-loc-${index}`,
        label: location.address || 'Crime Scene',
        type: 'crime-location',
        category: 'location',
        lat: location.lat,
        lng: location.lng,
        x: 100 + (location.lng + 180) * 3,
        y: 100 + (90 - location.lat) * 3,
        criminalActivity: location.type,
        financialImpact: location.financialImpact,
        riskLevel: 'CRITICAL',
        details: location
      });
    });
    
    // Add infrastructure locations
    geoData.infrastructureLocations.forEach((location, index) => {
      locationNodes.push({
        id: `infra-loc-${index}`,
        label: location.description || 'Infrastructure',
        type: 'infrastructure-location',
        category: 'location',
        lat: location.lat,
        lng: location.lng,
        x: 100 + (location.lng + 180) * 3,
        y: 100 + (90 - location.lat) * 3,
        status: location.status,
        riskLevel: 'MEDIUM',
        details: location
      });
    });
    
    return locationNodes;
  };
  
  const getLocationConnections = () => {
    if (!hasData || !caseData) return [];
    
    const connections = [];
    const locationNodes = getLocationNodes();
    
    // Connect suspect locations to crime locations if they're related
    locationNodes.forEach(fromNode => {
      if (fromNode.type === 'suspect-location') {
        locationNodes.forEach(toNode => {
          if (toNode.type === 'crime-location' && fromNode.suspectId) {
            // Check if this suspect is related to this crime
            const suspectInEvidence = toNode.details.evidenceIds?.some(evidenceId => 
              caseData.evidence?.some(evidence => 
                evidence.id === evidenceId && evidence.description?.includes(fromNode.suspectId)
              )
            );
            
            if (suspectInEvidence) {
              connections.push({
                id: `${fromNode.id}-${toNode.id}`,
                from: fromNode.id,
                to: toNode.id,
                type: 'suspect-crime-link',
                strength: 8,
                label: 'Suspected involvement'
              });
            }
          }
        });
      }
    });
    
    return connections;
  };
  
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
    
    // Safety check - ensure data exists and has required properties
    if (!data || !data.nodes || !data.connections) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#64748b' 
        }}>
          No network data available for {analysisMode} analysis
        </div>
      );
    }
    
    // For locations mode, render a map-like view
    if (analysisMode === 'locations') {
      return renderLocationMap(data);
    }
    
    return (
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
        {/* Render connections */}
        {data.connections.map((connection, index) => {
          const fromNode = data.nodes.find(n => n.id === connection.from);
          const toNode = data.nodes.find(n => n.id === connection.to);
          
          // Skip rendering if either node is not found
          if (!fromNode || !toNode) {
            return null;
          }
          
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
        {data.nodes.map((node, index) => {
          // Skip rendering if node doesn't have position data
          if (!node || typeof node.x === 'undefined' || typeof node.y === 'undefined') {
            return null;
          }
          
          return (
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
              {(node.label || node.name || 'Unknown').length > 15 ? (node.label || node.name || 'Unknown').substring(0, 15) + '...' : (node.label || node.name || 'Unknown')}
            </text>
          </g>
        );
        })}
      </svg>
    );
  };

  const renderLocationMap = (data) => {
    // Convert geographic data to lat/lng coordinates
    const locations = data.nodes.map(node => {
      let lat = 40.7128; // Default to NYC
      let lng = -74.0060;
      
      // Extract coordinates from node data
      if (node.latitude && node.longitude) {
        lat = parseFloat(node.latitude);
        lng = parseFloat(node.longitude);
      } else if (node.coordinates) {
        const coords = node.coordinates.split(',');
        if (coords.length === 2) {
          lat = parseFloat(coords[0].trim());
          lng = parseFloat(coords[1].trim());
        }
      } else if (node.location && typeof node.location === 'object') {
        lat = node.location.lat || node.location.latitude || lat;
        lng = node.location.lng || node.location.longitude || lng;
      }
      
      return {
        ...node,
        lat,
        lng,
        icon: getLocationIcon(node)
      };
    });

    // Get center point for map
    const centerLat = locations.length > 0 
      ? locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length 
      : 40.7128;
    const centerLng = locations.length > 0 
      ? locations.reduce((sum, loc) => sum + loc.lng, 0) / locations.length 
      : -74.0060;

    // Create polylines for connections
    const connectionLines = data.connections
      .map(connection => {
        const fromNode = locations.find(n => n.id === connection.from);
        const toNode = locations.find(n => n.id === connection.to);
        
        if (fromNode && toNode) {
          return {
            positions: [[fromNode.lat, fromNode.lng], [toNode.lat, toNode.lng]],
            color: getConnectionColor(connection),
            weight: Math.max(2, connection.strength / 10),
            opacity: 0.7
          };
        }
        return null;
      })
      .filter(Boolean);

    return (
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%',
        zIndex: 1
      }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Render connection lines */}
          {connectionLines.map((line, index) => (
            <Polyline
              key={index}
              positions={line.positions}
              color={line.color}
              weight={line.weight}
              opacity={line.opacity}
            />
          ))}
          
          {/* Render location markers */}
          {locations.map((location, index) => (
            <Marker
              key={index}
              position={[location.lat, location.lng]}
              icon={location.icon}
            >
              <Popup>
                <div style={{ minWidth: '200px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                    {location.label || location.name || 'Unknown Location'}
                  </h3>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                    <strong>Type:</strong> {location.type || 'Unknown'}
                  </p>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                    <strong>Coordinates:</strong> {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                  {location.address && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                      <strong>Address:</strong> {location.address}
                    </p>
                  )}
                  {location.connections && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                      <strong>Connections:</strong> {location.connections}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Location Connections */}
        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          {data.connections.map((connection, index) => {
            const fromNode = data.nodes.find(n => n.id === connection.from);
            const toNode = data.nodes.find(n => n.id === connection.to);
            
            if (!fromNode || !toNode) return null;
            
            return (
              <g key={index}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  strokeOpacity={0.7}
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 10}
                  fill="#ef4444"
                  fontSize="11"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {connection.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Location Markers */}
        {data.nodes.map((node, index) => {
          const getLocationIcon = (type) => {
            switch (type) {
              case 'suspect-location': return '👤';
              case 'crime-location': return '⚠️';
              case 'infrastructure-location': return '🏢';
              default: return '📍';
            }
          };

          const getLocationColor = (type) => {
            switch (type) {
              case 'suspect-location': return '#dc2626';
              case 'crime-location': return '#f59e0b';
              case 'infrastructure-location': return '#0ea5e9';
              default: return '#64748b';
            }
          };

          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                left: node.x - 30,
                top: node.y - 30,
                width: '60px',
                height: '60px',
                backgroundColor: getLocationColor(node.type),
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '20px',
                border: selectedNode?.id === node.id ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                transform: selectedNode?.id === node.id ? 'scale(1.1)' : 'scale(1)',
                zIndex: selectedNode?.id === node.id ? 10 : 1
              }}
              onClick={() => setSelectedNode(node)}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.1)';
                e.target.style.zIndex = '10';
              }}
              onMouseLeave={(e) => {
                if (selectedNode?.id !== node.id) {
                  e.target.style.transform = 'scale(1)';
                  e.target.style.zIndex = '1';
                }
              }}
            >
              {getLocationIcon(node.type)}
            </div>
          );
        })}

        {/* Location Labels */}
        {data.nodes.map((node, index) => (
          <div
            key={`label-${index}`}
            style={{
              position: 'absolute',
              left: node.x - 50,
              top: node.y + 35,
              width: '100px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '4px 8px',
              borderRadius: '4px',
              pointerEvents: 'none',
              zIndex: 5
            }}
          >
            {node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
          </div>
        ))}

        {/* Map Legend */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: '#334155',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #475569',
          minWidth: '200px'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Location Types</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <span>Suspect Locations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>Crime Scenes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🏢</span>
              <span>Infrastructure</span>
            </div>
          </div>
        </div>
      </div>
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
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedNode.label || selectedNode.name || 'Unknown'}</h3>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Type:</span>
            <span style={{ textTransform: 'capitalize' }}>{selectedNode.type?.replace('-', ' ')}</span>
          </div>
          
          {/* Location-specific details */}
          {analysisMode === 'locations' && (
            <>
              {selectedNode.lat && selectedNode.lng && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Coordinates:</span>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {selectedNode.lat.toFixed(4)}, {selectedNode.lng.toFixed(4)}
                  </span>
                </div>
              )}
              
              {selectedNode.confidence && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Confidence:</span>
                  <span style={{
                    backgroundColor: selectedNode.confidence === 'HIGH' ? '#10b981' : 
                                  selectedNode.confidence === 'MEDIUM' ? '#f59e0b' : '#6b7280',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    {selectedNode.confidence}
                  </span>
                </div>
              )}
              
              {selectedNode.financialImpact && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Financial Impact:</span>
                  <span style={{ color: '#ef4444', fontWeight: '600' }}>
                    ${selectedNode.financialImpact.toLocaleString()}
                  </span>
                </div>
              )}
              
              {selectedNode.criminalActivity && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Activity:</span>
                  <span>{selectedNode.criminalActivity}</span>
                </div>
              )}
              
              {selectedNode.status && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Status:</span>
                  <span style={{
                    backgroundColor: selectedNode.status === 'SECURED' ? '#10b981' : '#f59e0b',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    {selectedNode.status}
                  </span>
                </div>
              )}
            </>
          )}
          
          {/* Non-location details */}
          {analysisMode !== 'locations' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Connections:</span>
              <span>{selectedNode.connections || 0}</span>
            </div>
          )}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#64748b' }}>Risk Level:</span>
            <span style={{
              backgroundColor: selectedNode.riskLevel === 'CRITICAL' ? '#ef4444' : 
                            selectedNode.riskLevel === 'HIGH' ? '#f59e0b' :
                            selectedNode.riskLevel === 'MEDIUM' ? '#10b981' : '#6b7280',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '8px',
              fontSize: '12px',
              textTransform: 'uppercase'
            }}>
              {selectedNode.riskLevel || selectedNode.risk || 'UNKNOWN'}
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
                      <span style={{ fontSize: '14px' }}>{otherNode.label || otherNode.name || 'Unknown'}</span>
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