import { useEffect, useState } from 'react';
import { detectFileType } from '../config/fileAnalysisUtils.js';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';
import useCaseFileIntegration from '../hooks/useCaseFileIntegration.js';

const DatabaseSearch = () => {
  const { selectedCase, selectedFiles, getSelectedFileObjects, caseFiles } = useCaseContext();
  const { caseData, hasData, statistics } = useCaseData();
  const { isIntegrated, caseDataAvailable, filesSelected } = useCaseFileIntegration();
  
  // Debug: Log all context values when they change
  useEffect(() => {
    console.log('🔍 DatabaseSearch context debug:');
    console.log('  - selectedCase:', selectedCase?.name || 'None');
    console.log('  - selectedFiles:', selectedFiles);
    console.log('  - caseFiles count:', caseFiles?.length || 0);
    console.log('  - caseFiles:', caseFiles?.map(f => ({
      name: f.originalName || f.filename || f.name,
      fileId: f.fileId,
      _id: f._id,
      id: f.id
    })));
  }, [selectedCase, selectedFiles, caseFiles]);
  
  // Auto-load and analyze database when a single file is selected
  useEffect(() => {
    console.log('🔍 DatabaseSearch useEffect triggered');
    console.log('📊 selectedFiles:', selectedFiles);
    console.log('🗂️ selectedCase:', selectedCase?.name || 'None');
    
    if (selectedFiles.length === 1 && selectedCase) {
      console.log('🔄 DatabaseSearch: Single file selected, auto-loading database...');
      const selectedFileObjects = getSelectedFileObjects();
      console.log('📋 Selected file objects retrieved:', selectedFileObjects.length);
      
      if (selectedFileObjects.length > 0) {
        const selectedFile = selectedFileObjects[0];
        console.log('📂 Selected file for database search:', {
          name: selectedFile?.originalName || selectedFile?.filename || selectedFile?.name,
          fileId: selectedFile?.fileId,
          _id: selectedFile?._id,
          id: selectedFile?.id,
          size: selectedFile?.size || selectedFile?.sizeBytes
        });
        
        // Show loading state while processing files
        setIsLoading(true);
        
        // Automatically detect database file and prepare for search
        setTimeout(() => {
          loadDatabasesFromFiles([selectedFile]);
          setIsLoading(false);
        }, 1000); // Add a small delay to show processing
      } else {
        console.log('⚠️ No file objects found despite selectedFiles having items');
        setSearchResults([]);
        setSearchQuery('');
      }
    } else {
      console.log('ℹ️ Clearing results - selectedFiles length:', selectedFiles.length, 'selectedCase:', !!selectedCase);
      // Clear results when no file selected
      setSearchResults([]);
      setSearchQuery('');
    }
  }, [selectedFiles, selectedCase]);

  const loadDatabasesFromFiles = async (fileObjects) => {
    console.log('🔄 loadDatabasesFromFiles called with:', fileObjects?.length, 'files');
    console.log('📋 File objects received:', fileObjects?.map(f => ({
      name: f.originalName || f.filename || f.name,
      fileId: f.fileId,
      _id: f._id,
      id: f.id
    })));
    
    if (!fileObjects || fileObjects.length === 0) {
      console.log('⚠️ No file objects provided to loadDatabasesFromFiles');
      setSearchResults([]);
      return;
    }
    
    // Filter files that might be databases
    const databaseFiles = fileObjects.filter(file => {
      const fileName = (file.originalName || file.filename || file.name || '').toLowerCase();
      return fileName.includes('.db') || fileName.includes('.sqlite') || 
             fileName.includes('database') || fileName.includes('.sql') ||
             fileName.includes('contacts') || fileName.includes('messages') ||
             fileName.includes('call_log') || fileName.includes('sms') ||
             fileName.includes('.json') || fileName.includes('data');
    });
    
    console.log('🗄️ Database files detected:', databaseFiles.length);
    console.log('📋 Database files:', databaseFiles.map(f => f.originalName || f.filename || f.name));
    
    if (databaseFiles.length > 0) {
      // Auto-set to search all databases initially
      setSearchQuery(''); // Clear any existing query
      setSearchType('all'); // Search all database types
      
      // Generate search results from the database files (now reads real content)
      const generatedResults = await generateSearchResultsFromFiles(databaseFiles);
      console.log('🎯 Setting search results:', generatedResults.length, 'items');
      console.log('📋 Sample results:', generatedResults.slice(0, 3));
      setOriginalFileResults(generatedResults);
      setSearchResults(generatedResults);
      
      // Show a notification that databases are ready
      console.log('✅ Databases loaded and ready for search - showing preview data');
      console.log('📊 Generated results:', generatedResults.length, 'entries');
      
    } else if (fileObjects.length > 0) {
      console.log('ℹ️ No database files found, but generating searchable data from other file types');
      // Generate results from any file type
      const generatedResults = await generateSearchResultsFromFiles(fileObjects);
      setOriginalFileResults(generatedResults);
      setSearchResults(generatedResults);
      console.log('📊 Generated', generatedResults.length, 'results from non-database files');
    } else {
      console.log('❌ No files provided, clearing search results');
      // Clear results when no files
      setSearchResults([]);
    }
  };

  // Fetch file content from backend
  const fetchFileContent = async (file, caseId) => {
    try {
      console.log('🌐 Fetching file content from backend for:', file.originalName || file.filename);
      
      const fileId = file.fileId || file._id || file.id;
      if (!fileId || !caseId) {
        console.log('❌ Missing fileId or caseId for file fetch');
        return null;
      }
      
      // Try to fetch file content from backend
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cases/${caseId}/files/${fileId}/content`);
      
      if (response.ok) {
        const content = await response.text();
        console.log('✅ Successfully fetched file content from backend');
        return content;
      } else {
        console.log('⚠️ Could not fetch file content from backend, status:', response.status);
        return null;
      }
    } catch (error) {
      console.log('❌ Error fetching file content:', error.message);
      return null;
    }
  };

  // Parse actual file content to extract real data
  const parseFileContent = async (file, caseId) => {
    try {
      console.log('📄 Attempting to parse file content for:', file.originalName || file.filename);
      
      // Try to get file content from different possible sources
      let fileContent = null;
      
      // If file has content property
      if (file.content) {
        fileContent = file.content;
      }
      // If file has data property  
      else if (file.data) {
        fileContent = file.data;
      }
      // If file has text content
      else if (file.textContent) {
        fileContent = file.textContent;
      }
      // If it's a JSON file with parsed content
      else if (file.parsedContent) {
        fileContent = JSON.stringify(file.parsedContent);
      }
      
      // If no content in file object, try to fetch from backend
      if (!fileContent) {
        console.log('⚠️ No content found in file object, trying to fetch from backend...');
        fileContent = await fetchFileContent(file, caseId);
      }
      
      if (!fileContent) {
        console.log('⚠️ No content available - returning empty results');
        return [];
      }
      
      console.log('📝 File content found, length:', typeof fileContent === 'string' ? fileContent.length : 'Not string');
      
      // Try to parse as JSON first
      let parsedData = null;
      try {
        parsedData = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
        console.log('✅ Successfully parsed JSON content');
      } catch (e) {
        console.log('ℹ️ Not JSON format, treating as text');
        parsedData = { rawText: fileContent };
      }
      
      return parsedData;
    } catch (error) {
      console.error('❌ Error parsing file content:', error);
      return null;
    }
  };

  // Extract real data from parsed file content
  const extractRealDataFromContent = (parsedContent, filename) => {
    const results = [];
    
    if (!parsedContent) {
      console.log('⚠️ No parsed content available - returning empty results');
      return [];
    }
    
    console.log('🔍 Extracting real data from parsed content...');
    console.log('📊 Content structure:', Object.keys(parsedContent));
    
    // Handle different data structures
    if (parsedContent.suspects && Array.isArray(parsedContent.suspects)) {
      console.log('👥 Processing', parsedContent.suspects.length, 'suspects from case data');
      parsedContent.suspects.forEach((suspect, index) => {
        // Main suspect entry
        results.push({
          id: `suspect_${suspect.id || index}`,
          type: 'Suspect',
          name: suspect.name || `Suspect ${index + 1}`,
          content: `Name: ${suspect.name || 'Unknown'}\nAge: ${suspect.age || 'Unknown'}\nNationality: ${suspect.nationality || 'Unknown'}\nOccupation: ${suspect.occupation || 'Unknown'}\nRole: ${suspect.role || 'Unknown'}\nRisk Level: ${suspect.riskLevel || 'Unknown'}`,
          source: filename,
          category: 'person',
          riskLevel: suspect.riskLevel ? suspect.riskLevel.toLowerCase() : 'medium',
          timestamp: suspect.lastKnownActivity || new Date().toISOString(),
          relevance: 95 + index,
          rawData: suspect
        });
        
        // Add phone numbers as separate searchable entries
        if (suspect.phoneNumbers && suspect.phoneNumbers.length > 0) {
          suspect.phoneNumbers.forEach((phone, phoneIndex) => {
            results.push({
              id: `phone_${suspect.id || index}_${phoneIndex}`,
              type: 'Phone Number',
              name: phone,
              content: `Phone: ${phone}\nOwner: ${suspect.name}\nType: Suspect Contact`,
              source: filename,
              category: 'communication',
              riskLevel: suspect.riskLevel ? suspect.riskLevel.toLowerCase() : 'medium',
              timestamp: new Date().toISOString(),
              relevance: 85,
              rawData: { phone, owner: suspect.name, suspectId: suspect.id }
            });
          });
        }
        
        // Add email addresses as separate searchable entries
        if (suspect.emailAccounts && suspect.emailAccounts.length > 0) {
          suspect.emailAccounts.forEach((email, emailIndex) => {
            results.push({
              id: `email_${suspect.id || index}_${emailIndex}`,
              type: 'Email Address',
              name: email,
              content: `Email: ${email}\nOwner: ${suspect.name}\nType: Suspect Account`,
              source: filename,
              category: 'communication',
              riskLevel: suspect.riskLevel ? suspect.riskLevel.toLowerCase() : 'medium',
              timestamp: new Date().toISOString(),
              relevance: 85,
              rawData: { email, owner: suspect.name, suspectId: suspect.id }
            });
          });
        }
        
        // Add known addresses as location entries
        if (suspect.knownAddresses && suspect.knownAddresses.length > 0) {
          suspect.knownAddresses.forEach((address, addressIndex) => {
            results.push({
              id: `address_${suspect.id || index}_${addressIndex}`,
              type: 'Address',
              name: address,
              content: `Address: ${address}\nAssociated Person: ${suspect.name}\nType: Known Address`,
              source: filename,
              category: 'location',
              riskLevel: 'high',
              timestamp: new Date().toISOString(),
              relevance: 80,
              rawData: { address, owner: suspect.name, suspectId: suspect.id }
            });
          });
        }
        
        // Add cryptocurrency wallets as financial entries
        if (suspect.digitalFootprint?.cryptocurrencyWallets) {
          suspect.digitalFootprint.cryptocurrencyWallets.forEach((wallet, walletIndex) => {
            results.push({
              id: `crypto_${suspect.id || index}_${walletIndex}`,
              type: 'Cryptocurrency Wallet',
              name: `${wallet.slice(0, 8)}...${wallet.slice(-8)}`,
              content: `Wallet Address: ${wallet}\nOwner: ${suspect.name}\nType: Cryptocurrency`,
              source: filename,
              category: 'financial',
              riskLevel: 'critical',
              timestamp: new Date().toISOString(),
              relevance: 90,
              rawData: { wallet, owner: suspect.name, suspectId: suspect.id }
            });
          });
        }
        
        // Add aliases as separate entries
        if (suspect.alias && suspect.alias.length > 0) {
          suspect.alias.forEach((aliasName, aliasIndex) => {
            results.push({
              id: `alias_${suspect.id || index}_${aliasIndex}`,
              type: 'Alias',
              name: aliasName,
              content: `Alias: ${aliasName}\nReal Name: ${suspect.name}\nType: Suspect Alias`,
              source: filename,
              category: 'identity',
              riskLevel: suspect.riskLevel ? suspect.riskLevel.toLowerCase() : 'medium',
              timestamp: new Date().toISOString(),
              relevance: 85,
              rawData: { alias: aliasName, realName: suspect.name, suspectId: suspect.id }
            });
          });
        }
      });
    }
    
    if (parsedContent.victims && Array.isArray(parsedContent.victims)) {
      console.log('👤 Processing', parsedContent.victims.length, 'victims from case data');
      parsedContent.victims.forEach((victim, index) => {
        results.push({
          id: `victim_${victim.id || index}`,
          type: 'Victim',
          name: victim.name || `Victim ${index + 1}`,
          content: `Name: ${victim.name || 'Unknown'}\nType: ${victim.type || 'Unknown'}\nIndustry: ${victim.industry || 'Unknown'}\nFinancial Loss: $${victim.financialLoss || 0}\nLocation: ${victim.location || victim.headquartersLocation || 'Unknown'}`,
          source: filename,
          category: 'person',
          riskLevel: 'high',
          timestamp: victim.reportedDate || victim.incidentDate || new Date().toISOString(),
          relevance: 90 + index,
          rawData: victim
        });
        
        // Add victim contact info
        if (victim.contactInfo) {
          if (victim.contactInfo.phone) {
            results.push({
              id: `victim_phone_${victim.id || index}`,
              type: 'Phone Number',
              name: victim.contactInfo.phone,
              content: `Phone: ${victim.contactInfo.phone}\nOwner: ${victim.name}\nType: Victim Contact`,
              source: filename,
              category: 'communication',
              riskLevel: 'medium',
              timestamp: new Date().toISOString(),
              relevance: 75,
              rawData: { phone: victim.contactInfo.phone, owner: victim.name, victimId: victim.id }
            });
          }
          
          if (victim.contactInfo.email) {
            results.push({
              id: `victim_email_${victim.id || index}`,
              type: 'Email Address',
              name: victim.contactInfo.email,
              content: `Email: ${victim.contactInfo.email}\nOwner: ${victim.name}\nType: Victim Contact`,
              source: filename,
              category: 'communication',
              riskLevel: 'medium',
              timestamp: new Date().toISOString(),
              relevance: 75,
              rawData: { email: victim.contactInfo.email, owner: victim.name, victimId: victim.id }
            });
          }
        }
      });
    }
    
    if (parsedContent.evidence && Array.isArray(parsedContent.evidence)) {
      console.log('📋 Processing', parsedContent.evidence.length, 'evidence items from case data');
      parsedContent.evidence.forEach((evidence, index) => {
        results.push({
          id: `evidence_${evidence.id || index}`,
          type: 'Evidence',
          name: evidence.name || evidence.description || `Evidence ${index + 1}`,
          content: `Type: ${evidence.type || 'Unknown'}\nCategory: ${evidence.category || 'Unknown'}\nDescription: ${evidence.description || 'No description'}\nSource: ${evidence.source || 'Unknown'}\nCollected: ${evidence.collectedDate || 'Unknown'}`,
          source: filename,
          category: 'evidence',
          riskLevel: evidence.significance || 'medium',
          timestamp: evidence.discoveredDate || evidence.collectedDate || new Date().toISOString(),
          relevance: 80 + index,
          rawData: evidence
        });
        
        // Process cryptocurrency analysis from evidence
        if (evidence.cryptoAnalysis?.primaryWallets) {
          evidence.cryptoAnalysis.primaryWallets.forEach((wallet, walletIndex) => {
            results.push({
              id: `evidence_crypto_${evidence.id || index}_${walletIndex}`,
              type: 'Cryptocurrency Evidence',
              name: `${wallet.currency} Wallet - ${wallet.balance}`,
              content: `Wallet: ${wallet.address}\nBalance: ${wallet.balance} ${wallet.currency}\nLinked Suspect: ${wallet.linkedSuspect || 'Unknown'}\nLast Activity: ${wallet.lastActivity || 'Unknown'}`,
              source: filename,
              category: 'financial',
              riskLevel: 'critical',
              timestamp: wallet.lastActivity || new Date().toISOString(),
              relevance: 95,
              rawData: wallet
            });
          });
        }
      });
    }
    
    // Process geographic data
    if (parsedContent.geographicData) {
      console.log('📍 Processing geographic data from case data');
      
      // Suspect locations
      if (parsedContent.geographicData.suspectLocations && Array.isArray(parsedContent.geographicData.suspectLocations)) {
        parsedContent.geographicData.suspectLocations.forEach((location, index) => {
          results.push({
            id: `suspect_location_${location.id || index}`,
            type: 'Suspect Location',
            name: location.name || location.address || `Location ${index + 1}`,
            content: `Name: ${location.name || 'Unknown'}\nAddress: ${location.address || 'Unknown'}\nCoordinates: ${location.coordinates ? location.coordinates.join(', ') : 'Unknown'}\nSuspect: ${location.suspect || 'Unknown'}\nSignificance: ${location.significance || 'Unknown'}`,
            source: filename,
            category: 'location',
            riskLevel: 'high',
            timestamp: new Date().toISOString(),
            relevance: 85,
            rawData: location
          });
        });
      }
      
      // Criminal activity locations
      if (parsedContent.geographicData.criminalActivity && Array.isArray(parsedContent.geographicData.criminalActivity)) {
        parsedContent.geographicData.criminalActivity.forEach((activity, index) => {
          results.push({
            id: `crime_location_${activity.id || index}`,
            type: 'Crime Location',
            name: activity.name || activity.address || `Crime Scene ${index + 1}`,
            content: `Name: ${activity.name || 'Unknown'}\nType: ${activity.type || 'Unknown'}\nAddress: ${activity.address || 'Unknown'}\nDate: ${activity.date || 'Unknown'}\nImpact: ${activity.impact || 'Unknown'}`,
            source: filename,
            category: 'location',
            riskLevel: activity.impact === 'HIGH' ? 'critical' : activity.impact === 'MEDIUM' ? 'high' : 'medium',
            timestamp: activity.date || new Date().toISOString(),
            relevance: 90,
            rawData: activity
          });
        });
      }
    }
    
    // Process network topology connections
    if (parsedContent.networkTopology?.edges && Array.isArray(parsedContent.networkTopology.edges)) {
      console.log('🔗 Processing network connections from case data');
      parsedContent.networkTopology.edges.forEach((edge, index) => {
        results.push({
          id: `connection_${index}`,
          type: 'Network Connection',
          name: `${edge.from} → ${edge.to}`,
          content: `From: ${edge.from}\nTo: ${edge.to}\nType: ${edge.type || 'Unknown'}\nStrength: ${edge.strength || 'Unknown'}\nFrequency: ${edge.frequency || 'Unknown'}`,
          source: filename,
          category: 'network',
          riskLevel: 'medium',
          timestamp: new Date().toISOString(),
          relevance: 75,
          rawData: edge
        });
      });
    }
    
    // Handle flat object with name properties
    if (typeof parsedContent === 'object' && !Array.isArray(parsedContent)) {
      Object.entries(parsedContent).forEach(([key, value], index) => {
        if (typeof value === 'object' && value !== null) {
          // Check if this looks like a person object
          if (value.name || value.firstName || value.lastName) {
            const name = value.name || `${value.firstName || ''} ${value.lastName || ''}`.trim();
            results.push({
              id: `person_${key}_${index}`,
              type: 'Person',
              title: name || key,
              content: JSON.stringify(value, null, 2),
              source: filename,
              category: 'person',
              riskLevel: value.riskLevel || value.risk || 'low',
              timestamp: value.timestamp || value.date || new Date().toISOString(),
              relevance: 70 + index,
              rawData: value
            });
          } else {
            // Generic data entry
            results.push({
              id: `data_${key}_${index}`,
              type: 'Data Entry',
              title: key,
              content: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
              source: filename,
              category: 'data',
              riskLevel: 'low',
              timestamp: new Date().toISOString(),
              relevance: 50 + index,
              rawData: value
            });
          }
        }
      });
    }
    
    console.log('✅ Extracted', results.length, 'real data entries');
    return results;
  };



  // Generate database search results from files (updated to use real content with enhanced mock fallback)
  const generateSearchResultsFromFiles = async (fileObjects) => {
    const results = [];
    const caseId = selectedCase?._id || selectedCase?.caseId;
    
    for (const file of fileObjects) {
      const filename = file.originalName || file.filename || file.name || '';
      console.log('🔄 Processing file for real data extraction:', filename);
      
      // Try to parse actual file content
      const parsedContent = await parseFileContent(file, caseId);
      
      // Extract real data from content
      const fileResults = extractRealDataFromContent(parsedContent, filename);
      
      if (fileResults.length > 0) {
        results.push(...fileResults);
        console.log('✅ Extracted', fileResults.length, 'real data entries from', filename);
      } else {
        // Generate enhanced mock data based on file type when no real content available
        console.log('🎭 Generating enhanced mock database results for', filename);
        const mockResults = generateEnhancedMockDatabaseResults(file);
        results.push(...mockResults);
        console.log('✅ Generated', mockResults.length, 'mock database entries for', filename);
      }
    }
      
    
    // Sort by relevance and timestamp
    return results.sort((a, b) => b.relevance - a.relevance || new Date(b.timestamp) - new Date(a.timestamp));
  };

  // Generate enhanced mock database results based on file type and name
  const generateEnhancedMockDatabaseResults = (file) => {
    const filename = file.originalName || file.filename || file.name || '';
    const fileType = getFileTypeFromName(filename);
    const results = [];
    
    console.log('🎯 Generating mock database results for file type:', fileType, 'filename:', filename);

    switch (fileType) {
      case 'contacts':
        results.push(...generateMockContactsDatabase(filename));
        break;
      case 'messages':
        results.push(...generateMockMessagesDatabase(filename));
        break;
      case 'calls':
        results.push(...generateMockCallLogDatabase(filename));
        break;
      case 'location':
        results.push(...generateMockLocationDatabase(filename));
        break;
      default:
        results.push(...generateMockGenericDatabase(filename, fileType));
        break;
    }

    // Also check for specific database types by filename patterns
    const name = filename.toLowerCase();
    if (name.includes('financial') || name.includes('bank') || name.includes('transaction') || name.includes('payment')) {
      results.push(...generateMockFinancialDatabase(filename));
    }
    if (name.includes('network') || name.includes('traffic') || name.includes('log') || name.includes('pcap')) {
      results.push(...generateMockNetworkDatabase(filename));
    }
    if (name.includes('mobile') || name.includes('phone') || name.includes('device') || name.includes('ufdr')) {
      results.push(...generateMockMobileForensicsDatabase(filename));
    }
    if (name.includes('browser') || name.includes('history') || name.includes('web') || name.includes('chrome') || name.includes('firefox')) {
      results.push(...generateMockBrowserDatabase(filename));
    }

    return results;
  };

  // Mock contacts database
  const generateMockContactsDatabase = (filename) => {
    const contacts = [
      { name: 'Michael Rodriguez', phone: '+1-555-0123', email: 'mrodriguez@email.com', relationship: 'Colleague' },
      { name: 'Sarah Chen', phone: '+1-555-0234', email: 'schen@business.com', relationship: 'Business Partner' },
      { name: 'David Kim', phone: '+1-555-0345', email: 'dkim@suspect.net', relationship: 'Unknown' },
      { name: 'Maria Santos', phone: '+1-555-0456', email: 'msantos@gmail.com', relationship: 'Friend' },
      { name: 'James Wilson', phone: '+1-555-0567', email: 'jwilson@company.org', relationship: 'Associate' },
      { name: 'Lisa Zhang', phone: '+1-555-0678', email: 'lzhang@proton.me', relationship: 'Encrypted Contact' },
      { name: 'Robert Johnson', phone: '+1-555-0789', email: 'rjohnson@temp.mail', relationship: 'Suspicious' },
      { name: 'Anna Petrov', phone: '+1-555-0890', email: 'apetrov@darkweb.onion', relationship: 'High Risk' }
    ];

    return contacts.map((contact, index) => ({
      id: `contact_${index}`,
      type: 'Contact',
      title: contact.name,
      content: `Phone: ${contact.phone}\nEmail: ${contact.email}\nRelationship: ${contact.relationship}\nLast Contact: ${new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      source: filename,
      category: 'person',
      riskLevel: contact.relationship.includes('Suspicious') || contact.relationship.includes('High Risk') ? 'high' : 
                 contact.relationship.includes('Unknown') || contact.email.includes('suspect') ? 'medium' : 'low',
      timestamp: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      relevance: contact.relationship.includes('High Risk') ? 95 : 
                 contact.relationship.includes('Suspicious') ? 85 : 70,
      rawData: contact
    }));
  };

  // Mock messages database
  const generateMockMessagesDatabase = (filename) => {
    const messages = [
      { from: '+1-555-0123', to: '+1-555-0234', message: 'Meeting at the usual place tonight', timestamp: '2024-01-15 18:30' },
      { from: '+1-555-0234', to: '+1-555-0345', message: 'The package is ready for delivery', timestamp: '2024-01-15 19:45' },
      { from: '+1-555-0345', to: '+1-555-0123', message: 'Transfer completed. Check your account.', timestamp: '2024-01-16 09:15' },
      { from: '+1-555-0456', to: '+1-555-0567', message: 'Delete all traces. They are getting close.', timestamp: '2024-01-16 14:20' },
      { from: '+1-555-0567', to: '+1-555-0678', message: 'New encrypted channel: xyz123abc', timestamp: '2024-01-16 16:30' },
      { from: '+1-555-0678', to: '+1-555-0789', message: 'Coordinates: 40.7128, -74.0060', timestamp: '2024-01-17 08:45' },
      { from: '+1-555-0789', to: '+1-555-0890', message: '5 BTC transferred to wallet addr...xyz', timestamp: '2024-01-17 11:20' }
    ];

    return messages.map((msg, index) => ({
      id: `message_${index}`,
      type: 'Message',
      title: `SMS: ${msg.from} → ${msg.to}`,
      content: `Message: "${msg.message}"\nFrom: ${msg.from}\nTo: ${msg.to}\nTime: ${msg.timestamp}`,
      source: filename,
      category: 'communication',
      riskLevel: msg.message.includes('delete') || msg.message.includes('traces') || msg.message.includes('encrypted') ? 'critical' :
                 msg.message.includes('transfer') || msg.message.includes('BTC') || msg.message.includes('package') ? 'high' : 'medium',
      timestamp: new Date(msg.timestamp).toISOString(),
      relevance: msg.message.includes('delete') ? 95 : msg.message.includes('BTC') ? 90 : 75,
      rawData: msg
    }));
  };

  // Mock call log database
  const generateMockCallLogDatabase = (filename) => {
    const calls = [
      { caller: '+1-555-0123', receiver: '+1-555-0234', duration: '00:03:45', type: 'Outgoing', timestamp: '2024-01-15 14:30' },
      { caller: '+1-555-0345', receiver: '+1-555-0123', duration: '00:12:30', type: 'Incoming', timestamp: '2024-01-15 18:15' },
      { caller: '+1-555-0234', receiver: '+1-555-0567', duration: '00:01:15', type: 'Outgoing', timestamp: '2024-01-16 09:45' },
      { caller: '+1-555-0678', receiver: '+1-555-0234', duration: '00:25:40', type: 'Incoming', timestamp: '2024-01-16 15:20' },
      { caller: '+1-555-0123', receiver: '+1-555-0789', duration: '00:00:45', type: 'Missed', timestamp: '2024-01-17 08:30' },
      { caller: '+1-555-0890', receiver: '+1-555-0345', duration: '00:08:20', type: 'Incoming', timestamp: '2024-01-17 19:10' }
    ];

    return calls.map((call, index) => ({
      id: `call_${index}`,
      type: 'Call Record',
      title: `${call.type} Call: ${call.caller} → ${call.receiver}`,
      content: `Caller: ${call.caller}\nReceiver: ${call.receiver}\nDuration: ${call.duration}\nType: ${call.type}\nTime: ${call.timestamp}`,
      source: filename,
      category: 'communication',
      riskLevel: call.duration === '00:00:45' ? 'medium' : 
                 parseInt(call.duration.split(':')[1]) > 15 ? 'high' : 'low',
      timestamp: new Date(call.timestamp).toISOString(),
      relevance: call.type === 'Missed' ? 85 : parseInt(call.duration.split(':')[1]) > 15 ? 80 : 70,
      rawData: call
    }));
  };

  // Mock location database
  const generateMockLocationDatabase = (filename) => {
    const locations = [
      { name: 'Financial District Office', lat: 40.7074, lng: -74.0113, accuracy: '5m', timestamp: '2024-01-15 09:30' },
      { name: 'Suspicious Warehouse', lat: 40.6892, lng: -74.0445, accuracy: '10m', timestamp: '2024-01-15 18:45' },
      { name: 'Luxury Hotel Suite', lat: 40.7589, lng: -73.9851, accuracy: '3m', timestamp: '2024-01-16 14:20' },
      { name: 'Cryptocurrency Exchange', lat: 40.7505, lng: -73.9934, accuracy: '8m', timestamp: '2024-01-16 16:15' },
      { name: 'Abandoned Building', lat: 40.6743, lng: -73.9194, accuracy: '15m', timestamp: '2024-01-17 02:30' },
      { name: 'International Airport', lat: 40.6413, lng: -73.7781, accuracy: '20m', timestamp: '2024-01-17 11:45' }
    ];

    return locations.map((location, index) => ({
      id: `location_${index}`,
      type: 'GPS Location',
      title: location.name,
      content: `Location: ${location.name}\nCoordinates: ${location.lat}, ${location.lng}\nAccuracy: ${location.accuracy}\nTime: ${location.timestamp}`,
      source: filename,
      category: 'location',
      riskLevel: location.name.includes('Suspicious') || location.name.includes('Abandoned') ? 'critical' :
                 location.name.includes('Cryptocurrency') ? 'high' : 'medium',
      timestamp: new Date(location.timestamp).toISOString(),
      relevance: location.name.includes('Suspicious') ? 95 : location.name.includes('Cryptocurrency') ? 90 : 75,
      rawData: location
    }));
  };

  // Mock financial database
  const generateMockFinancialDatabase = (filename) => {
    const transactions = [
      { account: 'Account ***2134', amount: '$15,750.00', type: 'Wire Transfer', recipient: 'Offshore Holdings LLC', date: '2024-01-15' },
      { account: 'Wallet 1A2b3C...', amount: '2.5 BTC', type: 'Cryptocurrency', recipient: 'Anonymous Wallet', date: '2024-01-16' },
      { account: 'Account ***5678', amount: '$850,000.00', type: 'Large Deposit', recipient: 'Suspicious Entity Inc', date: '2024-01-16' },
      { account: 'Card ***9012', amount: '$3,200.00', type: 'ATM Withdrawal', recipient: 'Cash', date: '2024-01-17' },
      { account: 'Wallet 9Z8y7X...', amount: '0.8 ETH', type: 'Smart Contract', recipient: 'DeFi Protocol', date: '2024-01-17' }
    ];

    return transactions.map((txn, index) => ({
      id: `transaction_${index}`,
      type: 'Financial Transaction',
      title: `${txn.type}: ${txn.amount}`,
      content: `Amount: ${txn.amount}\nAccount: ${txn.account}\nType: ${txn.type}\nRecipient: ${txn.recipient}\nDate: ${txn.date}`,
      source: filename,
      category: 'financial',
      riskLevel: txn.amount.includes('850,000') || txn.recipient.includes('Suspicious') || txn.recipient.includes('Anonymous') ? 'critical' :
                 txn.type.includes('Cryptocurrency') || txn.recipient.includes('Offshore') ? 'high' : 'medium',
      timestamp: new Date(txn.date).toISOString(),
      relevance: txn.amount.includes('850,000') ? 98 : txn.type.includes('Cryptocurrency') ? 88 : 78,
      rawData: txn
    }));
  };

  // Mock network database
  const generateMockNetworkDatabase = (filename) => {
    const networkLogs = [
      { src_ip: '192.168.1.100', dst_ip: '203.45.67.89', protocol: 'TCP', port: '443', bytes: '2.5MB', timestamp: '2024-01-15 14:30:22' },
      { src_ip: '10.0.0.50', dst_ip: '85.123.45.67', protocol: 'UDP', port: '53', bytes: '1.2KB', timestamp: '2024-01-15 18:45:11' },
      { src_ip: '172.16.0.25', dst_ip: '198.51.100.42', protocol: 'TCP', port: '8080', bytes: '15.8MB', timestamp: '2024-01-16 09:15:33' },
      { src_ip: '192.168.1.100', dst_ip: '124.56.78.90', protocol: 'HTTPS', port: '443', bytes: '850KB', timestamp: '2024-01-16 16:20:44' },
      { src_ip: '10.0.0.75', dst_ip: '203.45.67.89', protocol: 'TCP', port: '9050', bytes: '25.3MB', timestamp: '2024-01-17 02:45:15' }
    ];

    return networkLogs.map((log, index) => ({
      id: `network_${index}`,
      type: 'Network Traffic',
      title: `${log.protocol}: ${log.src_ip} → ${log.dst_ip}`,
      content: `Source: ${log.src_ip}\nDestination: ${log.dst_ip}\nProtocol: ${log.protocol}\nPort: ${log.port}\nBytes: ${log.bytes}\nTime: ${log.timestamp}`,
      source: filename,
      category: 'network',
      riskLevel: log.port === '9050' || log.bytes.includes('25.3MB') ? 'high' :
                 log.protocol === 'TCP' && log.port === '8080' ? 'medium' : 'low',
      timestamp: new Date(log.timestamp).toISOString(),
      relevance: log.port === '9050' ? 92 : log.bytes.includes('25.3MB') ? 85 : 72,
      rawData: log
    }));
  };

  // Mock mobile forensics database
  const generateMockMobileForensicsDatabase = (filename) => {
    const mobileData = [
      { app: 'WhatsApp', data_type: 'Messages', count: '1,247 messages', last_activity: '2024-01-17 10:30' },
      { app: 'Telegram', data_type: 'Secret Chats', count: '89 messages', last_activity: '2024-01-17 08:15' },
      { app: 'Signal', data_type: 'Encrypted Messages', count: '456 messages', last_activity: '2024-01-16 22:45' },
      { app: 'Instagram', data_type: 'Direct Messages', count: '234 messages', last_activity: '2024-01-16 19:20' },
      { app: 'Crypto Wallet', data_type: 'Transaction History', count: '23 transactions', last_activity: '2024-01-15 16:30' },
      { app: 'Banking App', data_type: 'Account Access', count: '12 logins', last_activity: '2024-01-17 09:45' }
    ];

    return mobileData.map((data, index) => ({
      id: `mobile_${index}`,
      type: 'Mobile App Data',
      title: `${data.app}: ${data.data_type}`,
      content: `App: ${data.app}\nData Type: ${data.data_type}\nCount: ${data.count}\nLast Activity: ${data.last_activity}`,
      source: filename,
      category: 'digital',
      riskLevel: data.app.includes('Telegram') || data.app.includes('Signal') || data.app.includes('Crypto') ? 'high' :
                 data.app.includes('WhatsApp') || data.app.includes('Banking') ? 'medium' : 'low',
      timestamp: new Date(data.last_activity).toISOString(),
      relevance: data.app.includes('Secret') ? 95 : data.app.includes('Crypto') ? 90 : 75,
      rawData: data
    }));
  };

  // Mock browser database
  const generateMockBrowserDatabase = (filename) => {
    const browserData = [
      { url: 'https://darkweb.onion/marketplace', title: 'Underground Marketplace', visits: 23, last_visit: '2024-01-17 03:15' },
      { url: 'https://cryptocurrency-exchange.com/trade', title: 'Crypto Trading Platform', visits: 67, last_visit: '2024-01-16 18:30' },
      { url: 'https://protonmail.com/encrypted-email', title: 'Secure Email Service', visits: 45, last_visit: '2024-01-16 14:20' },
      { url: 'https://banking.suspicious-offshore.com', title: 'Offshore Banking Portal', visits: 12, last_visit: '2024-01-15 09:45' },
      { url: 'https://tor-browser.org/download', title: 'Anonymous Browser Download', visits: 8, last_visit: '2024-01-15 16:10' }
    ];

    return browserData.map((data, index) => ({
      id: `browser_${index}`,
      type: 'Browser History',
      title: data.title,
      content: `URL: ${data.url}\nTitle: ${data.title}\nVisits: ${data.visits}\nLast Visit: ${data.last_visit}`,
      source: filename,
      category: 'digital',
      riskLevel: data.url.includes('darkweb') || data.url.includes('suspicious') ? 'critical' :
                 data.url.includes('cryptocurrency') || data.url.includes('protonmail') || data.url.includes('tor') ? 'high' : 'medium',
      timestamp: new Date(data.last_visit).toISOString(),
      relevance: data.url.includes('darkweb') ? 98 : data.url.includes('suspicious') ? 95 : 80,
      rawData: data
    }));
  };

  // Mock generic database
  const generateMockGenericDatabase = (filename, fileType) => {
    const genericData = [
      { type: 'System Log', entry: 'Unauthorized access attempt detected', severity: 'High', timestamp: '2024-01-17 05:30' },
      { type: 'User Account', entry: 'Account created with fake credentials', severity: 'Critical', timestamp: '2024-01-16 12:15' },
      { type: 'Configuration', entry: 'Security settings modified', severity: 'Medium', timestamp: '2024-01-16 08:45' },
      { type: 'Database Query', entry: 'Sensitive data access logged', severity: 'High', timestamp: '2024-01-15 19:20' },
      { type: 'File Access', entry: 'Confidential document downloaded', severity: 'Critical', timestamp: '2024-01-15 14:10' }
    ];

    return genericData.map((data, index) => ({
      id: `generic_${index}`,
      type: data.type,
      title: `${data.type}: ${data.entry}`,
      content: `Entry: ${data.entry}\nSeverity: ${data.severity}\nTime: ${data.timestamp}\nFile: ${filename}`,
      source: filename,
      category: 'data',
      riskLevel: data.severity === 'Critical' ? 'critical' : data.severity === 'High' ? 'high' : 'medium',
      timestamp: new Date(data.timestamp).toISOString(),
      relevance: data.severity === 'Critical' ? 95 : data.severity === 'High' ? 85 : 75,
      rawData: data
    }));
  };

  // Enhanced helper function to determine file type from filename (using utility)
  const getFileTypeFromName = (filename, fileSize = 0) => {
    const detectedType = detectFileType(filename, fileSize);
    
    // Map the detailed types to our database search categories
    const typeMapping = {
      'mobile_forensics': 'messages',
      'network_capture': 'network',
      'communications': 'messages', 
      'contacts': 'contacts',
      'call_logs': 'calls',
      'location_data': 'location',
      'financial_data': 'financial',
      'browser_data': 'messages',
      'system_logs': 'calls',
      'database': 'contacts',
      'case_data': 'data'
    };
    
    return typeMapping[detectedType] || 'data';
  };
  
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

  // Store original file-based results
  const [originalFileResults, setOriginalFileResults] = useState([]);

  // Search function
  const performSearch = async () => {
    console.log('🔍 performSearch called with query:', searchQuery, 'type:', searchType);
    
    // If we have original file results, filter those instead of case data
    if (originalFileResults.length > 0) {
      console.log('ℹ️ Filtering file-based search results');
      let filteredResults = [...originalFileResults];
      
      // Apply search type filter
      if (searchType !== 'all') {
        filteredResults = filteredResults.filter(item => {
          const itemType = item.type.toLowerCase();
          return itemType === searchType || itemType.includes(searchType);
        });
      }
      
      // Apply search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filteredResults = filteredResults.filter(item => 
          matchesSearchCriteria(item, query, item.type)
        );
      }
      
      // Apply other filters
      filteredResults = applyFilters(filteredResults);
      
      console.log('✅ Filtered results:', filteredResults.length, 'from', originalFileResults.length);
      setSearchResults(filteredResults);
      return;
    }
    
    if (!hasData || !caseData) {
      console.log('ℹ️ No case data available for search');
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
      if (filterCriteria.riskLevel !== 'all' && item.riskLevel !== filterCriteria.riskLevel) {
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

  // Perform search when query or filters change (only for case data search)
  useEffect(() => {
    // Only perform case data search if we have case data and no file-based results
    if (hasData && caseData && searchResults.length === 0) {
      const timeoutId = setTimeout(() => {
        performSearch();
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, searchType, filterCriteria, advancedFilters, hasData, caseData]);

  // Render search result item
  const renderSearchResult = (item, index) => (
    <div
      key={`${item.type}-${item.id || index}`}
      style={{
        backgroundColor: selectedItem?.id === item.id ? '#e0f2fe' : '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onClick={() => setSelectedItem(item)}
      onMouseEnter={(e) => {
        if (selectedItem?.id !== item.id) {
          e.target.style.backgroundColor = '#f8fafc';
        }
      }}
      onMouseLeave={(e) => {
        if (selectedItem?.id !== item.id) {
          e.target.style.backgroundColor = '#f8fafc';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{ fontSize: '20px' }}>{item.icon}</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
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
        <p style={{ fontSize: '14px', color: '#64748b', margin: '8px 0 0 0', lineHeight: '1.4' }}>
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
            <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
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
                <span style={{ fontSize: '14px', color: '#1e293b', wordBreak: 'break-word' }}>
                  {typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Only show "No Data Available" if we have no case data AND no selected files
  if (!hasData && selectedFiles.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '400px',
        backgroundColor: '#f8fafc',
        color: '#64748b',
        borderRadius: '8px',
        border: '2px dashed #cbd5e1',
        margin: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>No Data Available</h3>
        <p style={{ textAlign: 'center', maxWidth: '300px' }}>
          Upload UFDR files or select a file to start searching through case data, evidence, and forensic information.
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
        backgroundColor: '#ffffff',
        color: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center'
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
        backgroundColor: '#ffffff',
        color: '#1e293b',
        alignItems: 'center',
        justifyContent: 'center'
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
            No File Selected
          </h3>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5', marginBottom: '16px' }}>
            Please select a single file from the header dropdown to search its database contents
          </p>
          <div style={{ 
            padding: '12px 16px',
            backgroundColor: '#e0f2fe',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#1e293b',
            border: '1px solid #0ea5e9'
          }}>
            💡 Tip: Click the Files button in the header and select one file for search
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      backgroundColor: '#ffffff',
      color: '#1e293b',
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
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Search Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
            🔍 Database Search
          </h2>
          
          {/* Debug Info */}
          <div style={{ 
            backgroundColor: '#ffffff', 
            padding: '8px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            fontSize: '12px',
            color: '#64748b'
          }}>
            <div>Selected Files: {selectedFiles.length}</div>
            <div>Case Files: {caseFiles?.length || 0}</div>
            <div>Search Results: {searchResults.length}</div>
          </div>
          
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
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#1e293b',
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
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
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
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  color: '#1e293b',
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
              backgroundColor: showAdvancedSearch ? '#e0f2fe' : 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              color: '#1e293b',
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
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
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
                    <label style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', display: 'block' }}>
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
                        backgroundColor: '#f8fafc',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#1e293b',
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
            {/* Debug: Show when we have results but they're not displaying */}
            {searchResults.length > 0 && (
              <div style={{ fontSize: '10px', color: '#059669' }}>✅ Results</div>
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
              {/* Debug info */}
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '8px' }}>
                Debug: selectedFiles={selectedFiles.length}, hasData={hasData ? 'true' : 'false'}
              </div>
            </div>
          ) : (
            <div>
              {console.log('🎨 Rendering', searchResults.length, 'search results')}
              {searchResults.map((item, index) => renderSearchResult(item, index))}
            </div>
          )}
        </div>
      </div>

      {/* Details Panel */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        overflow: 'auto',
        minWidth: 0
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
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
