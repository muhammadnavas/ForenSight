import L from 'leaflet';
import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';
import useCaseFileIntegration from '../hooks/useCaseFileIntegration.js';
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
    
    setTimeout(async () => {
      try {
        // Generate analysis results based on file types
        const analysisResults = await generateAnalysisFromFiles(fileObjects);
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
  const generateAnalysisFromFiles = async (fileObjects) => {
    console.log('🔧 Generating enhanced analysis from files:', fileObjects.length);
    
    // First, try to use actual case data if available from context
    if (hasData && caseData) {
      console.log('📊 Using actual case data from context for network analysis');
      return generateNetworkFromCaseData();
    }
    
    // Try to process actual file content for JSON files first
    for (const file of fileObjects) {
      const fileName = file.originalName || file.filename || file.name || '';
      if (fileName.toLowerCase().endsWith('.json')) {
        console.log('📄 Found JSON file, attempting to process real content:', fileName);
        
        try {
          let jsonContent = null;
          
          // Try to get file content from backend API
          const fileId = file.fileId || file._id;
          if (selectedCase && fileId) {
            try {
              const response = await fetch(`http://localhost:5000/api/cases/${selectedCase.id}/files/${fileId}/content`);
              if (response.ok) {
                const contentResponse = await response.json();
                if (contentResponse.success && contentResponse.content) {
                  jsonContent = typeof contentResponse.content === 'string' 
                    ? JSON.parse(contentResponse.content) 
                    : contentResponse.content;
                  console.log('✅ Successfully fetched JSON content from backend');
                }
              }
            } catch (fetchError) {
              console.log('⚠️ Could not fetch from backend, trying fallback methods');
            }
          }
          
          // Fallback: try to load demo case data for testing
          if (!jsonContent && fileName.includes('apt-case-003')) {
            try {
              const response = await fetch('/apt-case-003.json');
              if (response.ok) {
                jsonContent = await response.json();
                console.log('✅ Loaded demo case data from public folder');
              }
            } catch (e) {
              console.log('⚠️ Could not load demo file');
            }
          }
          
          // If we have JSON content, process it directly
          if (jsonContent && (jsonContent.suspects || jsonContent.victims || jsonContent.evidence)) {
            console.log('🎯 Processing real case data from JSON file:', {
              suspects: jsonContent.suspects?.length || 0,
              victims: jsonContent.victims?.length || 0,
              evidence: jsonContent.evidence?.length || 0
            });
            return generateNetworkFromJSONData(jsonContent);
          }
        } catch (error) {
          console.log('❌ Error processing JSON file:', error.message);
        }
      }
    }
    
    // Generate realistic mock network data based on file types as fallback
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

    if (fileObjects.length > 0) {
      console.log('🎯 Generating mock network data based on uploaded files');
      
      // Analyze files to determine what type of mock data to generate
      const fileTypes = fileObjects.map(file => {
        const filename = file.originalName || file.filename || file.name || '';
        return {
          name: filename,
          type: getFileType(filename),
          size: file.size || file.sizeBytes || 0
        };
      });

      console.log('📂 File type analysis:', fileTypes);

      // Generate nodes and connections based on file types
      generateMockNetworkFromFiles(fileTypes, networkData, analyticsData);
    }

    console.log('✅ Generated mock network structure with', analyticsData.totalEntities, 'entities and', analyticsData.totalConnections, 'connections');
    return { networkData, analyticsData };
  };

  // Generate realistic mock network data based on file types
  const generateMockNetworkFromFiles = (fileTypes, networkData, analyticsData) => {
    console.log('🎭 Generating mock network data for file types:', fileTypes.map(f => f.type));

    // Base entities that will be referenced across different file types
    const baseEntities = {
      suspects: [],
      contacts: [],
      locations: [],
      wallets: []
    };

    // Generate different mock data based on file types present
    fileTypes.forEach((file, fileIndex) => {
      switch (file.type) {
        case 'contacts':
          generateMockContactNetwork(file, baseEntities, networkData, analyticsData, fileIndex);
          break;
        case 'financial':
          generateMockFinancialNetwork(file, baseEntities, networkData, analyticsData, fileIndex);
          break;
        case 'location':
          generateMockLocationNetwork(file, baseEntities, networkData, analyticsData, fileIndex);
          break;
        case 'communications':
          generateMockCommunicationNetwork(file, baseEntities, networkData, analyticsData, fileIndex);
          break;
        case 'mobile':
          generateMockMobileForensicNetwork(file, baseEntities, networkData, analyticsData, fileIndex);
          break;
        case 'data':
        default:
          generateMockDataNetwork(file, baseEntities, networkData, analyticsData, fileIndex);
          break;
      }
    });

    // Generate cross-file connections for more realistic networks
    generateCrossFileConnections(baseEntities, networkData, analyticsData);

    // Calculate final analytics
    calculateNetworkAnalytics(networkData, analyticsData);
  };

  // Generate mock contact network (phone databases, contact lists)
  const generateMockContactNetwork = (file, baseEntities, networkData, analyticsData, fileIndex) => {
    const contactNames = [
      'Michael Rodriguez', 'Sarah Chen', 'David Kim', 'Maria Santos', 'James Wilson',
      'Lisa Zhang', 'Robert Johnson', 'Anna Petrov', 'Carlos Mendez', 'Jennifer Lee'
    ];
    
    const phoneNumbers = [
      '+1-555-0123', '+1-555-0234', '+1-555-0345', '+1-555-0456', '+1-555-0567',
      '+1-555-0678', '+1-555-0789', '+1-555-0890', '+1-555-0901', '+1-555-1012'
    ];

    // Create contact nodes
    for (let i = 0; i < Math.min(contactNames.length, 8); i++) {
      const riskLevels = ['low', 'low', 'medium', 'medium', 'high', 'critical'];
      const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
      
      const contact = {
        id: `contact_${fileIndex}_${i}`,
        name: contactNames[i],
        label: contactNames[i],
        phone: phoneNumbers[i],
        email: `${contactNames[i].toLowerCase().replace(' ', '.')}@email.com`,
        type: i < 2 ? 'suspect' : 'contact',
        category: i < 2 ? 'suspect' : 'contact',
        riskLevel: i < 2 ? 'high' : riskLevel,
        lastContact: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        source: file.name,
        fileType: file.type,
        callFrequency: Math.floor(Math.random() * 50) + 5,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 0
      };

      networkData.contacts.nodes.push(contact);
      if (i < 2) baseEntities.suspects.push(contact);
      else baseEntities.contacts.push(contact);
      
      analyticsData.riskDistribution[contact.riskLevel] = (analyticsData.riskDistribution[contact.riskLevel] || 0) + 1;
    }

    // Generate call/message connections between contacts
    const nodes = networkData.contacts.nodes.slice(-8); // Last 8 nodes added
    for (let i = 0; i < nodes.length - 1; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.5) { // 50% chance of connection
          const connectionTypes = ['phone_call', 'text_message', 'email', 'encrypted_message', 'video_call'];
          const connection = {
            from: nodes[i].id,
            to: nodes[j].id,
            type: connectionTypes[Math.floor(Math.random() * connectionTypes.length)],
            strength: Math.floor(Math.random() * 10) + 1,
            frequency: Math.floor(Math.random() * 30) + 1,
            lastContact: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
            label: `${Math.floor(Math.random() * 30) + 1} contacts`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          networkData.contacts.connections.push(connection);
          nodes[i].connections = (nodes[i].connections || 0) + 1;
          nodes[j].connections = (nodes[j].connections || 0) + 1;
        }
      }
    }
  };

  // Generate mock financial network (bank records, crypto wallets)
  const generateMockFinancialNetwork = (file, baseEntities, networkData, analyticsData, fileIndex) => {
    const walletTypes = ['Bitcoin', 'Ethereum', 'Litecoin', 'Monero'];
    const accountTypes = ['Checking', 'Savings', 'Business', 'Offshore'];
    
    // Create wallet/account nodes
    for (let i = 0; i < 6; i++) {
      const isWallet = Math.random() < 0.7;
      const amount = Math.floor(Math.random() * 100000) + 1000;
      
      const financialNode = {
        id: `financial_${fileIndex}_${i}`,
        name: isWallet ? `${walletTypes[i % walletTypes.length]} Wallet` : `${accountTypes[i % accountTypes.length]} Account`,
        label: isWallet ? `${amount} ${walletTypes[i % walletTypes.length].slice(0,3)}` : `$${amount.toLocaleString()}`,
        type: isWallet ? 'cryptocurrency' : 'bank_account',
        category: 'financial',
        riskLevel: amount > 50000 ? 'critical' : amount > 20000 ? 'high' : 'medium',
        balance: amount,
        currency: isWallet ? walletTypes[i % walletTypes.length] : 'USD',
        lastActivity: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        source: file.name,
        fileType: file.type,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 0
      };

      networkData.transactions.nodes.push(financialNode);
      baseEntities.wallets.push(financialNode);
      analyticsData.riskDistribution[financialNode.riskLevel] = (analyticsData.riskDistribution[financialNode.riskLevel] || 0) + 1;
    }

    // Generate transaction connections - improved logic
    const nodes = networkData.transactions.nodes.slice(-6);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.6) { // 60% chance of connection for financial data
          const transactionTypes = ['transfer', 'deposit', 'withdrawal', 'exchange', 'suspicious_activity'];
          const amount = Math.floor(Math.random() * 50000) + 500;
          const connection = {
            from: nodes[i].id,
            to: nodes[j].id,
            type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
            strength: Math.floor(Math.random() * 8) + 3,
            amount: amount,
            label: `$${amount.toLocaleString()}`,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          networkData.transactions.connections.push(connection);
          nodes[i].connections = (nodes[i].connections || 0) + 1;
          nodes[j].connections = (nodes[j].connections || 0) + 1;
        }
      }
    }
  };

  // Generate mock location network (GPS data, IP geolocation)
  const generateMockLocationNetwork = (file, baseEntities, networkData, analyticsData, fileIndex) => {
    const cities = [
      { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago, IL', lat: 41.8781, lng: -87.6298 },
      { name: 'Miami, FL', lat: 25.7617, lng: -80.1918 },
      { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
      { name: 'Dallas, TX', lat: 32.7767, lng: -96.7970 }
    ];

    const locationTypes = ['residence', 'office', 'meeting_point', 'crime_scene'];

    for (let i = 0; i < 5; i++) {
      const city = cities[i % cities.length];
      const locationType = locationTypes[i % locationTypes.length];
      
      const location = {
        id: `location_${fileIndex}_${i}`,
        name: `${city.name} - ${locationType}`,
        label: city.name,
        latitude: city.lat + (Math.random() - 0.5) * 0.1,
        longitude: city.lng + (Math.random() - 0.5) * 0.1,
        address: `${Math.floor(Math.random() * 9999) + 1} Main St, ${city.name}`,
        type: locationType,
        category: locationType === 'crime_scene' ? 'crime' : 'location',
        riskLevel: locationType === 'crime_scene' ? 'critical' : locationType === 'meeting_point' ? 'high' : 'medium',
        significance: Math.floor(Math.random() * 10) + 1,
        source: file.name,
        fileType: file.type,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 0
      };

      networkData.locations.nodes.push(location);
      baseEntities.locations.push(location);
      analyticsData.riskDistribution[location.riskLevel] = (analyticsData.riskDistribution[location.riskLevel] || 0) + 1;
    }

    // Generate movement patterns between locations - improved connections
    const nodes = networkData.locations.nodes.slice(-5);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.7) { // 70% chance of location connection
          const movementTypes = ['movement', 'travel', 'presence', 'surveillance', 'proximity'];
          const connection = {
            from: nodes[i].id,
            to: nodes[j].id,
            type: movementTypes[Math.floor(Math.random() * movementTypes.length)],
            strength: Math.floor(Math.random() * 7) + 2,
            frequency: Math.floor(Math.random() * 20) + 1,
            label: `${Math.floor(Math.random() * 10) + 1} visits`,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          networkData.locations.connections.push(connection);
          nodes[i].connections = (nodes[i].connections || 0) + 1;
          nodes[j].connections = (nodes[j].connections || 0) + 1;
        }
      }
    }
  };

  // Generate mock communication network (network traffic, logs)
  const generateMockCommunicationNetwork = (file, baseEntities, networkData, analyticsData, fileIndex) => {
    const ipAddresses = [
      '192.168.1.100', '10.0.0.50', '172.16.0.25', '203.45.67.89', 
      '198.51.100.42', '85.123.45.67', '124.56.78.90'
    ];

    // Create network endpoint nodes
    for (let i = 0; i < ipAddresses.length; i++) {
      const isInternal = ipAddresses[i].startsWith('192.168') || ipAddresses[i].startsWith('10.0') || ipAddresses[i].startsWith('172.16');
      
      const endpoint = {
        id: `comm_${fileIndex}_${i}`,
        name: `${ipAddresses[i]}`,
        label: isInternal ? `Internal: ${ipAddresses[i]}` : `External: ${ipAddresses[i]}`,
        type: 'network_endpoint',
        category: isInternal ? 'internal' : 'external',
        riskLevel: isInternal ? 'low' : Math.random() < 0.3 ? 'high' : 'medium',
        ipAddress: ipAddresses[i],
        trafficVolume: Math.floor(Math.random() * 1000000) + 10000,
        source: file.name,
        fileType: file.type,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 0
      };

      networkData.contacts.nodes.push(endpoint);
      analyticsData.riskDistribution[endpoint.riskLevel] = (analyticsData.riskDistribution[endpoint.riskLevel] || 0) + 1;
    }

    // Generate network connections
    const nodes = networkData.contacts.nodes.slice(-ipAddresses.length);
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (Math.random() < 0.3) {
          const connection = {
            from: nodes[i].id,
            to: nodes[j].id,
            type: 'network_traffic',
            strength: Math.floor(Math.random() * 9) + 2,
            bytes: Math.floor(Math.random() * 10000000) + 1000,
            protocol: Math.random() < 0.5 ? 'TCP' : 'UDP',
            timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
          };
          networkData.contacts.connections.push(connection);
          nodes[i].connections++;
          nodes[j].connections++;
        }
      }
    }
  };

  // Generate mock mobile forensic network (UFDR files, mobile data)
  const generateMockMobileForensicNetwork = (file, baseEntities, networkData, analyticsData, fileIndex) => {
    const appNames = ['WhatsApp', 'Telegram', 'Signal', 'Instagram', 'Facebook', 'Twitter', 'Email'];
    const deviceInfo = {
      model: 'iPhone 12 Pro',
      os: 'iOS 15.4',
      imei: '354234567890123'
    };

    // Create app/service nodes
    for (let i = 0; i < appNames.length; i++) {
      const app = {
        id: `mobile_${fileIndex}_${i}`,
        name: `${appNames[i]} Data`,
        label: appNames[i],
        type: 'mobile_app',
        category: 'digital',
        riskLevel: ['WhatsApp', 'Telegram', 'Signal'].includes(appNames[i]) ? 'high' : 'medium',
        messageCount: Math.floor(Math.random() * 5000) + 100,
        lastActivity: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        source: file.name,
        fileType: file.type,
        deviceModel: deviceInfo.model,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 0
      };

      networkData.contacts.nodes.push(app);
      analyticsData.riskDistribution[app.riskLevel] = (analyticsData.riskDistribution[app.riskLevel] || 0) + 1;
    }

    // Generate app usage connections
    const nodes = networkData.contacts.nodes.slice(-appNames.length);
    for (let i = 0; i < nodes.length - 1; i++) {
      if (Math.random() < 0.4) {
        const connection = {
          from: nodes[i].id,
          to: nodes[i + 1].id,
          type: 'data_sharing',
          strength: Math.floor(Math.random() * 6) + 2,
          dataSize: Math.floor(Math.random() * 100000) + 1000,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        };
        networkData.contacts.connections.push(connection);
        nodes[i].connections++;
        nodes[i + 1].connections++;
      }
    }
  };

  // Generate generic mock data network (JSON, logs, other files)
  const generateMockDataNetwork = (file, baseEntities, networkData, analyticsData, fileIndex) => {
    const dataTypes = ['User Account', 'System Log', 'Configuration', 'Database Entry', 'Cache File'];
    
    for (let i = 0; i < 4; i++) {
      const dataNode = {
        id: `data_${fileIndex}_${i}`,
        name: `${dataTypes[i % dataTypes.length]} ${i + 1}`,
        label: `${dataTypes[i % dataTypes.length]}`,
        type: 'data_entry',
        category: 'data',
        riskLevel: Math.random() < 0.2 ? 'high' : 'low',
        size: Math.floor(Math.random() * 100000) + 1000,
        lastModified: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
        source: file.name,
        fileType: file.type,
        x: Math.random() * 600 + 100,
        y: Math.random() * 400 + 100,
        connections: 0
      };

      networkData.contacts.nodes.push(dataNode);
      analyticsData.riskDistribution[dataNode.riskLevel] = (analyticsData.riskDistribution[dataNode.riskLevel] || 0) + 1;
    }
  };

  // Generate connections between different file types for realistic forensic relationships
  const generateCrossFileConnections = (baseEntities, networkData, analyticsData) => {
    // Connect suspects to financial accounts
    baseEntities.suspects.forEach(suspect => {
      baseEntities.wallets.forEach(wallet => {
        if (Math.random() < 0.6) {
          const connection = {
            from: suspect.id,
            to: wallet.id,
            type: 'financial_link',
            strength: Math.floor(Math.random() * 8) + 3,
            confidence: Math.floor(Math.random() * 40) + 60,
            timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          };
          
          // Add to appropriate network based on wallet type
          if (wallet.type === 'cryptocurrency' || wallet.type === 'bank_account') {
            networkData.transactions.connections.push(connection);
          } else {
            networkData.contacts.connections.push(connection);
          }
          
          suspect.connections++;
          wallet.connections++;
        }
      });
    });

    // Connect suspects to locations
    baseEntities.suspects.forEach(suspect => {
      baseEntities.locations.forEach(location => {
        if (Math.random() < 0.4) {
          const connection = {
            from: suspect.id,
            to: location.id,
            type: 'presence',
            strength: Math.floor(Math.random() * 7) + 2,
            frequency: Math.floor(Math.random() * 10) + 1,
            timestamp: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
          };
          networkData.locations.connections.push(connection);
          suspect.connections++;
          location.connections++;
        }
      });
    });

    // Connect contacts to locations
    baseEntities.contacts.forEach(contact => {
      baseEntities.locations.slice(0, 2).forEach(location => { // Limit to first 2 locations
        if (Math.random() < 0.3) {
          const connection = {
            from: contact.id,
            to: location.id,
            type: 'association',
            strength: Math.floor(Math.random() * 5) + 2,
            timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          };
          networkData.locations.connections.push(connection);
          contact.connections++;
          location.connections++;
        }
      });
    });
  };

  // Calculate final network analytics
  const calculateNetworkAnalytics = (networkData, analyticsData) => {
    // Count total entities and connections
    analyticsData.totalEntities = 
      networkData.contacts.nodes.length + 
      networkData.locations.nodes.length + 
      networkData.transactions.nodes.length;

    analyticsData.totalConnections = 
      networkData.contacts.connections.length + 
      networkData.locations.connections.length + 
      networkData.transactions.connections.length;

    // Count connection types
    const allConnections = [
      ...networkData.contacts.connections,
      ...networkData.locations.connections,
      ...networkData.transactions.connections
    ];
    
    allConnections.forEach(conn => {
      analyticsData.connectionTypes[conn.type] = (analyticsData.connectionTypes[conn.type] || 0) + 1;
    });

    // Generate timeline data
    analyticsData.timelineData = allConnections
      .filter(conn => conn.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-20) // Last 20 events
      .map(conn => ({
        date: conn.timestamp,
        event: `${conn.type.replace('_', ' ')} connection established`,
        type: conn.type,
        category: 'network_activity'
      }));

    // Calculate hotspots (nodes with most connections)
    const allNodes = [
      ...networkData.contacts.nodes,
      ...networkData.locations.nodes,
      ...networkData.transactions.nodes
    ];
    
    analyticsData.hotspots = allNodes
      .sort((a, b) => (b.connections || 0) - (a.connections || 0))
      .slice(0, 5)
      .map(node => ({
        node: node,
        connections: node.connections || 0
      }));
  };

  // Generate network data directly from APT case JSON file content
  const generateNetworkFromJSONData = (jsonData) => {
    console.log('🎯 Generating network from APT case JSON data:', {
      caseId: jsonData.caseId,
      caseName: jsonData.caseName,
      suspects: jsonData.suspects?.length || 0,
      victims: jsonData.victims?.length || 0,
      evidence: jsonData.evidence?.length || 0,
      priority: jsonData.priority,
      riskLevel: jsonData.riskAssessment?.overallRisk
    });
    
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

    // Process suspects from JSON data
    if (jsonData.suspects && jsonData.suspects.length > 0) {
      console.log('👥 Processing', jsonData.suspects.length, 'suspects from JSON data');
      
      const suspectNodes = jsonData.suspects.map((suspect, index) => ({
        id: suspect.id,
        name: suspect.name || `Suspect ${index + 1}`,
        label: suspect.name || `Suspect ${index + 1}`,
        phone: suspect.phoneNumbers ? suspect.phoneNumbers[0] : 'Unknown',
        email: suspect.emailAccounts ? suspect.emailAccounts[0] : 'Unknown',
        type: 'suspect',
        category: 'suspect',
        riskLevel: suspect.riskLevel ? suspect.riskLevel.toLowerCase() : 'high',
        lastContact: new Date().toISOString(),
        source: 'JSON File Data',
        fileType: 'case-data',
        aliases: suspect.alias || [],
        occupation: suspect.occupation,
        nationality: suspect.nationality,
        age: suspect.age,
        role: suspect.role,
        x: 100 + (index * 150) + Math.random() * 100,
        y: 100 + Math.random() * 200,
        connections: 0
      }));
      
      networkData.contacts.nodes.push(...suspectNodes);
      
      // Update risk distribution
      suspectNodes.forEach(node => {
        const risk = node.riskLevel === 'extreme' ? 'critical' : node.riskLevel;
        analyticsData.riskDistribution[risk] = (analyticsData.riskDistribution[risk] || 0) + 1;
      });
    }

    // Process victims from JSON data
    if (jsonData.victims && jsonData.victims.length > 0) {
      console.log('👤 Processing', jsonData.victims.length, 'victims from JSON data');
      
      const victimNodes = jsonData.victims.map((victim, index) => ({
        id: victim.id,
        name: victim.name || `Victim ${index + 1}`,
        label: victim.name || `Victim ${index + 1}`,
        phone: victim.contactInfo?.phone || victim.phoneNumbers?.[0] || 'Unknown',
        email: victim.contactInfo?.email || victim.emailAccounts?.[0] || 'Unknown',
        type: 'victim',
        category: 'victim',
        riskLevel: 'low',
        lastContact: victim.incidentDate || new Date().toISOString(),
        source: 'JSON File Data',
        fileType: 'case-data',
        victimType: victim.type,
        financialLoss: victim.financialLoss,
        industry: victim.industry,
        location: victim.location || victim.headquartersLocation,
        x: 300 + (index * 150) + Math.random() * 100,
        y: 250 + Math.random() * 200,
        connections: 0
      }));
      
      networkData.contacts.nodes.push(...victimNodes);
      
      victimNodes.forEach(() => {
        analyticsData.riskDistribution.low += 1;
      });
    }

    // Process geographic locations from JSON data
    if (jsonData.geographicData?.suspectLocations) {
      console.log('📍 Processing suspect locations from JSON data');
      
      const locationNodes = jsonData.geographicData.suspectLocations.map((location, index) => ({
        id: location.id || `location-${index}`,
        name: location.name || location.address || `Location ${index + 1}`,
        label: location.name || location.address || `Location ${index + 1}`,
        latitude: location.coordinates?.[1] || location.lat,
        longitude: location.coordinates?.[0] || location.lng,
        address: location.address,
        type: 'suspect-location',
        category: 'location',
        riskLevel: 'high',
        significance: location.significance,
        suspect: location.suspect,
        x: 500 + (index * 120) + Math.random() * 100,
        y: 150 + Math.random() * 200,
        connections: 0
      }));
      
      networkData.locations.nodes.push(...locationNodes);
    }

    // Process suspects' known addresses as locations
    if (jsonData.suspects) {
      jsonData.suspects.forEach((suspect, suspectIndex) => {
        if (suspect.knownAddresses && suspect.knownAddresses.length > 0) {
          suspect.knownAddresses.forEach((address, addressIndex) => {
            const locationId = `suspect-address-${suspectIndex}-${addressIndex}`;
            networkData.locations.nodes.push({
              id: locationId,
              name: `${suspect.name} - Address ${addressIndex + 1}`,
              label: address,
              address: address,
              type: 'suspect-address',
              category: 'location',
              riskLevel: 'medium',
              suspect: suspect.name,
              x: 500 + (suspectIndex * 120) + (addressIndex * 60),
              y: 300 + Math.random() * 100,
              connections: 1
            });
          });
        }

        // Process cryptocurrency wallets as transaction nodes
        if (suspect.digitalFootprint?.cryptocurrencyWallets) {
          suspect.digitalFootprint.cryptocurrencyWallets.forEach((wallet, walletIndex) => {
            networkData.transactions.nodes.push({
              id: `crypto-${suspectIndex}-${walletIndex}`,
              name: `${suspect.name} - Crypto Wallet`,
              label: `${wallet.slice(0, 8)}...${wallet.slice(-8)}`,
              type: 'cryptocurrency',
              category: 'financial',
              currency: wallet.startsWith('bc1') ? 'BTC' : wallet.startsWith('3') ? 'BTC' : 'Unknown',
              address: wallet,
              linkedSuspect: suspect.name,
              riskLevel: 'high',
              x: 700 + (suspectIndex * 100) + (walletIndex * 50),
              y: 200 + Math.random() * 150,
              connections: 1
            });
          });
        }
      });
    }

    // Generate connections between all entities
    const allContactNodes = networkData.contacts.nodes;
    const allLocationNodes = networkData.locations.nodes;
    const allTransactionNodes = networkData.transactions.nodes;
    
    console.log('🔗 Generating connections between entities:', {
      contacts: allContactNodes.length,
      locations: allLocationNodes.length,
      transactions: allTransactionNodes.length
    });

    // Connect suspects to victims
    const suspectNodes = allContactNodes.filter(n => n.type === 'suspect');
    const victimNodes = allContactNodes.filter(n => n.type === 'victim');
    
    suspectNodes.forEach(suspect => {
      victimNodes.forEach(victim => {
        networkData.contacts.connections.push({
          from: suspect.id,
          to: victim.id,
          type: 'targeting',
          strength: 8,
          description: 'Criminal targeting relationship'
        });
        suspect.connections++;
        victim.connections++;
        analyticsData.totalConnections++;
      });
    });

    // Connect suspects to their locations
    suspectNodes.forEach(suspect => {
      const suspectLocations = allLocationNodes.filter(loc => 
        loc.suspect === suspect.name || loc.id.includes(suspect.id.split('-')[1])
      );
      
      suspectLocations.forEach(location => {
        networkData.locations.connections.push({
          from: suspect.id,
          to: location.id,
          type: 'presence',
          strength: 7,
          description: 'Physical presence at location'
        });
        suspect.connections++;
        location.connections++;
        analyticsData.totalConnections++;
      });
    });

    // Connect suspects to their crypto wallets
    suspectNodes.forEach(suspect => {
      const suspectWallets = allTransactionNodes.filter(wallet => 
        wallet.linkedSuspect === suspect.name
      );
      
      suspectWallets.forEach(wallet => {
        networkData.transactions.connections.push({
          from: suspect.id,
          to: wallet.id,
          type: 'financial',
          strength: 9,
          description: 'Cryptocurrency ownership'
        });
        suspect.connections++;
        wallet.connections++;
        analyticsData.totalConnections++;
      });
    });

    // Connect suspects to each other (criminal collaboration)
    for (let i = 0; i < suspectNodes.length; i++) {
      for (let j = i + 1; j < suspectNodes.length; j++) {
        networkData.contacts.connections.push({
          from: suspectNodes[i].id,
          to: suspectNodes[j].id,
          type: 'collaboration',
          strength: 6,
          description: 'Criminal collaboration'
        });
        suspectNodes[i].connections++;
        suspectNodes[j].connections++;
        analyticsData.totalConnections++;
      }
    }

    // Calculate analytics
    analyticsData.totalEntities = 
      networkData.contacts.nodes.length + 
      networkData.locations.nodes.length + 
      networkData.transactions.nodes.length;

    // Count connection types
    const allConnections = [
      ...networkData.contacts.connections,
      ...networkData.locations.connections,
      ...networkData.transactions.connections
    ];
    
    allConnections.forEach(conn => {
      analyticsData.connectionTypes[conn.type] = (analyticsData.connectionTypes[conn.type] || 0) + 1;
    });

    console.log('✅ Generated network from JSON data:', {
      totalEntities: analyticsData.totalEntities,
      totalConnections: analyticsData.totalConnections,
      contactNodes: networkData.contacts.nodes.length,
      contactConnections: networkData.contacts.connections.length,
      locationNodes: networkData.locations.nodes.length,
      locationConnections: networkData.locations.connections.length,
      transactionNodes: networkData.transactions.nodes.length,
      transactionConnections: networkData.transactions.connections.length
    });

    return { networkData, analyticsData };
  };

  // Generate network data from Operation Data Fortress APT case
  const generateNetworkFromCaseData = () => {
    console.log('🎯 Generating network from Operation Data Fortress APT case data');
    
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

    // Process APT suspects with comprehensive data
    if (caseData.suspects) {
      const suspectNodes = caseData.suspects.map((suspect, index) => {
        const riskLevel = suspect.riskLevel?.toLowerCase() === 'extreme' ? 'critical' : suspect.riskLevel?.toLowerCase() || 'high';
        return {
          id: suspect.id,
          name: suspect.name,
          label: suspect.name,
          phone: suspect.phoneNumbers ? suspect.phoneNumbers[0] : 'Unknown',
          email: suspect.emailAccounts ? suspect.emailAccounts[0] : 'Unknown',
          type: 'suspect',
          category: 'suspect',
          riskLevel: riskLevel,
          lastContact: new Date().toISOString(),
          source: 'APT Case Data',
          fileType: 'apt-investigation',
          aliases: suspect.alias || [],
          occupation: suspect.occupation,
          nationality: suspect.nationality,
          age: suspect.age,
          role: suspect.role,
          employeeId: suspect.employeeId,
          securityClearance: suspect.securityClearance,
          digitalFootprint: suspect.digitalFootprint,
          corporateAccess: suspect.corporateAccess,
          coordinates: suspect.coordinates,
          // Position suspects in a strategic layout
          x: index === 0 ? 300 : (200 + (index * 200)), // Dr. Tanaka in center, others spread
          y: index === 0 ? 200 : (150 + (index % 2) * 200),
          connections: 0 // Will be calculated later
        };
      });
      networkData.contacts.nodes.push(...suspectNodes);
      
      // Update risk distribution for suspects
      suspectNodes.forEach(node => {
        analyticsData.riskDistribution[node.riskLevel] = (analyticsData.riskDistribution[node.riskLevel] || 0) + 1;
      });
    }

    // Process corporate victims with detailed breach information
    if (caseData.victims) {
      const victimNodes = caseData.victims.map((victim, index) => ({
        id: victim.id,
        name: victim.name,
        label: victim.name,
        phone: victim.contactInfo?.phone || 'Corporate Contact',
        email: victim.contactInfo?.email || 'security@' + victim.name.toLowerCase().replace(/\s+/g, '') + '.com',
        type: 'victim',
        category: 'victim',
        riskLevel: victim.financialLoss > 100000000 ? 'high' : 'medium', // High risk if >$100M loss
        lastContact: victim.discoveryDate || victim.incidentDate || new Date().toISOString(),
        source: 'APT Investigation',
        fileType: 'corporate-breach',
        victimType: victim.type,
        financialLoss: victim.financialLoss,
        industry: victim.industry,
        employeeCount: victim.employeeCount,
        annualRevenue: victim.annualRevenue,
        headquartersLocation: victim.headquartersLocation,
        compromisedAssets: victim.compromisedAssets,
        systemsAffected: victim.systemsAffected,
        incidentDate: victim.incidentDate,
        discoveryDate: victim.discoveryDate,
        coordinates: victim.coordinates,
        // Position victims opposite to suspects
        x: 600 + (index * 120),
        y: 300 + (index * 80),
        connections: 0 // Will be calculated based on connections
      }));
      networkData.contacts.nodes.push(...victimNodes);
      
      // Update risk distribution for victims
      victimNodes.forEach(node => {
        analyticsData.riskDistribution[node.riskLevel] = (analyticsData.riskDistribution[node.riskLevel] || 0) + 1;
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

    // Process APT financial evidence - cryptocurrency laundering network
    if (caseData.evidence) {
      caseData.evidence.forEach(evidence => {
        if (evidence.type === 'FINANCIAL' && evidence.cryptoAnalysis) {
          // Primary cryptocurrency wallets
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
            firstSeen: wallet.firstSeen,
            totalValueUSD: evidence.cryptoAnalysis.totalValueUSD,
            x: 150 + (index * 200),
            y: 100 + (index * 50),
            connections: 0
          })) || [];
          networkData.transactions.nodes.push(...cryptoNodes);
          
          // Add money laundering stages as financial nodes
          evidence.cryptoAnalysis.transactionFlow?.forEach((flow, index) => {
            const flowNode = {
              id: `flow_${index}`,
              name: flow.stage,
              label: `$${(flow.amount / 1000000).toFixed(1)}M`,
              type: 'money_laundering',
              category: 'financial',
              stage: flow.stage,
              method: flow.method,
              amount: flow.amount,
              timeframe: flow.timeframe,
              services: flow.services,
              locations: flow.locations,
              riskLevel: flow.stage === 'Initial Collection' ? 'critical' : 'high',
              x: 300 + (index * 150),
              y: 200 + (index * 80),
              connections: 0
            };
            networkData.transactions.nodes.push(flowNode);
          });
          
          // Update risk distribution for financial nodes
          [...cryptoNodes, ...(evidence.cryptoAnalysis.transactionFlow?.map((_, index) => ({ riskLevel: 'high' })) || [])].forEach(node => {
            analyticsData.riskDistribution[node.riskLevel] = (analyticsData.riskDistribution[node.riskLevel] || 0) + 1;
          });
        }
        
        // Process network infrastructure from digital evidence
        if (evidence.networkTopology) {
          const infraNodes = evidence.networkTopology.nodes.map(node => ({
            id: node.id,
            name: node.label,
            label: node.label,
            type: node.type,
            category: 'infrastructure',
            ip: node.ip,
            riskLevel: node.riskLevel?.toLowerCase() === 'extreme' ? 'critical' : node.riskLevel?.toLowerCase() || 'medium',
            x: node.type === 'endpoint' ? 200 : node.type === 'server' ? 400 : 600,
            y: 250 + (Math.random() * 100),
            connections: 0
          }));
          networkData.contacts.nodes.push(...infraNodes);
          
          infraNodes.forEach(node => {
            analyticsData.riskDistribution[node.riskLevel] = (analyticsData.riskDistribution[node.riskLevel] || 0) + 1;
          });
        }
      });
    }

    // Generate APT case-specific connections based on criminal relationships
    console.log('🔗 Generating APT criminal network connections');
    
    // 1. Core APT network connections (from networkTopology)
    if (caseData.networkTopology?.edges) {
      const coreConnections = caseData.networkTopology.edges.map(edge => ({
        from: edge.from,
        to: edge.to,
        type: edge.type,
        strength: edge.strength === 'strong' ? 9 : edge.strength === 'medium' ? 6 : 3,
        frequency: edge.frequency,
        label: `${edge.type.replace('_', ' ')} - ${edge.frequency}`,
        timestamp: new Date().toISOString()
      }));
      networkData.contacts.connections.push(...coreConnections);
      
      coreConnections.forEach(conn => {
        analyticsData.connectionTypes[conn.type] = (analyticsData.connectionTypes[conn.type] || 0) + 1;
      });
    }
    
    // 2. Suspect-to-victim targeting connections
    caseData.suspects?.forEach(suspect => {
      caseData.victims?.forEach(victim => {
        // Dr. Tanaka (insider) has direct access to TechCorp
        if (suspect.id === 'SUSPECT-001' && victim.id === 'VICTIM-001') {
          networkData.contacts.connections.push({
            from: suspect.id,
            to: victim.id,
            type: 'insider_access',
            strength: 10,
            label: 'Insider Threat Access',
            timestamp: victim.incidentDate
          });
        } else {
          // Other suspects target victims through data broker
          networkData.contacts.connections.push({
            from: suspect.id,
            to: victim.id,
            type: 'cyber_attack',
            strength: 8,
            label: 'APT Campaign Target',
            timestamp: victim.incidentDate
          });
        }
      });
    });
    
    // 3. Financial connections (suspects to crypto wallets)
    networkData.transactions.nodes.forEach(wallet => {
      if (wallet.linkedSuspect && wallet.type === 'cryptocurrency') {
        networkData.transactions.connections.push({
          from: wallet.linkedSuspect,
          to: wallet.id,
          type: 'cryptocurrency_ownership',
          strength: 9,
          label: `${wallet.balance} ${wallet.currency}`,
          timestamp: wallet.firstSeen
        });
      }
    });
    
    // 4. Money laundering flow connections
    const launderingNodes = networkData.transactions.nodes.filter(n => n.type === 'money_laundering');
    for (let i = 0; i < launderingNodes.length - 1; i++) {
      networkData.transactions.connections.push({
        from: launderingNodes[i].id,
        to: launderingNodes[i + 1].id,
        type: 'money_flow',
        strength: 7,
        label: `$${((launderingNodes[i + 1].amount || 0) / 1000000).toFixed(1)}M`,
        timestamp: new Date().toISOString()
      });
    }
    
    // 5. Digital evidence network connections (from network traffic analysis)
    caseData.evidence?.forEach(evidence => {
      if (evidence.networkTopology?.edges) {
        const digitalConnections = evidence.networkTopology.edges.map(edge => ({
          from: edge.from,
          to: edge.to,
          type: edge.type,
          strength: 8,
          label: edge.volume || edge.type.replace('_', ' '),
          frequency: edge.frequency,
          timestamp: evidence.collectedDate
        }));
        networkData.contacts.connections.push(...digitalConnections);
      }
    });
    
    // 6. Geographic location connections
    caseData.geographicData?.suspectLocations?.forEach(location => {
      // Connect suspects to their locations
      if (location.suspect) {
        networkData.locations.connections.push({
          from: location.suspect,
          to: location.id,
          type: 'physical_presence',
          strength: 8,
          label: location.significance,
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // 7. Communication evidence connections (encrypted messages)
    caseData.evidence?.forEach(evidence => {
      if (evidence.type === 'COMMUNICATION' && evidence.keyMessages) {
        evidence.keyMessages.forEach(message => {
          if (message.participants && message.participants.length >= 2) {
            networkData.contacts.connections.push({
              from: message.participants[0],
              to: message.participants[1],
              type: 'encrypted_communication',
              strength: 7,
              label: `${message.platform} - ${message.significance}`,
              timestamp: message.timestamp
            });
          }
        });
      }
    });
    
    // Update connection counts for all nodes
    const updateConnectionCounts = () => {
      const allConnections = [
        ...networkData.contacts.connections,
        ...networkData.transactions.connections, 
        ...networkData.locations.connections
      ];
      
      const connectionCounts = {};
      allConnections.forEach(conn => {
        connectionCounts[conn.from] = (connectionCounts[conn.from] || 0) + 1;
        connectionCounts[conn.to] = (connectionCounts[conn.to] || 0) + 1;
      });
      
      [...networkData.contacts.nodes, ...networkData.transactions.nodes, ...networkData.locations.nodes].forEach(node => {
        node.connections = connectionCounts[node.id] || 0;
      });
      
      analyticsData.totalConnections = allConnections.length;
      
      // Update connection types analytics
      allConnections.forEach(conn => {
        analyticsData.connectionTypes[conn.type] = (analyticsData.connectionTypes[conn.type] || 0) + 1;
      });
    };
    
    updateConnectionCounts();

    // Calculate total entities
    analyticsData.totalEntities = 
      networkData.contacts.nodes.length + 
      networkData.locations.nodes.length + 
      networkData.transactions.nodes.length;

    // Generate comprehensive timeline data from APT case
    analyticsData.timelineData = [];
    
    // Add case events
    if (caseData.createdDate) {
      analyticsData.timelineData.push({
        date: caseData.createdDate,
        event: 'APT Investigation Initiated',
        type: 'investigation',
        category: 'case_management'
      });
    }
    
    // Add victim incidents
    caseData.victims?.forEach(victim => {
      if (victim.incidentDate) {
        analyticsData.timelineData.push({
          date: victim.incidentDate,
          event: `Cyber Attack on ${victim.name}`,
          type: 'cyber_attack',
          category: 'criminal_activity'
        });
      }
      if (victim.discoveryDate) {
        analyticsData.timelineData.push({
          date: victim.discoveryDate,
          event: `Breach Discovery at ${victim.name}`,
          type: 'breach_discovery',
          category: 'investigation'
        });
      }
    });
    
    // Add evidence collection events
    caseData.evidence?.forEach(evidence => {
      analyticsData.timelineData.push({
        date: evidence.collectedDate,
        event: `Evidence Collected: ${evidence.name}`,
        type: evidence.type.toLowerCase(),
        category: 'evidence_collection'
      });
    });
    
    // Add communication events
    caseData.evidence?.forEach(evidence => {
      if (evidence.keyMessages) {
        evidence.keyMessages.forEach(message => {
          analyticsData.timelineData.push({
            date: message.timestamp,
            event: `Intercepted Communication: ${message.significance}`,
            type: 'communication_intercept',
            category: 'intelligence'
          });
        });
      }
    });
    
    // Sort timeline by date
    analyticsData.timelineData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Generate hotspots based on connection counts
    const allNodes = [...networkData.contacts.nodes, ...networkData.transactions.nodes, ...networkData.locations.nodes];
    analyticsData.hotspots = allNodes
      .sort((a, b) => (b.connections || 0) - (a.connections || 0))
      .slice(0, 5)
      .map(node => ({
        node: { id: node.id, name: node.name, type: node.type },
        connections: node.connections || 0,
        riskLevel: node.riskLevel
      }));

    console.log('✅ Generated network data from case:', {
      contacts: networkData.contacts.nodes.length,
      locations: networkData.locations.nodes.length, 
      transactions: networkData.transactions.nodes.length,
      connections: analyticsData.totalConnections
    });

    return { networkData, analyticsData };
  };

  // Generate logical connections between entities when explicit topology isn't available
  const generateLogicalConnections = (nodes, caseData) => {
    const connections = [];
    
    // Create connections between suspects
    const suspectNodes = nodes.filter(n => n.type === 'suspect' || n.category === 'suspect');
    for (let i = 0; i < suspectNodes.length; i++) {
      for (let j = i + 1; j < suspectNodes.length; j++) {
        connections.push({
          from: suspectNodes[i].id,
          to: suspectNodes[j].id,
          type: 'collaboration',
          strength: Math.floor(Math.random() * 5) + 5, // 5-9 strength
          description: 'Criminal collaboration'
        });
      }
    }

    // Connect suspects to victims
    const victimNodes = nodes.filter(n => n.type === 'victim' || n.category === 'victim');
    suspectNodes.forEach(suspect => {
      victimNodes.forEach(victim => {
        connections.push({
          from: suspect.id,
          to: victim.id,
          type: 'targeting',
          strength: Math.floor(Math.random() * 4) + 6, // 6-9 strength
          description: 'Criminal targeting'
        });
      });
    });

    // Connect suspects to financial accounts/crypto wallets
    const cryptoNodes = nodes.filter(n => n.type === 'cryptocurrency' || n.category === 'financial');
    suspectNodes.forEach(suspect => {
      cryptoNodes.slice(0, 2).forEach(crypto => { // Limit to 2 connections per suspect
        connections.push({
          from: suspect.id,
          to: crypto.id,
          type: 'financial',
          strength: Math.floor(Math.random() * 3) + 7, // 7-9 strength
          description: 'Financial connection'
        });
      });
    });

    // Connect suspects to locations
    const locationNodes = nodes.filter(n => n.type === 'crime-location' || n.type === 'suspect-location' || n.category === 'location');
    suspectNodes.forEach(suspect => {
      locationNodes.slice(0, 2).forEach(location => { // Limit to 2 locations per suspect
        connections.push({
          from: suspect.id,
          to: location.id,
          type: 'presence',
          strength: Math.floor(Math.random() * 4) + 4, // 4-7 strength
          description: 'Location presence'
        });
      });
    });

    // Generate connections based on case data relationships
    if (caseData.suspects) {
      caseData.suspects.forEach(suspect => {
        // Connect to victims based on case data
        if (caseData.victims) {
          caseData.victims.forEach(victim => {
            connections.push({
              from: suspect.id,
              to: victim.id,
              type: 'case_relationship',
              strength: 8,
              description: 'Direct case involvement'
            });
          });
        }

        // Connect to cryptocurrency wallets mentioned in suspect data
        if (suspect.digitalFootprint?.cryptocurrencyWallets) {
          suspect.digitalFootprint.cryptocurrencyWallets.forEach((wallet, index) => {
            const cryptoNode = nodes.find(n => n.label && n.label.includes('BTC'));
            if (cryptoNode) {
              connections.push({
                from: suspect.id,
                to: cryptoNode.id,
                type: 'cryptocurrency',
                strength: 9,
                description: 'Cryptocurrency ownership'
              });
            }
          });
        }
      });
    }

    return connections;
  };

  // Generate demo network with guaranteed connections for testing
  const generateDemoNetwork = () => {
    console.log('🎭 Generating demo network with guaranteed connections');
    
    const demoNetworkData = {
      contacts: { nodes: [], connections: [] },
      locations: { nodes: [], connections: [] },
      transactions: { nodes: [], connections: [] }
    };

    // Demo contact nodes - expanded with more realistic data
    const demoContacts = [
      { id: 'demo-suspect-1', name: 'Alex Morrison', label: 'Alex Morrison', type: 'suspect', category: 'suspect', riskLevel: 'critical', x: 200, y: 200, connections: 0, phone: '+1-555-0101', email: 'alex.morrison@email.com' },
      { id: 'demo-suspect-2', name: 'Sarah Chen', label: 'Sarah Chen', type: 'suspect', category: 'suspect', riskLevel: 'high', x: 400, y: 180, connections: 0, phone: '+1-555-0102', email: 'sarah.chen@email.com' },
      { id: 'demo-victim-1', name: 'TechCorp Inc', label: 'TechCorp Inc', type: 'victim', category: 'victim', riskLevel: 'low', x: 300, y: 350, connections: 0, contact: '+1-555-0200', email: 'info@techcorp.com' },
      { id: 'demo-contact-1', name: 'Mike Wilson', label: 'Mike Wilson', type: 'contact', category: 'contact', riskLevel: 'medium', x: 500, y: 280, connections: 0, phone: '+1-555-0301', email: 'mike.wilson@email.com' },
      { id: 'demo-contact-2', name: 'Lisa Rodriguez', label: 'Lisa Rodriguez', type: 'contact', category: 'contact', riskLevel: 'medium', x: 150, y: 320, connections: 0, phone: '+1-555-0302', email: 'lisa.rodriguez@email.com' },
      { id: 'demo-contact-3', name: 'James Parker', label: 'James Parker', type: 'witness', category: 'witness', riskLevel: 'low', x: 350, y: 150, connections: 0, phone: '+1-555-0303', email: 'james.parker@email.com' },
      { id: 'demo-contact-4', name: 'Maria Santos', label: 'Maria Santos', type: 'contact', category: 'contact', riskLevel: 'high', x: 250, y: 400, connections: 0, phone: '+1-555-0304', email: 'maria.santos@email.com' },
      { id: 'demo-contact-5', name: 'David Kim', label: 'David Kim', type: 'associate', category: 'contact', riskLevel: 'medium', x: 450, y: 350, connections: 0, phone: '+1-555-0305', email: 'david.kim@email.com' }
    ];

    // Demo financial nodes - expanded with more accounts and wallets
    const demoFinancial = [
      { id: 'demo-crypto-1', name: 'Bitcoin Wallet', label: '2.5 BTC', type: 'cryptocurrency', category: 'financial', riskLevel: 'critical', x: 250, y: 150, connections: 0, address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', balance: '2.5 BTC' },
      { id: 'demo-account-1', name: 'Bank Account', label: '$45,000', type: 'bank_account', category: 'financial', riskLevel: 'high', x: 450, y: 200, connections: 0, accountNumber: '****1234', balance: '$45,000' },
      { id: 'demo-crypto-2', name: 'Ethereum Wallet', label: '12.8 ETH', type: 'cryptocurrency', category: 'financial', riskLevel: 'high', x: 350, y: 120, connections: 0, address: '0x742d35Cc6C4354CBB5d4B4f0f8fcB8f0E4E4B2B1', balance: '12.8 ETH' },
      { id: 'demo-account-2', name: 'Offshore Account', label: '$125,000', type: 'offshore_account', category: 'financial', riskLevel: 'critical', x: 200, y: 250, connections: 0, accountNumber: '****5678', balance: '$125,000' },
      { id: 'demo-exchange-1', name: 'Crypto Exchange', label: 'Multiple Assets', type: 'exchange', category: 'financial', riskLevel: 'medium', x: 400, y: 100, connections: 0, platform: 'CryptoEx', totalValue: '$78,000' }
    ];

    // Demo location nodes - expanded with more locations
    const demoLocations = [
      { id: 'demo-location-1', name: 'Downtown Office', label: 'Downtown Office', type: 'crime-location', category: 'location', riskLevel: 'high', x: 300, y: 100, connections: 0, address: '123 Main St, City Center', lat: 40.7589, lng: -73.9851 },
      { id: 'demo-location-2', name: 'Residential Area', label: 'Residential Area', type: 'suspect-location', category: 'location', riskLevel: 'medium', x: 180, y: 400, connections: 0, address: '456 Oak Ave, Suburbia', lat: 40.7505, lng: -73.9934 },
      { id: 'demo-location-3', name: 'Warehouse District', label: 'Warehouse District', type: 'meeting-point', category: 'location', riskLevel: 'high', x: 450, y: 380, connections: 0, address: '789 Industrial Blvd', lat: 40.7282, lng: -73.9942 },
      { id: 'demo-location-4', name: 'Internet Cafe', label: 'Internet Cafe', type: 'communication-hub', category: 'location', riskLevel: 'medium', x: 250, y: 300, connections: 0, address: '321 Tech Street', lat: 40.7614, lng: -73.9776 },
      { id: 'demo-location-5', name: 'Banking District', label: 'Banking District', type: 'financial-center', category: 'location', riskLevel: 'low', x: 380, y: 250, connections: 0, address: 'Financial Plaza', lat: 40.7074, lng: -74.0113 }
    ];

    // Add nodes to respective categories
    demoNetworkData.contacts.nodes = demoContacts;
    demoNetworkData.transactions.nodes = demoFinancial;
    demoNetworkData.locations.nodes = demoLocations;

    // Generate guaranteed connections - expanded network
    const demoConnections = [
      // Suspect to suspect collaboration
      { from: 'demo-suspect-1', to: 'demo-suspect-2', type: 'collaboration', strength: 9, label: 'Criminal Partnership', timestamp: '2024-10-10T14:30:00Z' },
      // Suspects to victim
      { from: 'demo-suspect-1', to: 'demo-victim-1', type: 'targeting', strength: 10, label: 'Primary Target', timestamp: '2024-10-12T09:15:00Z' },
      { from: 'demo-suspect-2', to: 'demo-victim-1', type: 'targeting', strength: 8, label: 'Secondary Attack', timestamp: '2024-10-12T11:45:00Z' },
      // Suspects to contacts - communication networks
      { from: 'demo-suspect-1', to: 'demo-contact-1', type: 'communication', strength: 7, label: '24 Calls', timestamp: '2024-10-11T16:20:00Z' },
      { from: 'demo-suspect-2', to: 'demo-contact-2', type: 'communication', strength: 6, label: '18 Messages', timestamp: '2024-10-11T19:30:00Z' },
      { from: 'demo-suspect-1', to: 'demo-contact-4', type: 'recruitment', strength: 8, label: 'Recruited Associate', timestamp: '2024-10-08T13:10:00Z' },
      // Contact networks
      { from: 'demo-contact-1', to: 'demo-victim-1', type: 'business_relation', strength: 4, label: 'Business Contact', timestamp: '2024-10-09T10:00:00Z' },
      { from: 'demo-contact-3', to: 'demo-victim-1', type: 'witness_report', strength: 3, label: 'Witness Statement', timestamp: '2024-10-13T08:30:00Z' },
      { from: 'demo-contact-2', to: 'demo-contact-4', type: 'association', strength: 5, label: 'Known Associates', timestamp: '2024-10-07T15:45:00Z' },
      { from: 'demo-contact-5', to: 'demo-suspect-2', type: 'family_relation', strength: 6, label: 'Family Member', timestamp: '2024-10-05T12:00:00Z' },
      // Cross-network connections
      { from: 'demo-contact-1', to: 'demo-contact-5', type: 'communication', strength: 4, label: 'Information Exchange', timestamp: '2024-10-10T17:20:00Z' }
    ];

    const demoFinancialConnections = [
      // Suspects to financial accounts - ownership
      { from: 'demo-suspect-1', to: 'demo-crypto-1', type: 'ownership', strength: 10, label: 'Wallet Owner', timestamp: '2024-10-01T00:00:00Z' },
      { from: 'demo-suspect-1', to: 'demo-account-2', type: 'ownership', strength: 9, label: 'Account Holder', timestamp: '2024-09-15T00:00:00Z' },
      { from: 'demo-suspect-2', to: 'demo-account-1', type: 'ownership', strength: 8, label: 'Joint Account', timestamp: '2024-09-20T00:00:00Z' },
      { from: 'demo-suspect-2', to: 'demo-crypto-2', type: 'ownership', strength: 7, label: 'Ethereum Holdings', timestamp: '2024-10-02T00:00:00Z' },
      // Financial transfers and transactions
      { from: 'demo-crypto-1', to: 'demo-account-1', type: 'transaction', strength: 8, label: '$15,000 Transfer', timestamp: '2024-10-11T14:22:00Z' },
      { from: 'demo-account-2', to: 'demo-crypto-2', type: 'transaction', strength: 9, label: '$25,000 Conversion', timestamp: '2024-10-10T11:30:00Z' },
      { from: 'demo-crypto-2', to: 'demo-exchange-1', type: 'transaction', strength: 6, label: 'Exchange Trading', timestamp: '2024-10-12T16:45:00Z' },
      { from: 'demo-exchange-1', to: 'demo-account-1', type: 'transaction', strength: 5, label: 'Withdrawal', timestamp: '2024-10-13T09:15:00Z' },
      // Money laundering patterns
      { from: 'demo-account-1', to: 'demo-account-2', type: 'suspicious_transfer', strength: 7, label: 'Suspicious Activity', timestamp: '2024-10-09T20:30:00Z' }
    ];

    const demoLocationConnections = [
      // Suspects to locations - presence and movement
      { from: 'demo-suspect-1', to: 'demo-location-1', type: 'frequent_visits', strength: 8, label: 'Regular Presence', timestamp: '2024-10-12T13:00:00Z' },
      { from: 'demo-suspect-1', to: 'demo-location-4', type: 'communication_hub', strength: 6, label: 'Digital Activities', timestamp: '2024-10-11T18:30:00Z' },
      { from: 'demo-suspect-2', to: 'demo-location-2', type: 'residence', strength: 9, label: 'Home Address', timestamp: '2024-10-01T00:00:00Z' },
      { from: 'demo-suspect-2', to: 'demo-location-3', type: 'meeting_point', strength: 7, label: 'Secret Meetings', timestamp: '2024-10-10T22:00:00Z' },
      // Victim and location relationships
      { from: 'demo-location-1', to: 'demo-victim-1', type: 'incident_location', strength: 10, label: 'Crime Scene', timestamp: '2024-10-12T14:00:00Z' },
      { from: 'demo-location-5', to: 'demo-victim-1', type: 'business_location', strength: 5, label: 'Business Operations', timestamp: '2024-10-09T09:00:00Z' },
      // Movement patterns
      { from: 'demo-location-2', to: 'demo-location-3', type: 'movement', strength: 6, label: 'Travel Route', timestamp: '2024-10-10T21:30:00Z' },
      { from: 'demo-location-3', to: 'demo-location-1', type: 'movement', strength: 7, label: 'Pre-incident Movement', timestamp: '2024-10-12T12:45:00Z' },
      { from: 'demo-location-4', to: 'demo-location-5', type: 'proximity', strength: 4, label: 'Same District', timestamp: '2024-10-11T15:00:00Z' }
    ];

    // Add connections to respective categories
    demoNetworkData.contacts.connections = demoConnections;
    demoNetworkData.transactions.connections = demoFinancialConnections;
    demoNetworkData.locations.connections = demoLocationConnections;

    // Update connection counts for each node
    const updateNodeConnections = (connections, nodes) => {
      const connectionCounts = {};
      connections.forEach(conn => {
        connectionCounts[conn.from] = (connectionCounts[conn.from] || 0) + 1;
        connectionCounts[conn.to] = (connectionCounts[conn.to] || 0) + 1;
      });
      
      nodes.forEach(node => {
        node.connections = connectionCounts[node.id] || 0;
      });
    };

    // Update connections for all node sets
    updateNodeConnections(demoConnections, demoContacts);
    updateNodeConnections(demoFinancialConnections, demoFinancial);
    updateNodeConnections(demoLocationConnections, demoLocations);

    // Demo analytics - comprehensive statistics
    const demoAnalytics = {
      totalEntities: demoContacts.length + demoFinancial.length + demoLocations.length,
      totalConnections: demoConnections.length + demoFinancialConnections.length + demoLocationConnections.length,
      riskDistribution: { 
        critical: demoContacts.filter(n => n.riskLevel === 'critical').length + demoFinancial.filter(n => n.riskLevel === 'critical').length + demoLocations.filter(n => n.riskLevel === 'critical').length,
        high: demoContacts.filter(n => n.riskLevel === 'high').length + demoFinancial.filter(n => n.riskLevel === 'high').length + demoLocations.filter(n => n.riskLevel === 'high').length,
        medium: demoContacts.filter(n => n.riskLevel === 'medium').length + demoFinancial.filter(n => n.riskLevel === 'medium').length + demoLocations.filter(n => n.riskLevel === 'medium').length,
        low: demoContacts.filter(n => n.riskLevel === 'low').length + demoFinancial.filter(n => n.riskLevel === 'low').length + demoLocations.filter(n => n.riskLevel === 'low').length
      },
      connectionTypes: {
        // Contact network connection types
        collaboration: 1, targeting: 2, communication: 3, recruitment: 1, business_relation: 1, 
        witness_report: 1, association: 1, family_relation: 1,
        // Financial network connection types
        ownership: 4, transaction: 4, suspicious_transfer: 1,
        // Location network connection types
        frequent_visits: 1, communication_hub: 1, residence: 1, meeting_point: 1, 
        incident_location: 1, business_location: 1, movement: 2, proximity: 1
      },
      timelineData: [
        { date: '2024-10-05T12:00:00Z', event: 'Family connection established', type: 'family_relation', category: 'network_activity' },
        { date: '2024-10-07T15:45:00Z', event: 'Associate relationship formed', type: 'association', category: 'network_activity' },
        { date: '2024-10-08T13:10:00Z', event: 'New recruit contacted', type: 'recruitment', category: 'network_activity' },
        { date: '2024-10-09T20:30:00Z', event: 'Suspicious financial transfer', type: 'suspicious_transfer', category: 'financial_activity' },
        { date: '2024-10-10T14:30:00Z', event: 'Criminal partnership confirmed', type: 'collaboration', category: 'criminal_activity' },
        { date: '2024-10-11T16:20:00Z', event: 'Intensive communication period', type: 'communication', category: 'network_activity' },
        { date: '2024-10-12T14:00:00Z', event: 'Crime committed at location', type: 'incident_location', category: 'criminal_activity' }
      ],
      hotspots: [
        { node: { id: 'demo-suspect-1', name: 'Alex Morrison' }, connections: demoContacts.find(n => n.id === 'demo-suspect-1')?.connections || 0 },
        { node: { id: 'demo-suspect-2', name: 'Sarah Chen' }, connections: demoContacts.find(n => n.id === 'demo-suspect-2')?.connections || 0 },
        { node: { id: 'demo-victim-1', name: 'TechCorp Inc' }, connections: demoContacts.find(n => n.id === 'demo-victim-1')?.connections || 0 },
        { node: { id: 'demo-location-1', name: 'Downtown Office' }, connections: demoLocations.find(n => n.id === 'demo-location-1')?.connections || 0 },
        { node: { id: 'demo-crypto-1', name: 'Bitcoin Wallet' }, connections: demoFinancial.find(n => n.id === 'demo-crypto-1')?.connections || 0 }
      ]
    };

    console.log('✅ Demo network generated:', {
      contacts: { nodes: demoNetworkData.contacts.nodes.length, connections: demoNetworkData.contacts.connections.length },
      financial: { nodes: demoNetworkData.transactions.nodes.length, connections: demoNetworkData.transactions.connections.length },
      locations: { nodes: demoNetworkData.locations.nodes.length, connections: demoNetworkData.locations.connections.length }
    });

    return { networkData: demoNetworkData, analyticsData: demoAnalytics };
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
  
  // Load network data from case data when available (only if not already generated from files)
  useEffect(() => {
    if (hasData && caseData) {
      console.log('🔄 Loading network data from case data');
      
      // Use the proper network generation function that includes connections
      const { networkData: generatedNetworkData, analyticsData: generatedAnalytics } = generateNetworkFromCaseData();
      
      console.log('📊 Generated network data from case:', {
        contacts: { nodes: generatedNetworkData.contacts.nodes.length, connections: generatedNetworkData.contacts.connections.length },
        locations: { nodes: generatedNetworkData.locations.nodes.length, connections: generatedNetworkData.locations.connections.length },
        transactions: { nodes: generatedNetworkData.transactions.nodes.length, connections: generatedNetworkData.transactions.connections.length }
      });
      
      setNetworkData(generatedNetworkData);
      setAnalyticsData(generatedAnalytics);
    }
  }, [hasData, caseData]);

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

  // Enhanced file type detection for forensic analysis (using utility)
  const getFileType = (filename, fileSize = 0) => {
    const detectedType = detectFileType(filename, fileSize);
    
    // Map the detailed types to our network analysis categories
    const typeMapping = {
      'mobile_forensics': 'mobile',
      'network_capture': 'communications', 
      'communications': 'communications',
      'contacts': 'contacts',
      'call_logs': 'contacts',
      'location_data': 'location',
      'financial_data': 'financial',
      'browser_data': 'communications',
      'system_logs': 'communications',
      'database': 'contacts',
      'case_data': 'data'
    };
    
    return typeMapping[detectedType] || 'data';
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
                strokeWidth={Math.max(2, Math.min((connection.strength || 3) / 2, 6))}
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
                {connection.label || connection.type || `Strength: ${connection.strength || 1}`}
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

          {/* Demo Network Button */}
          <button
            style={{
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(124, 58, 237, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onClick={() => {
              console.log('🔗 Loading demo network...');
              const demo = generateDemoNetwork();
              setNetworkData(demo.networkData);
              setAnalyticsData(demo.analyticsData);
              console.log('✅ Demo network loaded:', {
                contacts: demo.networkData.contacts.nodes.length + ' nodes, ' + demo.networkData.contacts.connections.length + ' connections',
                transactions: demo.networkData.transactions.nodes.length + ' nodes, ' + demo.networkData.transactions.connections.length + ' connections',
                locations: demo.networkData.locations.nodes.length + ' nodes, ' + demo.networkData.locations.connections.length + ' connections'
              });
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#6d28d9';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🔗 Demo Network
          </button>

          {/* APT Case Button */}
          <button
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onClick={async () => {
              console.log('🎯 Loading APT case network...');
              try {
                const response = await fetch('/apt-case-003.json');
                if (response.ok) {
                  const aptData = await response.json();
                  const aptNetwork = generateNetworkFromJSONData(aptData);
                  setNetworkData(aptNetwork.networkData);
                  setAnalyticsData(aptNetwork.analyticsData);
                  console.log('✅ APT case network loaded:', {
                    case: aptData.caseName,
                    priority: aptData.priority,
                    contacts: aptNetwork.networkData.contacts.nodes.length + ' nodes, ' + aptNetwork.networkData.contacts.connections.length + ' connections',
                    transactions: aptNetwork.networkData.transactions.nodes.length + ' nodes, ' + aptNetwork.networkData.transactions.connections.length + ' connections',
                    locations: aptNetwork.networkData.locations.nodes.length + ' nodes, ' + aptNetwork.networkData.locations.connections.length + ' connections'
                  });
                }
              } catch (error) {
                console.error('❌ Failed to load APT case:', error);
                // Fallback to demo if APT case fails to load
                const demo = generateDemoNetwork();
                setNetworkData(demo.networkData);
                setAnalyticsData(demo.analyticsData);
              }
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#b91c1c';
              e.target.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#dc2626';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🎯 APT Case
          </button>
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
