import L from 'leaflet';
import { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';

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
  const { selectedCase, selectedFiles, getSelectedFileObjects } = useCaseContext();
  const { caseData, hasData, getNetworkData, getGeographicData, statistics } = useCaseData();
  const [selectedNode, setSelectedNode] = useState(null);
  const [analysisMode, setAnalysisMode] = useState('contacts'); // 'contacts', 'locations', 'transactions'
  const [timeRange, setTimeRange] = useState('all');
  
  // Search and analytics state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    riskLevel: 'all', // 'all', 'low', 'medium', 'high', 'critical'
    entityType: 'all', // 'all', 'person', 'location', 'financial', etc.
    connectionStrength: 'all', // 'all', 'weak', 'medium', 'strong'
    timeRange: 'all' // 'all', '7d', '30d', '90d'
  });
  const [analyticsData, setAnalyticsData] = useState({
    totalEntities: 0,
    totalConnections: 0,
    riskDistribution: {},
    connectionTypes: {},
    timelineData: [],
    hotspots: []
  });

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
          nodes: getContactNodes(realNetworkData),
          connections: getContactConnections(realNetworkData)
        },
        locations: {
          nodes: getAllLocationNodes(),
          connections: getLocationConnections()
        },
        transactions: {
          nodes: getFinancialNodes(realNetworkData),
          connections: getFinancialConnections(realNetworkData)
        }
      };
      
      setNetworkData(organizedData);
    }
  }, [hasData, caseData, getNetworkData]);

  // Search and Analytics Functions
  const searchNodes = (nodes, searchTerm) => {
    if (!searchTerm.trim()) return nodes;
    
    const term = searchTerm.toLowerCase();
    return nodes.filter(node => {
      return (
        (node.label && node.label.toLowerCase().includes(term)) ||
        (node.name && node.name.toLowerCase().includes(term)) ||
        (node.id && node.id.toLowerCase().includes(term)) ||
        (node.type && node.type.toLowerCase().includes(term)) ||
        (node.email && node.email.toLowerCase().includes(term)) ||
        (node.phone && node.phone.toLowerCase().includes(term)) ||
        (node.address && node.address.toLowerCase().includes(term)) ||
        (node.description && node.description.toLowerCase().includes(term))
      );
    });
  };

  const filterNodes = (nodes, criteria) => {
    return nodes.filter(node => {
      // Risk level filter
      if (criteria.riskLevel !== 'all' && node.risk !== criteria.riskLevel) {
        return false;
      }
      
      // Entity type filter
      if (criteria.entityType !== 'all' && node.type !== criteria.entityType) {
        return false;
      }
      
      return true;
    });
  };

  const filterConnections = (connections, criteria) => {
    return connections.filter(connection => {
      // Connection strength filter
      if (criteria.connectionStrength !== 'all') {
        const strength = connection.strength || 0;
        switch (criteria.connectionStrength) {
          case 'weak':
            return strength < 3;
          case 'medium':
            return strength >= 3 && strength < 7;
          case 'strong':
            return strength >= 7;
          default:
            return true;
        }
      }
      
      return true;
    });
  };

  const calculateAnalytics = (nodes, connections) => {
    const analytics = {
      totalEntities: nodes.length,
      totalConnections: connections.length,
      riskDistribution: {},
      connectionTypes: {},
      entityTypes: {},
      hotspots: []
    };

    // Calculate risk distribution
    nodes.forEach(node => {
      const risk = node.risk || 'unknown';
      analytics.riskDistribution[risk] = (analytics.riskDistribution[risk] || 0) + 1;
    });

    // Calculate connection types
    connections.forEach(connection => {
      const type = connection.type || 'unknown';
      analytics.connectionTypes[type] = (analytics.connectionTypes[type] || 0) + 1;
    });

    // Calculate entity types
    nodes.forEach(node => {
      const type = node.type || 'unknown';
      analytics.entityTypes[type] = (analytics.entityTypes[type] || 0) + 1;
    });

    // Find hotspots (nodes with most connections)
    const connectionCounts = {};
    connections.forEach(connection => {
      connectionCounts[connection.from] = (connectionCounts[connection.from] || 0) + 1;
      connectionCounts[connection.to] = (connectionCounts[connection.to] || 0) + 1;
    });

    analytics.hotspots = Object.entries(connectionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([nodeId, count]) => {
        const node = nodes.find(n => n.id === nodeId);
        return {
          node: node || { id: nodeId, label: nodeId },
          connections: count
        };
      });

    return analytics;
  };

  // Get filtered and searched data
  const getFilteredData = () => {
    const currentData = networkData[analysisMode];
    let filteredNodes = filterNodes(currentData.nodes, filterCriteria);
    filteredNodes = searchNodes(filteredNodes, searchTerm);
    
    const filteredConnections = filterConnections(
      currentData.connections.filter(conn => 
        filteredNodes.some(n => n.id === conn.from) && 
        filteredNodes.some(n => n.id === conn.to)
      ),
      filterCriteria
    );

    return {
      nodes: filteredNodes,
      connections: filteredConnections
    };
  };

  // Helper function to get coordinates for victim locations
  const getVictimCoordinates = (location) => {
    const locationMap = {
      'Chicago, IL': { lat: 41.8781, lng: -87.6298 },
      'New York, NY': { lat: 40.7128, lng: -74.0060 },
      'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
      'Miami, FL': { lat: 25.7617, lng: -80.1918 },
      'Seattle, WA': { lat: 47.6062, lng: -122.3321 }
    };
    return locationMap[location] || { lat: 39.8283, lng: -98.5795 }; // Default to center US
  };

  // Helper functions for comprehensive contact data
  const getContactNodes = (networkData) => {
    if (!hasData || !caseData) return [];
    
    const contactNodes = [];
    
    // Add suspects with enhanced information
    if (caseData.suspects) {
      caseData.suspects.forEach(suspect => {
        contactNodes.push({
          id: suspect.id,
          name: suspect.name,
          label: suspect.name,
          type: 'person',
          group: 'suspect',
          category: 'suspect',
          age: suspect.age,
          location: suspect.location,
          role: suspect.role,
          charges: suspect.charges,
          riskLevel: suspect.riskLevel,
          coordinates: suspect.lastKnownLocation?.coordinates,
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 0
        });
      });
    }
    
    // Add victims
    if (caseData.victims) {
      caseData.victims.forEach(victim => {
        contactNodes.push({
          id: victim.id,
          name: victim.name,
          label: victim.name,
          type: 'person',
          group: 'victim',
          category: 'victim',
          age: victim.age,
          location: victim.location,
          impactType: victim.impactType,
          financialLoss: victim.financialLoss,
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 0
        });
      });
    }
    
    // Add network persons from existing network data
    networkData.nodes.filter(node => 
      node.type === 'person' && !contactNodes.find(cn => cn.id === node.id)
    ).forEach(node => {
      contactNodes.push({
        ...node,
        category: node.group || 'person',
        x: node.x || Math.random() * 800 + 100,
        y: node.y || Math.random() * 600 + 100
      });
    });
    
    return contactNodes;
  };
  
  const getContactConnections = (networkData) => {
    if (!hasData || !caseData) return [];
    
    const connections = [];
    
    // Add communication and relationship connections
    networkData.edges.filter(edge => 
      edge.type === 'communication' || edge.type === 'relationship' || edge.type === 'association'
    ).forEach(edge => {
      connections.push({
        ...edge,
        from: edge.source || edge.from,
        to: edge.target || edge.to,
        strength: edge.weight || edge.strength || 5,
        label: edge.label || edge.type
      });
    });
    
    // Add suspect-victim relationships based on case data
    if (caseData.suspects && caseData.victims) {
      caseData.suspects.forEach(suspect => {
        caseData.victims.forEach(victim => {
          connections.push({
            id: `${suspect.id}-${victim.id}`,
            from: suspect.id,
            to: victim.id,
            type: 'crime-relationship',
            strength: 8,
            label: 'Crime Association'
          });
        });
      });
    }
    
    return connections;
  };
  
  const getFinancialNodes = (networkData) => {
    if (!hasData || !caseData) return [];
    
    const financialNodes = [];
    
    // Add suspects as financial entities
    if (caseData.suspects) {
      caseData.suspects.forEach(suspect => {
        financialNodes.push({
          id: `${suspect.id}-financial`,
          name: `${suspect.name} (Financial)`,
          label: suspect.name,
          type: 'person-financial',
          group: 'suspect',
          category: 'suspect',
          originalId: suspect.id,
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 0
        });
      });
    }
    
    // Add victims as financial entities
    if (caseData.victims) {
      caseData.victims.forEach(victim => {
        financialNodes.push({
          id: `${victim.id}-financial`,
          name: `${victim.name} (Loss: $${victim.financialLoss || 0})`,
          label: victim.name,
          type: 'person-financial',
          group: 'victim',
          category: 'victim',
          originalId: victim.id,
          financialLoss: victim.financialLoss,
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 0
        });
      });
    }
    
    // Add financial accounts and wallets
    networkData.nodes.filter(node => 
      node.type === 'wallet' || node.type === 'account' || node.group === 'financial'
    ).forEach(node => {
      financialNodes.push({
        ...node,
        x: node.x || Math.random() * 800 + 100,
        y: node.y || Math.random() * 600 + 100
      });
    });
    
    return financialNodes;
  };
  
  const getFinancialConnections = (networkData) => {
    if (!hasData || !caseData) return [];
    
    const connections = [];
    
    // Add financial and transaction connections
    networkData.edges.filter(edge => 
      edge.type === 'financial' || edge.type === 'transaction' || edge.type === 'money-flow'
    ).forEach(edge => {
      connections.push({
        ...edge,
        from: edge.source || edge.from,
        to: edge.target || edge.to,
        strength: edge.weight || edge.amount || edge.strength || 5,
        label: edge.label || `$${edge.amount || 'Unknown'}` || edge.type
      });
    });
    
    // Add suspect-victim financial connections
    if (caseData.suspects && caseData.victims) {
      caseData.suspects.forEach(suspect => {
        caseData.victims.forEach(victim => {
          if (victim.financialLoss) {
            connections.push({
              id: `${suspect.id}-${victim.id}-financial`,
              from: `${suspect.id}-financial`,
              to: `${victim.id}-financial`,
              type: 'financial-crime',
              strength: Math.min(victim.financialLoss / 1000, 10),
              label: `Loss: $${victim.financialLoss}`,
              amount: victim.financialLoss
            });
          }
        });
      });
    }
    
    return connections;
  };

  // Helper functions for comprehensive location data
  const getAllLocationNodes = () => {
    if (!hasData || !caseData) return [];
    
    const locationNodes = [];
    
    // Add suspect locations with real coordinates
    if (caseData.suspects) {
      caseData.suspects.forEach((suspect, index) => {
        if (suspect.lastKnownLocation) {
          locationNodes.push({
            id: `suspect-loc-${suspect.id}`,
            name: `${suspect.name} Location`,
            label: suspect.lastKnownLocation.address || 'Unknown Location',
            type: 'suspect-location',
            category: 'suspect',
            latitude: suspect.lastKnownLocation.coordinates[1],
            longitude: suspect.lastKnownLocation.coordinates[0],
            address: suspect.lastKnownLocation.address,
            timestamp: suspect.lastKnownLocation.timestamp,
            suspectName: suspect.name,
            riskLevel: suspect.riskLevel,
            x: Math.random() * 800 + 100,
            y: Math.random() * 600 + 100,
            connections: 1
          });
        }
      });
    }
    
    // Add victim locations
    if (caseData.victims) {
      caseData.victims.forEach((victim, index) => {
        // Use default coordinates for victims (can be enhanced with real data)
        const coords = getVictimCoordinates(victim.location);
        locationNodes.push({
          id: `victim-loc-${victim.id}`,
          name: `${victim.name} Location`,
          label: victim.location || 'Unknown Location',
          type: 'victim-location', 
          category: 'victim',
          latitude: coords.lat,
          longitude: coords.lng,
          address: victim.location,
          victimName: victim.name,
          impactType: victim.impactType,
          financialLoss: victim.financialLoss,
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 1
        });
      });
    }
    
    // Add geographic data locations to supplement
    if (hasData) {
      const geoData = getGeographicData();
      
      // Add additional suspect locations from geographic data
      geoData.suspectLocations.forEach((location, index) => {
        if (!locationNodes.find(node => 
          Math.abs(node.latitude - location.lat) < 0.001 && 
          Math.abs(node.longitude - location.lng) < 0.001
        )) {
          locationNodes.push({
            id: `geo-suspect-loc-${index}`,
            label: location.address || 'Suspect Area',
            type: 'suspect-location',
            category: 'suspect',
            latitude: location.lat,
            longitude: location.lng,
            address: location.address,
            suspectId: location.suspectId,
            confidence: location.confidence,
            riskLevel: 'HIGH',
            x: Math.random() * 800 + 100,
            y: Math.random() * 600 + 100,
            connections: 1
          });
        }
      });
      
      // Add crime locations
      geoData.crimeLocations.forEach((location, index) => {
        locationNodes.push({
          id: `crime-loc-${index}`,
          label: location.address || 'Crime Scene',
          type: 'crime-location',
          category: 'crime',
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          criminalActivity: location.type,
          financialImpact: location.financialImpact,
          riskLevel: 'CRITICAL',
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 1
        });
      });
      
      // Add infrastructure locations
      geoData.infrastructureLocations.forEach((location, index) => {
        locationNodes.push({
          id: `infra-loc-${index}`,
          label: location.description || 'Infrastructure',
          type: 'infrastructure-location',
          category: 'infrastructure',
          latitude: location.lat,
          longitude: location.lng,
          address: location.description,
          status: location.status,
          riskLevel: 'MEDIUM',
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          connections: 1
        });
      });
    }
    
    return locationNodes;
  };

  // Original helper functions for backward compatibility
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

  const getLocationIcon = (node) => {
    const getIconSymbol = (type, category) => {
      switch (type) {
        case 'suspect-location': return '👤';
        case 'victim-location': return '👥';
        case 'crime-location': return '⚠️';  
        case 'infrastructure-location': return '🏢';
        default: 
          // Fallback to category-based icons
          switch (category) {
            case 'suspect': return '�';
            case 'victim': return '👥';
            case 'crime': return '⚠️';
            case 'infrastructure': return '🏢';
            default: return '�📍';
          }
      }
    };

    const getIconColor = (type, category, riskLevel) => {
      switch (type) {
        case 'suspect-location': return '#dc2626'; // Red for suspects
        case 'victim-location': return '#059669'; // Green for victims
        case 'crime-location': return '#f59e0b'; // Yellow/orange for crime scenes
        case 'infrastructure-location': return '#0ea5e9'; // Blue for infrastructure
        default: 
          // Fallback to category or risk-based colors
          switch (category) {
            case 'suspect': return '#dc2626';
            case 'victim': return '#059669';
            case 'crime': return '#f59e0b';
            case 'infrastructure': return '#0ea5e9';
            default: 
              // Risk-based coloring as final fallback
              switch (riskLevel) {
                case 'HIGH': case 'CRITICAL': return '#dc2626';
                case 'MEDIUM': return '#f59e0b';
                case 'LOW': return '#059669';
                default: return '#64748b';
              }
          }
      }
    };

    return createCustomIcon(
      getIconColor(node.type, node.category, node.riskLevel), 
      getIconSymbol(node.type, node.category)
    );
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
                <div style={{ minWidth: '250px' }}>
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
                  
                  {/* Suspect-specific information */}
                  {location.type === 'suspect-location' && (
                    <>
                      {location.suspectName && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#dc2626' }}>
                          <strong>Suspect:</strong> {location.suspectName}
                        </p>
                      )}
                      {location.riskLevel && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#dc2626' }}>
                          <strong>Risk Level:</strong> {location.riskLevel}
                        </p>
                      )}
                      {location.timestamp && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                          <strong>Last Seen:</strong> {new Date(location.timestamp).toLocaleString()}
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Victim-specific information */}
                  {location.type === 'victim-location' && (
                    <>
                      {location.victimName && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#059669' }}>
                          <strong>Victim:</strong> {location.victimName}
                        </p>
                      )}
                      {location.impactType && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                          <strong>Impact Type:</strong> {location.impactType}
                        </p>
                      )}
                      {location.financialLoss && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#dc2626' }}>
                          <strong>Financial Loss:</strong> ${location.financialLoss.toLocaleString()}
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Crime location information */}
                  {location.type === 'crime-location' && (
                    <>
                      {location.criminalActivity && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#f59e0b' }}>
                          <strong>Activity:</strong> {location.criminalActivity}
                        </p>
                      )}
                      {location.financialImpact && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#dc2626' }}>
                          <strong>Financial Impact:</strong> ${location.financialImpact.toLocaleString()}
                        </p>
                      )}
                    </>
                  )}
                  
                  {/* Infrastructure information */}
                  {location.type === 'infrastructure-location' && (
                    <>
                      {location.status && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#0ea5e9' }}>
                          <strong>Status:</strong> {location.status}
                        </p>
                      )}
                    </>
                  )}
                  
                  {location.confidence && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#6b7280' }}>
                      <strong>Confidence:</strong> {(location.confidence * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Map Legend */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(51, 65, 85, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #475569',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          zIndex: 1000
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'white' }}>Location Types</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <span>Suspect Locations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span>Victim Locations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>Crime Scenes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
              <span style={{ fontSize: '16px' }}>🏢</span>
              <span>Infrastructure</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #475569' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              <div>🔴 High Risk</div>
              <div>🟡 Medium Risk</div>
              <div>🟢 Low Risk</div>
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

  // Show file selection prompt if no files are selected
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
              Please select a case from the header to start network analysis
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (selectedFiles.length === 0) {
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
            backgroundColor: '#334155',
            borderRadius: '20px',
            border: '1px solid #475569',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>📊</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#e2e8f0', fontWeight: '700' }}>
              No Files Selected
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
              Please select files from the header dropdown to analyze network connections
            </p>
            <div style={{ 
              padding: '12px 16px',
              backgroundColor: '#1e40af',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'white'
            }}>
              💡 Tip: Click the Files button in the header to select files for analysis
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header with selected files info */}
      <div style={{
        marginBottom: '16px',
        padding: '12px 16px',
        backgroundColor: '#334155',
        borderRadius: '8px',
        border: '1px solid #475569'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
              🌐 Network Analysis - {selectedCase.name}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Analyzing {selectedFiles.length} selected file{selectedFiles.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div style={{
            padding: '6px 12px',
            backgroundColor: '#059669',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'white',
            fontWeight: '600'
          }}>
            {selectedFiles.length} files selected
          </div>
        </div>
      </div>

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