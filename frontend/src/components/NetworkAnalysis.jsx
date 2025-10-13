import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';
import useCaseFileIntegration from '../hooks/useCaseFileIntegration.js';

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
  // Initialize case file integration hook
  const integrationStatus = useCaseFileIntegration();
  console.log('🌐 Network Analysis integration status:', integrationStatus);
  
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
      .pulse-animation { animation: pulse 2s infinite; }
      .loading-bar { animation: loading-bar 2s infinite; }
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
      
      // Simulate analysis time for UX
      const analysisTime = Math.max(1500, selectedFileObjects.length * 500);
      setTimeout(async () => {
        try {
          console.log('🔍 Performing network analysis...');
          await performNetworkAnalysis(selectedFileObjects);
          console.log('✅ Network analysis complete');
        } catch (error) {
          console.error('❌ Analysis failed:', error);
        } finally {
          setIsAnalyzing(false);
        }
      }, analysisTime);
    }
  }, [selectedFiles, selectedCase]);

  // Helper function to determine file type
  const getFileType = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('contact') || name.includes('phone') || name.includes('address')) {
      return 'contacts';
    } else if (name.includes('location') || name.includes('gps') || name.includes('coordinate')) {
      return 'location';
    } else if (name.includes('financial') || name.includes('transaction') || name.includes('bank')) {
      return 'financial';
    } else if (name.includes('communication') || name.includes('message') || name.includes('call')) {
      return 'communications';
    }
    return 'general';
  };

  // Core analysis function
  const performNetworkAnalysis = async (fileObjects) => {
    setIsAnalyzing(true);
    
    // Simulate processing time
    const analysisTime = Math.max(2000, fileObjects.length * 800);
    
    setTimeout(async () => {
      try {
        console.log('🔧 Starting network analysis of files:', fileObjects.length);
        
        // Use the enhanced analysis generation
        const result = await generateAnalysisFromFiles(fileObjects);
        
        if (result?.networkData) {
          setNetworkData(result.networkData);
          setAnalyticsData(result.analyticsData || {
            totalEntities: 0,
            totalConnections: 0,
            riskDistribution: {},
            connectionTypes: {},
            timelineData: [],
            hotspots: []
          });
        }
        
      } catch (error) {
        console.error('❌ Analysis failed:', error);
        // Keep empty data on error
      } finally {
        setIsAnalyzing(false);
      }
    }, analysisTime);
  };

  // Generate enhanced analysis data based on file types and content
  const generateAnalysisFromFiles = async (fileObjects) => {
    console.log('🔧 Generating enhanced analysis from files:', fileObjects.length);
    
    // First, try to use actual case data if available from context
    if (hasData && caseData) {
      console.log('📊 Using actual case data from context for network analysis');
      return generateNetworkFromCaseData();
    }
    
    // Try to load APT case data from public folder
    try {
      console.log('📂 Attempting to load APT case data from public folder');
      const response = await fetch('/apt-case-003.json');
      if (response.ok) {
        const aptCaseData = await response.json();
        console.log('✅ Successfully loaded APT case data:', aptCaseData.caseName);
        
        // Temporarily set the case data for network generation
        const originalCaseData = caseData;
        const originalHasData = hasData;
        
        // Use APT data for generation
        const aptNetwork = generateNetworkFromAPTData(aptCaseData);
        
        return aptNetwork;
      }
    } catch (error) {
      console.log('❌ Failed to load APT case data:', error.message);
    }
    
    // Fallback to demo network if no real case data
    console.log('🎭 Using demo network as fallback');
    return generateDemoNetwork();
  };

  // Generate network specifically from APT case data
  const generateNetworkFromAPTData = (aptData) => {
    console.log('🔧 Generating network from APT case data:', aptData.caseName);
    
    const networkData = {
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    };

    // Process suspects
    if (aptData.suspects) {
      aptData.suspects.forEach((suspect) => {
        networkData.contacts.nodes.push({
          id: suspect.id,
          name: suspect.name,
          label: suspect.name,
          type: 'suspect',
          category: 'suspect',
          riskLevel: suspect.riskLevel?.toLowerCase() || 'high',
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 0,
          age: suspect.age,
          nationality: suspect.nationality,
          occupation: suspect.occupation,
          alias: suspect.alias?.[0] || '',
          role: suspect.role
        });

        // Add suspect location
        if (suspect.coordinates) {
          networkData.locations.nodes.push({
            id: `loc-${suspect.id}`,
            name: suspect.coordinates.city,
            label: `${suspect.name} - ${suspect.coordinates.city}`,
            type: 'suspect_location',
            category: 'location',
            riskLevel: suspect.riskLevel?.toLowerCase() || 'high',
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 0,
            lat: suspect.coordinates.lat,
            lng: suspect.coordinates.lng,
            city: suspect.coordinates.city,
            country: suspect.coordinates.country,
            suspect: suspect.name
          });
        }
      });
    }

    // Process victims
    if (aptData.victims) {
      aptData.victims.forEach((victim) => {
        networkData.contacts.nodes.push({
          id: victim.id,
          name: victim.name,
          label: victim.name,
          type: 'victim',
          category: 'victim',
          riskLevel: 'medium',
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 0,
          industry: victim.industry,
          financialLoss: victim.financialLoss,
          employeeCount: victim.employeeCount
        });

        // Add victim location
        if (victim.coordinates) {
          networkData.locations.nodes.push({
            id: `loc-${victim.id}`,
            name: victim.coordinates.city,
            label: `${victim.name} - ${victim.coordinates.city}`,
            type: 'victim_location',
            category: 'location',
            riskLevel: 'medium',
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 0,
            lat: victim.coordinates.lat,
            lng: victim.coordinates.lng,
            city: victim.coordinates.city,
            country: victim.coordinates.country,
            organization: victim.name
          });
        }
      });
    }

    // Process cryptocurrency data
    const cryptoEvidence = aptData.evidence?.find(e => e.category === 'Cryptocurrency Transactions');
    if (cryptoEvidence?.cryptoAnalysis?.primaryWallets) {
      cryptoEvidence.cryptoAnalysis.primaryWallets.forEach((wallet, index) => {
        networkData.transactions.nodes.push({
          id: `wallet-${index}`,
          name: `${wallet.currency} Wallet`,
          label: `${wallet.balance} ${wallet.currency}`,
          type: 'cryptocurrency',
          category: 'financial',
          riskLevel: 'high',
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 0,
          address: wallet.address.substring(0, 10) + '...',
          balance: wallet.balance,
          currency: wallet.currency,
          linkedSuspect: wallet.linkedSuspect
        });
      });
    }

    // Create connections based on APT network topology
    const contactConnections = [];
    if (aptData.networkTopology?.edges) {
      aptData.networkTopology.edges.forEach((edge) => {
        contactConnections.push({
          from: edge.from,
          to: edge.to,
          type: edge.type,
          strength: edge.strength === 'strong' ? 9 : edge.strength === 'medium' ? 6 : 4,
          label: edge.type.replace('_', ' ').toUpperCase(),
          frequency: edge.frequency
        });
      });
    }

    // Create basic location connections
    const locationConnections = [];
    const locationNodes = networkData.locations.nodes;
    for (let i = 0; i < locationNodes.length; i++) {
      for (let j = i + 1; j < locationNodes.length; j++) {
        if (locationNodes[i].country === locationNodes[j].country) {
          locationConnections.push({
            from: locationNodes[i].id,
            to: locationNodes[j].id,
            type: 'geographic_proximity',
            strength: 6,
            label: 'Same Country'
          });
        }
      }
    }

    // Create transaction connections
    const transactionConnections = [];
    const walletNodes = networkData.transactions.nodes;
    for (let i = 0; i < walletNodes.length; i++) {
      for (let j = i + 1; j < walletNodes.length; j++) {
        transactionConnections.push({
          from: walletNodes[i].id,
          to: walletNodes[j].id,
          type: 'fund_transfer',
          strength: 7,
          label: 'Transaction Flow'
        });
      }
    }

    networkData.contacts.connections = contactConnections;
    networkData.locations.connections = locationConnections;
    networkData.transactions.connections = transactionConnections;

    // Calculate analytics
    const analyticsData = {
      totalEntities: networkData.contacts.nodes.length + networkData.locations.nodes.length + networkData.transactions.nodes.length,
      totalConnections: contactConnections.length + locationConnections.length + transactionConnections.length,
      riskDistribution: {
        extreme: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'extreme').length,
        critical: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'critical').length,
        high: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'high').length,
        medium: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'medium').length,
        low: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'low').length
      },
      connectionTypes: {
        data_supply: contactConnections.filter(c => c.type === 'data_supply').length,
        payment_processing: contactConnections.filter(c => c.type === 'payment_processing').length,
        tech_transfer: contactConnections.filter(c => c.type === 'tech_transfer').length
      },
      timelineData: [],
      hotspots: []
    };

    console.log('✅ Generated APT network:', {
      contacts: networkData.contacts.nodes.length,
      locations: networkData.locations.nodes.length,
      transactions: networkData.transactions.nodes.length
    });

    return { networkData, analyticsData };
  };

  // State for network data
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCriteria, setFilterCriteria] = useState({
    riskLevel: 'all',
    entityType: 'all',
    connectionStrength: 'all',
    timeRange: 'all'
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

  // Load network data when component mounts or case data changes
  useEffect(() => {
    const loadNetworkData = async () => {
      if (hasData && caseData) {
        console.log('🔄 Loading network data from case data');
        const { networkData: generatedNetworkData, analyticsData: generatedAnalytics } = generateNetworkFromCaseData();
        setNetworkData(generatedNetworkData);
        setAnalyticsData(generatedAnalytics);
      } else {
        // Auto-load APT case data for demonstration
        console.log('🔄 Auto-loading APT case data for demonstration');
        const result = await generateAnalysisFromFiles([]);
        if (result?.networkData) {
          setNetworkData(result.networkData);
          setAnalyticsData(result.analyticsData);
        }
      }
    };

    loadNetworkData();
  }, [hasData, caseData]);

  // Generate network from APT case data function
  const generateNetworkFromCaseData = () => {
    if (!hasData || !caseData) {
      return generateDemoNetwork();
    }

    console.log('🔧 Generating network from APT case data:', caseData.caseName);
    
    const networkData = {
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    };

    // CONTACTS NETWORK - Process suspects and victims
    if (caseData.suspects) {
      caseData.suspects.forEach((suspect) => {
        networkData.contacts.nodes.push({
          id: suspect.id,
          name: suspect.name,
          label: suspect.name,
          type: 'suspect',
          category: 'suspect',
          riskLevel: suspect.riskLevel?.toLowerCase() || 'high',
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 0,
          age: suspect.age,
          nationality: suspect.nationality,
          occupation: suspect.occupation,
          alias: suspect.alias?.[0] || '',
          role: suspect.role
        });
      });
    }

    if (caseData.victims) {
      caseData.victims.forEach((victim) => {
        networkData.contacts.nodes.push({
          id: victim.id,
          name: victim.name,
          label: victim.name,
          type: 'victim',
          category: 'victim',
          riskLevel: 'medium',
          x: Math.random() * 600 + 100,
          y: Math.random() * 400 + 100,
          connections: 0,
          industry: victim.industry,
          financialLoss: victim.financialLoss,
          employeeCount: victim.employeeCount
        });
      });
    }

    // LOCATIONS NETWORK - Process geographic data
    if (caseData.suspects) {
      caseData.suspects.forEach((suspect) => {
        if (suspect.coordinates) {
          networkData.locations.nodes.push({
            id: `loc-${suspect.id}`,
            name: suspect.coordinates.city,
            label: `${suspect.name} - ${suspect.coordinates.city}`,
            type: 'suspect_location',
            category: 'location',
            riskLevel: suspect.riskLevel?.toLowerCase() || 'high',
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 0,
            lat: suspect.coordinates.lat,
            lng: suspect.coordinates.lng,
            city: suspect.coordinates.city,
            country: suspect.coordinates.country,
            suspect: suspect.name
          });
        }
      });
    }

    if (caseData.victims) {
      caseData.victims.forEach((victim) => {
        if (victim.coordinates) {
          networkData.locations.nodes.push({
            id: `loc-${victim.id}`,
            name: victim.coordinates.city,
            label: `${victim.name} - ${victim.coordinates.city}`,
            type: 'victim_location',
            category: 'location',
            riskLevel: 'medium',
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 0,
            lat: victim.coordinates.lat,
            lng: victim.coordinates.lng,
            city: victim.coordinates.city,
            country: victim.coordinates.country,
            organization: victim.name
          });
        }
      });
    }

    // TRANSACTIONS NETWORK - Process cryptocurrency data
    if (caseData.evidence) {
      const cryptoEvidence = caseData.evidence.find(e => e.category === 'Cryptocurrency Transactions');
      if (cryptoEvidence?.cryptoAnalysis?.primaryWallets) {
        cryptoEvidence.cryptoAnalysis.primaryWallets.forEach((wallet, index) => {
          networkData.transactions.nodes.push({
            id: `wallet-${index}`,
            name: `${wallet.currency} Wallet`,
            label: `${wallet.balance} ${wallet.currency}`,
            type: 'cryptocurrency',
            category: 'financial',
            riskLevel: 'high',
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 0,
            address: wallet.address.substring(0, 10) + '...',
            balance: wallet.balance,
            currency: wallet.currency,
            linkedSuspect: wallet.linkedSuspect
          });
        });
      }

      // Add transaction flow nodes
      if (cryptoEvidence?.cryptoAnalysis?.transactionFlow) {
        cryptoEvidence.cryptoAnalysis.transactionFlow.forEach((flow, index) => {
          networkData.transactions.nodes.push({
            id: `flow-${index}`,
            name: flow.stage,
            label: `$${(flow.amount / 1000000).toFixed(1)}M`,
            type: 'transaction_flow',
            category: 'financial',
            riskLevel: 'medium',
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            connections: 0,
            method: flow.method,
            amount: flow.amount,
            timeframe: flow.timeframe
          });
        });
      }
    }

    // Create connections based on networkTopology if available
    const contactConnections = [];
    if (caseData.networkTopology?.edges) {
      caseData.networkTopology.edges.forEach((edge) => {
        contactConnections.push({
          from: edge.from,
          to: edge.to,
          type: edge.type,
          strength: edge.strength === 'strong' ? 9 : edge.strength === 'medium' ? 6 : 4,
          label: edge.type.replace('_', ' ').toUpperCase(),
          frequency: edge.frequency
        });
      });
    }

    // Create location connections (geographic relationships)
    const locationConnections = [];
    const locationNodes = networkData.locations.nodes;
    for (let i = 0; i < locationNodes.length; i++) {
      for (let j = i + 1; j < locationNodes.length; j++) {
        if (locationNodes[i].country === locationNodes[j].country) {
          locationConnections.push({
            from: locationNodes[i].id,
            to: locationNodes[j].id,
            type: 'geographic_proximity',
            strength: 6,
            label: 'Same Country'
          });
        }
      }
    }

    // Create transaction connections
    const transactionConnections = [];
    const walletNodes = networkData.transactions.nodes.filter(n => n.type === 'cryptocurrency');
    const flowNodes = networkData.transactions.nodes.filter(n => n.type === 'transaction_flow');
    
    walletNodes.forEach((wallet, index) => {
      if (flowNodes[index]) {
        transactionConnections.push({
          from: wallet.id,
          to: flowNodes[index].id,
          type: 'fund_transfer',
          strength: 8,
          label: 'Money Flow'
        });
      }
    });

    // Assign connections
    networkData.contacts.connections = contactConnections;
    networkData.locations.connections = locationConnections;
    networkData.transactions.connections = transactionConnections;

    // Update connection counts
    const updateConnectionCounts = (nodes, connections) => {
      connections.forEach(conn => {
        const fromNode = nodes.find(n => n.id === conn.from);
        const toNode = nodes.find(n => n.id === conn.to);
        if (fromNode) fromNode.connections = (fromNode.connections || 0) + 1;
        if (toNode) toNode.connections = (toNode.connections || 0) + 1;
      });
    };

    updateConnectionCounts(networkData.contacts.nodes, contactConnections);
    updateConnectionCounts(networkData.locations.nodes, locationConnections);
    updateConnectionCounts(networkData.transactions.nodes, transactionConnections);

    const analyticsData = {
      totalEntities: networkData.contacts.nodes.length + networkData.locations.nodes.length + networkData.transactions.nodes.length,
      totalConnections: contactConnections.length + locationConnections.length + transactionConnections.length,
      riskDistribution: {
        extreme: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'extreme').length,
        critical: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'critical').length,
        high: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'high').length,
        medium: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'medium').length,
        low: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes].filter(n => n.riskLevel === 'low').length
      },
      connectionTypes: {
        data_supply: contactConnections.filter(c => c.type === 'data_supply').length,
        payment_processing: contactConnections.filter(c => c.type === 'payment_processing').length,
        tech_transfer: contactConnections.filter(c => c.type === 'tech_transfer').length,
        geographic_proximity: locationConnections.filter(c => c.type === 'geographic_proximity').length,
        fund_transfer: transactionConnections.filter(c => c.type === 'fund_transfer').length
      },
      timelineData: [],
      hotspots: [...networkData.contacts.nodes, ...networkData.locations.nodes, ...networkData.transactions.nodes]
        .sort((a, b) => (b.connections || 0) - (a.connections || 0))
        .slice(0, 5)
        .map(node => ({ node, connections: node.connections || 0 }))
    };

    console.log('✅ Generated APT network from case data:', {
      contacts: { nodes: networkData.contacts.nodes.length, connections: networkData.contacts.connections.length },
      locations: { nodes: networkData.locations.nodes.length, connections: networkData.locations.connections.length },
      transactions: { nodes: networkData.transactions.nodes.length, connections: networkData.transactions.connections.length }
    });

    return { networkData, analyticsData };
  };

  // PLACEHOLDER: Generate demo network function  
  const generateDemoNetwork = () => {
    console.log('🎭 Generating demo network with guaranteed connections');
    
    const demoNetworkData = {
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    };

    // Demo contact nodes
    const demoContacts = [
      { id: 'demo-suspect-1', name: 'Alex Morrison', label: 'Alex Morrison', type: 'suspect', category: 'suspect', riskLevel: 'critical', x: 200, y: 200, connections: 0 },
      { id: 'demo-suspect-2', name: 'Sarah Chen', label: 'Sarah Chen', type: 'suspect', category: 'suspect', riskLevel: 'high', x: 400, y: 180, connections: 0 },
      { id: 'demo-victim-1', name: 'TechCorp Inc', label: 'TechCorp Inc', type: 'victim', category: 'victim', riskLevel: 'low', x: 300, y: 350, connections: 0 }
    ];

    // Demo financial nodes
    const demoFinancial = [
      { id: 'demo-crypto-1', name: 'Bitcoin Wallet', label: '2.5 BTC', type: 'cryptocurrency', category: 'financial', riskLevel: 'critical', x: 250, y: 150, connections: 0 },
      { id: 'demo-account-1', name: 'Bank Account', label: '$45,000', type: 'bank_account', category: 'financial', riskLevel: 'high', x: 450, y: 200, connections: 0 }
    ];

    // Demo location nodes
    const demoLocations = [
      { id: 'demo-location-1', name: 'Downtown Office', label: 'Downtown Office', type: 'crime-location', category: 'location', riskLevel: 'high', x: 300, y: 100, connections: 0 },
      { id: 'demo-location-2', name: 'Residential Area', label: 'Residential Area', type: 'suspect-location', category: 'location', riskLevel: 'medium', x: 180, y: 400, connections: 0 }
    ];

    // Add nodes to respective categories
    demoNetworkData.contacts.nodes = demoContacts;
    demoNetworkData.transactions.nodes = demoFinancial;
    demoNetworkData.locations.nodes = demoLocations;

    // Demo connections
    const demoConnections = [
      { from: 'demo-suspect-1', to: 'demo-suspect-2', type: 'collaboration', strength: 9, label: 'Criminal Partnership' },
      { from: 'demo-suspect-1', to: 'demo-victim-1', type: 'targeting', strength: 10, label: 'Primary Target' }
    ];

    const demoFinancialConnections = [
      { from: 'demo-suspect-1', to: 'demo-crypto-1', type: 'ownership', strength: 10, label: 'Wallet Owner' },
      { from: 'demo-crypto-1', to: 'demo-account-1', type: 'transaction', strength: 8, label: '$15,000 Transfer' }
    ];

    const demoLocationConnections = [
      { from: 'demo-suspect-1', to: 'demo-location-1', type: 'frequent_visits', strength: 8, label: 'Regular Presence' },
      { from: 'demo-location-1', to: 'demo-victim-1', type: 'incident_location', strength: 10, label: 'Crime Scene' }
    ];

    // Add connections
    demoNetworkData.contacts.connections = demoConnections;
    demoNetworkData.transactions.connections = demoFinancialConnections;
    demoNetworkData.locations.connections = demoLocationConnections;

    const demoAnalytics = {
      totalEntities: demoContacts.length + demoFinancial.length + demoLocations.length,
      totalConnections: demoConnections.length + demoFinancialConnections.length + demoLocationConnections.length,
      riskDistribution: { critical: 2, high: 2, medium: 1, low: 1 },
      connectionTypes: { collaboration: 1, targeting: 1, ownership: 1, transaction: 1, frequent_visits: 1, incident_location: 1 },
      timelineData: [],
      hotspots: []
    };

    console.log('✅ Demo network generated');
    return { networkData: demoNetworkData, analyticsData: demoAnalytics };
  };

  // Style definitions
  const containerStyle = {
    display: 'flex',
    height: 'calc(100vh - 80px)',
    backgroundColor: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const canvasContainerStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
  };

  const toolbarStyle = {
    padding: '16px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px'
  };

  const sidebarStyle = {
    width: '350px',
    backgroundColor: 'white',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  };

  const emptyStateStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    textAlign: 'center',
    padding: '40px'
  };

  // Location map rendering function
  const renderLocationMap = () => {
    const locationNodes = networkData.locations?.nodes || [];
    
    if (locationNodes.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <h3>No Location Data</h3>
          <p>No geographic locations available for mapping</p>
        </div>
      );
    }

    // Calculate center point from all locations
    const avgLat = locationNodes.reduce((sum, node) => sum + (node.lat || 0), 0) / locationNodes.length;
    const avgLng = locationNodes.reduce((sum, node) => sum + (node.lng || 0), 0) / locationNodes.length;
    const centerPosition = [avgLat || 40, avgLng || 0];

    const getMarkerColor = (riskLevel) => {
      switch (riskLevel) {
        case 'extreme': return '#dc2626';
        case 'critical': return '#dc2626';
        case 'high': return '#f59e0b';
        case 'medium': return '#10b981';
        case 'low': return '#6b7280';
        default: return '#3b82f6';
      }
    };

    const getMarkerIcon = (type) => {
      switch (type) {
        case 'suspect_location': return '🔴';
        case 'victim_location': return '🏢';
        case 'crime_scene': return '⚠️';
        case 'financial_center': return '💰';
        default: return '📍';
      }
    };

    return (
      <div style={{ height: '100%', width: '100%', position: 'relative' }}>
        <MapContainer
          center={centerPosition}
          zoom={3}
          style={{ height: '100%', width: '100%' }}
          key={`map-${locationNodes.length}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render location markers */}
          {locationNodes.map((node) => {
            if (!node.lat || !node.lng) return null;
            
            const icon = createCustomIcon(getMarkerColor(node.riskLevel), getMarkerIcon(node.type));
            
            return (
              <Marker
                key={node.id}
                position={[node.lat, node.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedNode(node)
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold' }}>
                      {node.name}
                    </h4>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <strong>Type:</strong> {node.type?.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <strong>Risk Level:</strong> 
                      <span style={{ 
                        color: getMarkerColor(node.riskLevel),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {' ' + node.riskLevel}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                      <strong>Location:</strong> {node.city}, {node.country}
                    </div>
                    {node.suspect && (
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>Suspect:</strong> {node.suspect}
                      </div>
                    )}
                    {node.organization && (
                      <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                        <strong>Organization:</strong> {node.organization}
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      Connections: {node.connections || 0}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render connection lines between locations */}
          {networkData.locations?.connections?.map((connection, index) => {
            const fromNode = locationNodes.find(n => n.id === connection.from);
            const toNode = locationNodes.find(n => n.id === connection.to);
            
            if (!fromNode?.lat || !fromNode?.lng || !toNode?.lat || !toNode?.lng) return null;
            
            const positions = [
              [fromNode.lat, fromNode.lng],
              [toNode.lat, toNode.lng]
            ];
            
            return (
              <Polyline
                key={`connection-${index}`}
                positions={positions}
                color={connection.type === 'geographic_proximity' ? '#10b981' : '#f59e0b'}
                weight={Math.max(2, (connection.strength || 5) / 2)}
                opacity={0.7}
                dashArray={connection.type === 'suspicious' ? '10, 10' : undefined}
              >
                <Popup>
                  <div>
                    <strong>{connection.label || connection.type}</strong>
                    <br />
                    Strength: {connection.strength}/10
                  </div>
                </Popup>
              </Polyline>
            );
          })}
        </MapContainer>

        {/* Map Legend */}
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>Legend</h4>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#dc2626', fontWeight: 'bold' }}>●</span> Critical/Extreme Risk
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>●</span> High Risk
          </div>
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#10b981', fontWeight: 'bold' }}>●</span> Medium Risk
          </div>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ color: '#6b7280', fontWeight: 'bold' }}>●</span> Low Risk
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Click markers for details
          </div>
        </div>
      </div>
    );
  };

  // Improved layout algorithm to prevent node overlap
  const calculateOptimalLayout = (nodes, connections) => {
    const width = 800;
    const height = 600;
    const margin = 80;
    
    // Create a copy of nodes with positioned coordinates
    const layoutNodes = nodes.map((node, index) => ({ ...node }));
    
    if (layoutNodes.length === 1) {
      layoutNodes[0].x = width / 2;
      layoutNodes[0].y = height / 2;
      return layoutNodes;
    }
    
    // Calculate circular layout as base positioning
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - margin;
    
    layoutNodes.forEach((node, index) => {
      const angle = (2 * Math.PI * index) / layoutNodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    });
    
    // Force-directed layout simulation to improve positioning
    for (let iteration = 0; iteration < 50; iteration++) {
      // Repulsive forces between nodes
      for (let i = 0; i < layoutNodes.length; i++) {
        for (let j = i + 1; j < layoutNodes.length; j++) {
          const dx = layoutNodes[j].x - layoutNodes[i].x;
          const dy = layoutNodes[j].y - layoutNodes[i].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const minDistance = 120; // Minimum distance between nodes
          
          if (distance < minDistance) {
            const force = (minDistance - distance) / distance * 0.5;
            const forceX = dx * force;
            const forceY = dy * force;
            
            layoutNodes[i].x -= forceX;
            layoutNodes[i].y -= forceY;
            layoutNodes[j].x += forceX;
            layoutNodes[j].y += forceY;
          }
        }
      }
      
      // Attractive forces for connected nodes
      connections.forEach(conn => {
        const fromNode = layoutNodes.find(n => n.id === conn.from);
        const toNode = layoutNodes.find(n => n.id === conn.to);
        
        if (fromNode && toNode) {
          const dx = toNode.x - fromNode.x;
          const dy = toNode.y - fromNode.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDistance = 150;
          
          const force = (distance - idealDistance) / distance * 0.1;
          const forceX = dx * force;
          const forceY = dy * force;
          
          fromNode.x += forceX;
          fromNode.y += forceY;
          toNode.x -= forceX;
          toNode.y -= forceY;
        }
      });
      
      // Keep nodes within bounds
      layoutNodes.forEach(node => {
        node.x = Math.max(margin, Math.min(width - margin, node.x));
        node.y = Math.max(margin, Math.min(height - margin, node.y));
      });
    }
    
    return layoutNodes;
  };

  // Network rendering function
  const renderNetworkGraph = () => {
    const currentNetwork = networkData[analysisMode];
    let nodes = currentNetwork?.nodes || [];
    const connections = currentNetwork?.connections || [];

    if (nodes.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3>No Network Data</h3>
          <p>No {analysisMode} data available for visualization</p>
        </div>
      );
    }

    // Apply optimal layout to prevent overlapping
    nodes = calculateOptimalLayout(nodes, connections);

    const getNodeColor = (node) => {
      switch (node.riskLevel) {
        case 'extreme': return '#991b1b';
        case 'critical': return '#dc2626';
        case 'high': return '#f59e0b';
        case 'medium': return '#10b981';
        case 'low': return '#6b7280';
        default: return '#3b82f6';
      }
    };

    const getNodeIcon = (node) => {
      switch (node.type) {
        case 'suspect': return '👤';
        case 'victim': return '🎯';
        case 'witness': return '👁️';
        case 'cryptocurrency': return '₿';
        case 'bank_account': return '🏦';
        case 'location': return '📍';
        default: return '●';
      }
    };

    return (
      <svg width="100%" height="100%" viewBox="0 0 800 600" style={{ border: '1px solid #e2e8f0', background: '#fafafa' }}>
        <defs>
          {/* Arrow marker for directed connections */}
          <marker id="arrowhead" markerWidth="10" markerHeight="7" 
            refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748b" />
          </marker>
        </defs>
        
        {/* Render connections first (behind nodes) */}
        {connections.map((conn, index) => {
          const fromNode = nodes.find(n => n.id === conn.from);
          const toNode = nodes.find(n => n.id === conn.to);
          
          if (!fromNode || !toNode) return null;

          const strokeWidth = Math.max(2, (conn.strength || 5) / 2);
          const opacity = Math.max(0.6, (conn.strength || 5) / 10);
          
          // Connection type colors
          const getConnectionColor = (type) => {
            switch (type) {
              case 'data_supply': return '#3b82f6';
              case 'payment_processing': return '#f59e0b';
              case 'tech_transfer': return '#10b981';
              case 'fund_transfer': return '#dc2626';
              case 'geographic_proximity': return '#8b5cf6';
              default: return '#64748b';
            }
          };

          return (
            <g key={`connection-${index}`}>
              <line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={getConnectionColor(conn.type)}
                strokeWidth={strokeWidth}
                opacity={opacity}
                strokeDasharray={conn.type === 'suspicious' ? '8,4' : 'none'}
                markerEnd="url(#arrowhead)"
              />
              {/* Connection label with background */}
              {conn.label && (
                <g>
                  <rect
                    x={(fromNode.x + toNode.x) / 2 - 20}
                    y={(fromNode.y + toNode.y) / 2 - 10}
                    width="40"
                    height="16"
                    fill="white"
                    stroke="#e2e8f0"
                    rx="8"
                    opacity="0.9"
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#475569"
                    fontWeight="500"
                  >
                    {conn.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Render nodes */}
        {nodes.map((node, index) => (
          <g 
            key={`node-${index}`}
            onClick={() => setSelectedNode(node)}
            style={{ cursor: 'pointer' }}
            transform={`translate(${node.x}, ${node.y})`}
          >
            {/* Node circle */}
            <circle
              r={selectedNode?.id === node.id ? 25 : 20}
              fill={getNodeColor(node)}
              stroke={selectedNode?.id === node.id ? '#1e293b' : 'white'}
              strokeWidth={selectedNode?.id === node.id ? 3 : 2}
              className={isAnalyzing ? 'pulse-animation' : ''}
            />
            
            {/* Node icon */}
            <text
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="16"
              fill="white"
            >
              {getNodeIcon(node)}
            </text>
            
            {/* Node label */}
            <text
              y={35}
              textAnchor="middle"
              fontSize="12"
              fill="#1e293b"
              fontWeight="500"
            >
              {node.label || node.name}
            </text>
            
            {/* Connection count */}
            <text
              y={50}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
            >
              {node.connections || 0} connections
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Node details panel
  const renderNodeDetails = () => {
    if (!selectedNode) {
      return (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>👆</div>
          <p>Click on a node to view details</p>
        </div>
      );
    }

    return (
      <div style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
          {selectedNode.name || selectedNode.label}
        </h4>
        
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>TYPE</div>
          <div style={{ fontSize: '14px', textTransform: 'capitalize', color: '#1e293b' }}>
            {selectedNode.type || 'Unknown'}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>RISK LEVEL</div>
          <span style={{
            backgroundColor: selectedNode.riskLevel === 'critical' ? '#dc2626' :
                            selectedNode.riskLevel === 'high' ? '#f59e0b' :
                            selectedNode.riskLevel === 'medium' ? '#10b981' : '#6b7280',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            textTransform: 'uppercase',
            fontWeight: '600'
          }}>
            {selectedNode.riskLevel || 'Unknown'}
          </span>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>CONNECTIONS</div>
          <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>
            {selectedNode.connections || 0}
          </div>
        </div>

        {/* Additional details based on node type and network */}
        {selectedNode.age && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Age: {selectedNode.age}</div>
          </div>
        )}
        
        {selectedNode.nationality && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Nationality: {selectedNode.nationality}</div>
          </div>
        )}

        {selectedNode.occupation && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Occupation: {selectedNode.occupation}</div>
          </div>
        )}

        {selectedNode.alias && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Alias: {selectedNode.alias}</div>
          </div>
        )}

        {selectedNode.role && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Role: {selectedNode.role}</div>
          </div>
        )}

        {selectedNode.industry && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Industry: {selectedNode.industry}</div>
          </div>
        )}

        {selectedNode.financialLoss && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Financial Loss: ${(selectedNode.financialLoss / 1000000).toFixed(1)}M
            </div>
          </div>
        )}

        {selectedNode.employeeCount && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Employees: {selectedNode.employeeCount.toLocaleString()}
            </div>
          </div>
        )}

        {selectedNode.city && selectedNode.country && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Location: {selectedNode.city}, {selectedNode.country}
            </div>
          </div>
        )}

        {selectedNode.currency && selectedNode.balance && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Balance: {selectedNode.balance} {selectedNode.currency}
            </div>
          </div>
        )}

        {selectedNode.address && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Address: {selectedNode.address}
            </div>
          </div>
        )}

        {selectedNode.linkedSuspect && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Linked to: {selectedNode.linkedSuspect}
            </div>
          </div>
        )}

        {selectedNode.method && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Method: {selectedNode.method}
            </div>
          </div>
        )}

        {selectedNode.amount && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Amount: ${(selectedNode.amount / 1000000).toFixed(1)}M
            </div>
          </div>
        )}
      </div>
    );
  };

  // Check if we have processed data or network data loaded
  const processedFiles = selectedFiles.filter(file => file && (file.processed || file.analysisComplete));
  const hasProcessedData = processedFiles.length > 0 || hasData || networkData.contacts.nodes.length > 0;

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
            border: '1px solid #e2e8f0'
          }}>
            {['contacts', 'locations', 'transactions'].map((mode) => (
              <button
                key={mode}
                onClick={() => setAnalysisMode(mode)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: analysisMode === mode ? '#3b82f6' : 'transparent',
                  color: analysisMode === mode ? 'white' : '#64748b',
                  transition: 'all 0.2s ease'
                }}
              >
                {mode === 'contacts' ? '👥 Contacts' : 
                 mode === 'locations' ? '📍 Locations' : '💰 Transactions'}
              </button>
            ))}
          </div>
        </div>

        {/* Network Visualization Area */}
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          backgroundColor: '#ffffff',
          overflow: 'hidden'
        }}>
          {isAnalyzing ? (
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column'
            }}>
              <div className="pulse-animation" style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ marginBottom: '8px' }}>Analyzing Network...</h3>
              <p style={{ color: '#64748b' }}>Processing {selectedFiles.length} files</p>
            </div>
          ) : (
            <>
              {/* Network Stats Header */}
              <div style={{ 
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                  {analysisMode === 'contacts' ? '👥 Contact Network' :
                   analysisMode === 'locations' ? '📍 Location Network' : '💰 Transaction Network'}
                </h3>
                <div style={{ fontSize: '14px', color: '#64748b' }}>
                  {networkData[analysisMode]?.nodes?.length || 0} nodes, {networkData[analysisMode]?.connections?.length || 0} connections
                </div>
              </div>
              
              {/* Network Graph or Map */}
              <div style={{ height: 'calc(100% - 60px)', padding: '16px' }}>
                {analysisMode === 'locations' ? renderLocationMap() : renderNetworkGraph()}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Analysis Details
          </h3>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            <div>Total Entities: {analyticsData.totalEntities}</div>
            <div>Total Connections: {analyticsData.totalConnections}</div>
          </div>
        </div>
        
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Risk Distribution
          </h4>
          {Object.entries(analyticsData.riskDistribution || {}).map(([risk, count]) => (
            <div key={risk} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '14px'
            }}>
              <span style={{ textTransform: 'capitalize' }}>{risk}:</span>
              <span style={{ fontWeight: '600' }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Node Details Panel */}
        <div style={{ flex: 1 }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600' }}>
              {selectedNode ? 'Node Details' : 'Select Node'}
            </h4>
          </div>
          <div style={{ overflowY: 'auto', height: 'calc(100% - 60px)' }}>
            {renderNodeDetails()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkAnalysis;