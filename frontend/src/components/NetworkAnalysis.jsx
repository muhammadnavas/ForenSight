import L from 'leaflet';
import React, { useEffect, useState } from 'react';
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Add CSS animations for loading states
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.7; }
      }
      @keyframes loading-bar {
        0% { transform: translateX(-100%); }
        50% { transform: translateX(0%); }
        100% { transform: translateX(100%); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .network-fade-in {
        animation: fadeIn 0.5s ease-out;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Auto-start analysis when files are selected
  useEffect(() => {
    if (selectedFiles.length > 0 && selectedCase) {
      console.log('🔄 NetworkAnalysis: Files selected, starting automatic analysis...');
      const selectedFileObjects = getSelectedFileObjects();
      console.log('📂 Selected files for analysis:', selectedFileObjects.length);
      
      // Reset analysis state for new files
      setSelectedNode(null);
      setIsAnalyzing(true);
      
      // Determine best analysis mode based on file types
      const fileTypes = selectedFileObjects.map(file => {
        const filename = (file.originalName || file.filename || '').toLowerCase();
        return getFileType(filename);
      });
      
      // Set initial analysis mode based on most relevant file type
      if (fileTypes.includes('contacts') || fileTypes.includes('communications')) {
        setAnalysisMode('contacts');
      } else if (fileTypes.includes('location') || fileTypes.includes('gps')) {
        setAnalysisMode('locations');
      } else if (fileTypes.includes('financial') || fileTypes.includes('transaction')) {
        setAnalysisMode('transactions');
      } else {
        setAnalysisMode('contacts'); // Default fallback
      }
      
      console.log('🎯 Analysis mode set to:', analysisMode, 'based on file types:', fileTypes);
      
      // Trigger analysis for all selected files
      triggerAutomaticAnalysis(selectedFileObjects);
    } else {
      // Clear analysis when no files selected
      console.log('🧹 Clearing NetworkAnalysis data - no files selected');
      setNetworkData({ 
        contacts: { nodes: [], connections: [] },
        locations: { nodes: [], connections: [] },
        transactions: { nodes: [], connections: [] }
      });
      setAnalyticsData({
        totalEntities: 0,
        totalConnections: 0,
        riskDistribution: {},
        connectionTypes: {},
        timelineData: [],
        hotspots: []
      });
      setSelectedNode(null);
      setIsAnalyzing(false);
    }
  }, [selectedFiles, selectedCase]);

  // Function to trigger analysis with proper loading states
  const triggerAutomaticAnalysis = (fileObjects) => {
    console.log('🚀 Triggering automatic network analysis for files:', fileObjects.length);
    setIsAnalyzing(true);
    setSelectedNode(null); // Clear any selected node during analysis
    
    // Clear existing data immediately for responsive UI
    setNetworkData({
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    });
    
    // Simulate realistic analysis time based on file count and types
    const analysisTime = Math.min(800 + (fileObjects.length * 200), 2500); // 0.8-2.5 seconds
    
    setTimeout(() => {
      try {
        // Generate analysis results based on file types
        const analysisResults = generateAnalysisFromFiles(fileObjects);
        setNetworkData(analysisResults.networkData);
        setAnalyticsData(analysisResults.analyticsData);
        
        console.log('✅ Automatic analysis completed successfully');
        console.log('📊 Generated data:', {
          contacts: analysisResults.networkData.contacts.nodes.length,
          locations: analysisResults.networkData.locations.nodes.length,
          transactions: analysisResults.networkData.transactions.nodes.length,
          totalConnections: analysisResults.analyticsData.totalConnections
        });
        
      } catch (error) {
        console.error('❌ Analysis failed:', error);
        // Keep empty data on error
      } finally {
        setIsAnalyzing(false);
      }
    }, analysisTime);
  };

  // Generate enhanced analysis data based on file types and content
  const generateAnalysisFromFiles = (fileObjects) => {
    console.log('🔧 Generating enhanced analysis from files:', fileObjects.length);
    
    // First, try to use actual case data if available
    if (hasData && caseData) {
      console.log('📊 Using actual case data for network analysis');
      return generateNetworkFromCaseData();
    }
    
    // Return empty network structure when no case data available
    const networkData = {
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    };
    const analyticsData = {
      totalEntities: 0,
      totalConnections: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      connectionTypes: {},
      timelineData: [],
      hotspots: []
    };

    console.log('✅ No case data available - returning empty network structure');
    return { networkData, analyticsData };
  };

  // Generate network data from actual case data
  const generateNetworkFromCaseData = () => {
    console.log('🎯 Generating network from actual case data');
    
    const networkData = {
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    };
    
    const analyticsData = {
      totalEntities: 0,
      totalConnections: 0,
      riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
      connectionTypes: {},
      timelineData: [],
      hotspots: []
    };

    // Process suspects as contact nodes
    if (caseData.suspects) {
      const suspectNodes = caseData.suspects.map((suspect, index) => ({
        id: suspect.id,
        name: suspect.name,
        label: suspect.name,
        phone: suspect.phoneNumbers ? suspect.phoneNumbers[0] : 'Unknown',
        email: suspect.emailAccounts ? suspect.emailAccounts[0] : 'Unknown',
        type: 'suspect',
        category: 'suspect',
        riskLevel: suspect.riskLevel ? suspect.riskLevel.toLowerCase() : 'medium',
        lastContact: new Date().toISOString(),
        source: 'Case Data',
        fileType: 'case-data',
        aliases: suspect.alias || [],
        occupation: suspect.occupation,
        nationality: suspect.nationality,
        age: suspect.age,
        role: suspect.role,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: caseData.networkTopology?.edges?.filter(edge => 
          edge.from === suspect.id || edge.to === suspect.id).length || 0
      }));
      networkData.contacts.nodes.push(...suspectNodes);
      
      // Update risk distribution
      suspectNodes.forEach(node => {
        const risk = node.riskLevel === 'extreme' ? 'critical' : node.riskLevel;
        analyticsData.riskDistribution[risk] = (analyticsData.riskDistribution[risk] || 0) + 1;
      });
    }

    // Process victims as contact nodes  
    if (caseData.victims) {
      const victimNodes = caseData.victims.map((victim, index) => ({
        id: victim.id,
        name: victim.name,
        label: victim.name,
        phone: victim.contactInfo?.phone || 'Unknown',
        email: victim.contactInfo?.email || 'Unknown',
        type: 'victim',
        category: 'victim',
        riskLevel: 'low',
        lastContact: victim.incidentDate || new Date().toISOString(),
        source: 'Case Data',
        fileType: 'case-data',
        victimType: victim.type,
        financialLoss: victim.financialLoss,
        industry: victim.industry,
        location: victim.location || victim.headquartersLocation,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 2 // Typically connected to suspects and evidence
      }));
      networkData.contacts.nodes.push(...victimNodes);
      
      victimNodes.forEach(() => {
        analyticsData.riskDistribution.low += 1;
      });
    }

    // Process geographic data as location nodes
    if (caseData.geographicData) {
      // Suspect locations
      if (caseData.geographicData.suspectLocations) {
        const suspectLocationNodes = caseData.geographicData.suspectLocations.map(location => ({
          id: location.id,
          name: location.name,
          label: location.name,
          latitude: location.coordinates[1],
          longitude: location.coordinates[0],
          address: location.address,
          type: 'suspect-location',
          category: 'suspect',
          riskLevel: 'high',
          significance: location.significance,
          suspect: location.suspect,
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 3
        }));
        networkData.locations.nodes.push(...suspectLocationNodes);
      }

      // Criminal activity locations
      if (caseData.geographicData.criminalActivity) {
        const crimeLocationNodes = caseData.geographicData.criminalActivity.map(activity => ({
          id: activity.id,
          name: activity.name,
          label: activity.name,
          latitude: activity.coordinates[1],
          longitude: activity.coordinates[0], 
          address: activity.address,
          type: 'crime-location',
          category: 'crime',
          riskLevel: activity.impact === 'HIGH' ? 'critical' : activity.impact === 'MEDIUM' ? 'high' : 'medium',
          activityType: activity.type,
          date: activity.date,
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 4
        }));
        networkData.locations.nodes.push(...crimeLocationNodes);
      }
    }

    // Process cryptocurrency data as transaction nodes
    if (caseData.evidence) {
      caseData.evidence.forEach(evidence => {
        if (evidence.type === 'FINANCIAL' && evidence.cryptoAnalysis) {
          const cryptoNodes = evidence.cryptoAnalysis.primaryWallets?.map((wallet, index) => ({
            id: `crypto_${wallet.address.slice(-8)}`,
            name: `${wallet.currency} Wallet`,
            label: `${wallet.balance} ${wallet.currency}`,
            type: 'cryptocurrency',
            category: 'financial', 
            currency: wallet.currency,
            balance: wallet.balance,
            address: wallet.address,
            linkedSuspect: wallet.linkedSuspect,
            riskLevel: wallet.balance > 100 ? 'critical' : wallet.balance > 50 ? 'high' : 'medium',
            lastActivity: wallet.lastActivity,
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 5
          })) || [];
          networkData.transactions.nodes.push(...cryptoNodes);
        }
      });
    }

    // Generate connections based on network topology
    if (caseData.networkTopology?.edges) {
      const connections = caseData.networkTopology.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        type: edge.type,
        strength: edge.strength,
        frequency: edge.frequency,
        volume: edge.volume
      }));
      
      networkData.contacts.connections.push(...connections);
      analyticsData.totalConnections += connections.length;
      
      // Count connection types
      connections.forEach(conn => {
        analyticsData.connectionTypes[conn.type] = (analyticsData.connectionTypes[conn.type] || 0) + 1;
      });
    }

    // Calculate total entities
    analyticsData.totalEntities = 
      networkData.contacts.nodes.length + 
      networkData.locations.nodes.length + 
      networkData.transactions.nodes.length;

    // Generate timeline data from evidence
    if (caseData.evidence) {
      analyticsData.timelineData = caseData.evidence.map(evidence => ({
        date: evidence.collectedDate,
        event: `Evidence collected: ${evidence.name}`,
        type: evidence.type,
        category: evidence.category
      }));
    }

    console.log('✅ Generated network data from case:', {
      contacts: networkData.contacts.nodes.length,
      locations: networkData.locations.nodes.length, 
      transactions: networkData.transactions.nodes.length,
      connections: analyticsData.totalConnections
    });

    return { networkData, analyticsData };
  };
  
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

  // Enhanced file type detection for forensic analysis
  const getFileType = (filename) => {
    if (!filename) return 'unknown';
    
    const name = filename.toLowerCase();
    const ext = name.split('.').pop();
    
    // Check file content based on name patterns
    if (name.includes('contact') || name.includes('phone') || name.includes('call') || name.includes('sms')) {
      return 'contacts';
    }
    if (name.includes('location') || name.includes('gps') || name.includes('coordinate') || name.includes('position')) {
      return 'location';
    }
    if (name.includes('transaction') || name.includes('financial') || name.includes('payment') || name.includes('bank') || name.includes('wallet')) {
      return 'financial';
    }
    if (name.includes('network') || name.includes('traffic') || name.includes('communication')) {
      return 'communications';
    }
    
    // Check by file extension
    const extensionTypes = {
      // Network/Communication files
      'pcap': 'communications', 'pcapng': 'communications', 'cap': 'communications',
      'har': 'communications', 'log': 'communications',
      
      // Database files (likely to contain contacts/transactions)
      'db': 'contacts', 'sqlite': 'contacts', 'sql': 'contacts',
      
      // Data files
      'json': 'data', 'xml': 'data', 'csv': 'data',
      'txt': 'data', 'tsv': 'data',
      
      // Mobile forensic files
      'tar': 'mobile', 'ufdr': 'mobile', 'ufd': 'mobile',
      
      // Location files
      'kml': 'location', 'gpx': 'location', 'geo': 'location'
    };
    
    return extensionTypes[ext] || 'data';
  };
  
  // Get processed files from selected files
  const processedFiles = getSelectedFileObjects();
  const hasProcessedData = processedFiles.length > 0 || hasData;
  const availableDataTypes = processedFiles.map(file => {
    const filename = file.originalName || file.filename || '';
    return getFileType(filename);
  }).filter(Boolean);

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
    backgroundColor: '#ffffff',
    color: '#1e293b'
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
    backgroundColor: '#f8fafc',
    margin: '24px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  };

  const sidebarStyle = {
    width: '320px',
    backgroundColor: '#f8fafc',
    padding: '24px',
    borderLeft: '1px solid #e2e8f0',
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
    // Risk-based coloring first
    const riskColors = {
      'critical': '#dc2626', // Red
      'high': '#f59e0b',     // Orange
      'medium': '#10b981',   // Green
      'low': '#64748b'       // Gray
    };
    
    if (node.riskLevel && riskColors[node.riskLevel]) {
      return riskColors[node.riskLevel];
    }
    
    // Category-based coloring
    const categoryColors = {
      'suspect': '#dc2626',      // Red
      'victim': '#059669',       // Dark green
      'witness': '#0ea5e9',      // Blue
      'contact': '#3b82f6',      // Light blue
      'person': '#6366f1',       // Indigo
      'financial': '#f59e0b',    // Orange
      'location': '#8b5cf6',     // Purple
      'crime': '#ef4444',        // Bright red
      'infrastructure': '#0891b2' // Cyan
    };
    
    if (node.category && categoryColors[node.category]) {
      return categoryColors[node.category];
    }
    
    // Type-based fallback
    const typeColors = {
      'subject': '#ef4444',
      'contact': '#3b82f6',
      'unknown': '#f59e0b',
      'international': '#8b5cf6',
      'wallet': '#f59e0b',
      'account': '#059669',
      'exchange': '#8b5cf6'
    };
    
    return typeColors[node.type] || '#6b7280';
  };

  const getNodeSize = (node) => {
    // Base size
    let size = 15;
    
    // Risk-based sizing
    const riskMultipliers = {
      'critical': 2.0,
      'high': 1.5,
      'medium': 1.2,
      'low': 1.0
    };
    
    if (node.riskLevel && riskMultipliers[node.riskLevel]) {
      size *= riskMultipliers[node.riskLevel];
    }
    
    // Connection-based sizing
    const connections = node.connections || 0;
    size += Math.min(connections * 2, 15); // Max additional 15px
    
    return Math.max(size, 12); // Minimum size of 12px
  };

  const getNodeStrokeColor = (node) => {
    // Enhanced stroke colors for better visibility
    if (node.riskLevel === 'critical') return '#7f1d1d'; // Dark red
    if (node.riskLevel === 'high') return '#b91c1c'; // Red
    if (node.riskLevel === 'medium') return '#047857'; // Dark green
    if (node.riskLevel === 'low') return '#475569'; // Dark gray
    
    // Category-based stroke colors
    if (node.category === 'suspect') return '#7f1d1d'; // Dark red
    if (node.category === 'victim') return '#047857'; // Dark green
    if (node.category === 'witness') return '#0c4a6e'; // Dark blue
    if (node.category === 'financial') return '#b45309'; // Dark orange
    
    return '#374151'; // Default dark gray
  };

  const getConnectionColor = (connection) => {
    // Risk-based connection colors
    if (connection.riskLevel === 'critical') return '#dc2626';
    if (connection.riskLevel === 'high') return '#f59e0b';
    
    // Type-based colors
    const colors = {
      'communication': '#10b981',
      'relationship': '#3b82f6', 
      'suspect-relationship': '#ef4444',
      'business': '#0ea5e9',
      'family': '#059669',
      'movement': '#8b5cf6',
      'travel': '#6366f1',
      'crime-scene': '#dc2626',
      'transfer': '#f59e0b',
      'payment': '#10b981',
      'suspicious-activity': '#ef4444',
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
            case 'suspect': return '👤';
            case 'victim': return '👥';
            case 'crime': return '⚠️';
            case 'infrastructure': return '🏢';
            default: return '📍';
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
    
    console.log('🌐 Rendering network graph for mode:', analysisMode);
    console.log('📊 Network data:', data);
    console.log('📋 Nodes:', data?.nodes?.length || 0);
    console.log('🔗 Connections:', data?.connections?.length || 0);
    
    // Show loading state during analysis
    if (isAnalyzing) {
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#0ea5e9',
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '20px',
            animation: 'pulse 2s infinite'
          }}>🔄</div>
          <div style={{ 
            fontSize: '18px', 
            marginBottom: '12px',
            fontWeight: '600'
          }}>Analyzing Network Data</div>
          <div style={{ 
            fontSize: '14px',
            marginBottom: '16px',
            color: '#64748b'
          }}>
            Processing {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} for {analysisMode} connections...
          </div>
          <div style={{
            width: '200px',
            height: '4px',
            backgroundColor: '#e2e8f0',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#0ea5e9',
              borderRadius: '2px',
              animation: 'loading-bar 2s infinite'
            }}></div>
          </div>
        </div>
      );
    }
    
    // Safety check - ensure data exists and has required properties
    if (!data || !data.nodes || data.nodes.length === 0) {
      console.log('❌ No network data available for analysis mode:', analysisMode);
      
      const emptyStateConfig = {
        contacts: {
          icon: '👥',
          title: 'No Contact Data Available',
          description: 'No contacts, phone calls, or communication records found in the selected files.',
          suggestion: 'Try selecting files that contain contact information, call logs, or messaging data.'
        },
        locations: {
          icon: '📍',
          title: 'No Location Data Available', 
          description: 'No GPS coordinates, location records, or geographic data found in the selected files.',
          suggestion: 'Try selecting files that contain GPS logs, location history, or geographic metadata.'
        },
        transactions: {
          icon: '💰',
          title: 'No Financial Data Available',
          description: 'No financial transactions, bank records, or payment data found in the selected files.',
          suggestion: 'Try selecting files that contain financial records, transaction logs, or payment history.'
        }
      };
      
      const config = emptyStateConfig[analysisMode] || {
        icon: '🔍',
        title: 'No Data Available',
        description: 'No network data found in the selected files.',
        suggestion: 'Select different files to analyze network connections.'
      };
      
      return (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%', 
          color: '#64748b',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.7 }}>{config.icon}</div>
          <div style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '600', color: '#1e293b' }}>
            {config.title}
          </div>
          <div style={{ fontSize: '14px', marginBottom: '16px', lineHeight: '1.5' }}>
            {config.description}
          </div>
          <div style={{ 
            fontSize: '13px', 
            padding: '12px 16px',
            backgroundColor: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            color: '#475569',
            maxWidth: '400px'
          }}>
            💡 {config.suggestion}
          </div>
        </div>
      );
    }
    
    console.log('✅ Rendering', data.nodes.length, 'nodes and', data.connections?.length || 0, 'connections');
    
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
                strokeWidth={Math.max(2, Math.min(connection.strength / 2, 6))}
                strokeOpacity={0.7}
                style={{
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                }}
              />
              {/* Connection label */}
              <text
                x={(fromNode.x + toNode.x) / 2}
                y={(fromNode.y + toNode.y) / 2 - 5}
                fill="#1e293b"
                fontSize="10"
                fontWeight="500"
                textAnchor="middle"
                style={{ 
                  textShadow: '0 1px 3px rgba(255,255,255,0.9)',
                  pointerEvents: 'none'
                }}
              >
                {connection.label || connection.type || `${connection.strength} contacts`}
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
                r={getNodeSize(node)}
                fill={getNodeColor(node)}
                stroke={selectedNode?.id === node.id ? '#ffffff' : getNodeStrokeColor(node)}
                strokeWidth={selectedNode?.id === node.id ? "4" : "2"}
                style={{ 
                  cursor: 'pointer', 
                  filter: selectedNode?.id === node.id ? 
                    'drop-shadow(0 0 12px rgba(0,0,0,0.4)) drop-shadow(0 0 6px rgba(255,255,255,0.6))' : 
                    'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedNode(node)}
              />
              <text
                x={node.x}
                y={node.y + 35}
                fill="#1e293b"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                style={{ 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                }}
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
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          minWidth: '200px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Location Types</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <span style={{ fontSize: '16px' }}>👤</span>
              <span>Suspect Locations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <span style={{ fontSize: '16px' }}>👥</span>
              <span>Victim Locations</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <span>Crime Scenes</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <span style={{ fontSize: '16px' }}>🏢</span>
              <span>Infrastructure</span>
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
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
                    color: '#1e293b',
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
                    color: '#1e293b',
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
              color: '#1e293b',
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
            {analysisMode === 'contacts' ? 'Communications' : 
             analysisMode === 'locations' ? 'Location Links' : 'Financial Connections'} ({selectedNode.connections || 0})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {networkData[analysisMode].connections
              .filter(conn => conn.from === selectedNode.id || conn.to === selectedNode.id)
              .map((conn, index) => {
                const otherNodeId = conn.from === selectedNode.id ? conn.to : conn.from;
                const otherNode = networkData[analysisMode].nodes.find(n => n.id === otherNodeId);
                
                return (
                  <div key={index} style={{
                    backgroundColor: '#ffffff',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                          {otherNode?.label || otherNode?.name || 'Unknown Entity'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {conn.label || conn.type || 'Connected'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{
                          backgroundColor: getConnectionColor(conn),
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {conn.type?.replace('-', ' ') || 'Link'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          Strength: {conn.strength || 1}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {networkData[analysisMode].connections
              .filter(conn => conn.from === selectedNode.id || conn.to === selectedNode.id).length === 0 && (
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px dashed #e2e8f0',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '13px'
              }}>
                No connections found for this entity
              </div>
            )}
          </div>
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
            <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', marginBottom: '8px' }}>Case: {caseData.caseName}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                {statistics.totalSuspects} suspects, {statistics.networkComplexity} network elements
              </div>
            </div>
          )}

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
            backgroundColor: '#f8fafc',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>📊</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
              No File Selected
            </h3>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
              Please select a single file from the header dropdown to analyze network connections
            </p>
            <div style={{ 
              padding: '12px 16px',
              backgroundColor: '#e0f2fe',
              borderRadius: '8px',
              fontSize: '14px',
              color: '#1e293b',
              border: '1px solid #0ea5e9'
            }}>
              💡 Tip: Click the Files button in the header and select one file for analysis
            </div>
          </div>
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
          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(248, 250, 252, 0.95)', 
            borderRadius: '8px', 
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)'
          }}>
            {[
              { id: 'contacts', label: '👥 Contacts', icon: '👥' },
              { id: 'locations', label: '📍 Locations', icon: '📍' },
              { id: 'transactions', label: '💰 Finance', icon: '💰' }
            ].map(mode => (
              <button
                key={mode.id}
                style={{
                  backgroundColor: analysisMode === mode.id ? '#0ea5e9' : 'transparent',
                  color: analysisMode === mode.id ? '#ffffff' : '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: analysisMode === mode.id ? '600' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: analysisMode === mode.id ? '0 2px 4px rgba(14, 165, 233, 0.3)' : 'none'
                }}
                onClick={() => setAnalysisMode(mode.id)}
                onMouseEnter={(e) => {
                  if (analysisMode !== mode.id) {
                    e.target.style.backgroundColor = 'rgba(14, 165, 233, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (analysisMode !== mode.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {mode.icon} {mode.label.split(' ')[1]}
              </button>
            ))}
          </div>

          <div style={{ 
            display: 'flex', 
            backgroundColor: 'rgba(248, 250, 252, 0.95)', 
            borderRadius: '8px', 
            padding: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)'
          }}>
            {[
              { id: 'all', label: 'All Time' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' }
            ].map(range => (
              <button
                key={range.id}
                style={{
                  backgroundColor: timeRange === range.id ? '#059669' : 'transparent',
                  color: timeRange === range.id ? '#ffffff' : '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: timeRange === range.id ? '600' : '500',
                  transition: 'all 0.2s ease',
                  boxShadow: timeRange === range.id ? '0 2px 4px rgba(5, 150, 105, 0.3)' : 'none'
                }}
                onClick={() => setTimeRange(range.id)}
                onMouseEnter={(e) => {
                  if (timeRange !== range.id) {
                    e.target.style.backgroundColor = 'rgba(5, 150, 105, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (timeRange !== range.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
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
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#1e293b' }}>Risk Levels</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                backgroundColor: '#dc2626',
                border: '2px solid #7f1d1d'
              }}></div>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>Critical Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                backgroundColor: '#f59e0b',
                border: '2px solid #b45309'
              }}></div>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>High Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981',
                border: '2px solid #047857'
              }}></div>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>Medium Risk</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                borderRadius: '50%', 
                backgroundColor: '#64748b',
                border: '2px solid #374151'
              }}></div>
              <span style={{ color: '#1e293b', fontWeight: '500' }}>Low Risk</span>
            </div>
          </div>
          
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <h5 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' }}>Categories</h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#dc2626' }}>●</span>
                <span style={{ color: '#64748b' }}>Suspects</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#059669' }}>●</span>
                <span style={{ color: '#64748b' }}>Victims</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#0ea5e9' }}>●</span>
                <span style={{ color: '#64748b' }}>Witnesses</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: '#f59e0b' }}>●</span>
                <span style={{ color: '#64748b' }}>Financial</span>
              </div>
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
          backgroundColor: 'rgba(248, 250, 252, 0.95)',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', gap: '24px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#3b82f6' 
              }}></div>
              <span style={{ color: '#64748b', fontWeight: '500' }}>
                {analysisMode === 'contacts' ? 'Contacts' : 
                 analysisMode === 'locations' ? 'Locations' : 'Accounts'}: 
              </span>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>{networkData[analysisMode]?.nodes?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981' 
              }}></div>
              <span style={{ color: '#64748b', fontWeight: '500' }}>
                {analysisMode === 'contacts' ? 'Communications' : 
                 analysisMode === 'locations' ? 'Movements' : 'Transactions'}: 
              </span>
              <span style={{ fontWeight: '700', color: '#1e293b' }}>{networkData[analysisMode]?.connections?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                backgroundColor: '#ef4444' 
              }}></div>
              <span style={{ color: '#64748b', fontWeight: '500' }}>High Risk: </span>
              <span style={{ fontWeight: '700', color: '#dc2626' }}>
                {networkData[analysisMode]?.nodes?.filter(n => n.riskLevel === 'high' || n.riskLevel === 'critical' || n.risk === 'high' || n.risk === 'critical').length || 0}
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
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Summary</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Total Entities:</span>
              <span>{networkData[analysisMode]?.nodes?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Relationships:</span>
              <span>{networkData[analysisMode]?.connections?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Risk Entities:</span>
              <span style={{ color: '#ef4444' }}>
                {networkData[analysisMode]?.nodes?.filter(n => n.riskLevel === 'high' || n.riskLevel === 'critical' || n.risk === 'high' || n.risk === 'critical').length || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Node Details */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
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
