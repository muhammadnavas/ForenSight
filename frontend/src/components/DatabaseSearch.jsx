import { useEffect, useState } from 'react';
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
      const fileName = file.originalName || file.filename || file.name || 'unknown';
      console.log('📄 Attempting to parse file content for:', fileName);
      
      // Try to get file content from different possible sources
      let fileContent = null;
      
      // Priority order for finding content
      if (file.content) {
        fileContent = file.content;
        console.log('📄 Using file.content property');
      }
      else if (file.data) {
        fileContent = file.data;
        console.log('📄 Using file.data property');
      }
      else if (file.textContent) {
        fileContent = file.textContent;
        console.log('📄 Using file.textContent property');
      }
      else if (file.parsedContent) {
        // If parsedContent is already an object, use it directly
        if (typeof file.parsedContent === 'object') {
          console.log('📄 Using file.parsedContent object directly');
          return file.parsedContent;
        } else {
          fileContent = file.parsedContent;
          console.log('📄 Using file.parsedContent property');
        }
      }
      else if (file.fileContent) {
        fileContent = file.fileContent;
        console.log('📄 Using file.fileContent property');
      }
      
      // If no content in file object, try to fetch from backend
      if (!fileContent) {
        console.log('⚠️ No content found in file object, trying to fetch from backend...');
        fileContent = await fetchFileContent(file, caseId);
      }
      
      if (!fileContent) {
        console.log('❌ No content available for file:', fileName);
        return null;
      }
      
      const contentType = typeof fileContent;
      const contentLength = contentType === 'string' ? fileContent.length : 'object';
      console.log('📝 File content found - Type:', contentType, 'Length:', contentLength);
      
      // If content is already an object, return it directly
      if (contentType === 'object' && fileContent !== null) {
        console.log('✅ Content is already parsed object');
        console.log('📊 Object keys:', Object.keys(fileContent));
        return fileContent;
      }
      
      // Try to parse as JSON first
      if (contentType === 'string') {
        // Handle empty or very short content
        if (fileContent.trim().length < 2) {
          console.log('⚠️ Content too short or empty');
          return null;
        }
        
        try {
          const parsedData = JSON.parse(fileContent);
          console.log('✅ Successfully parsed JSON content');
          console.log('📊 Parsed data structure:', Object.keys(parsedData));
          return parsedData;
        } catch (jsonError) {
          console.log('ℹ️ Not valid JSON format, treating as text content');
          console.log('🔍 JSON parse error:', jsonError.message.substring(0, 100));
          
          // For non-JSON files, return structured text data
          return {
            rawText: fileContent,
            fileName: fileName,
            fileType: fileName.split('.').pop()?.toLowerCase() || 'unknown'
          };
        }
      }
      
      console.log('⚠️ Unknown content format');
      return null;
      
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
    
    // Handle flat object with name properties (contacts, messages, etc.)
    if (typeof parsedContent === 'object' && !Array.isArray(parsedContent)) {
      Object.entries(parsedContent).forEach(([key, value], index) => {
        if (typeof value === 'object' && value !== null) {
          // Check if this looks like a person/contact object
          if (value.name || value.firstName || value.lastName) {
            const personName = value.name || `${value.firstName || ''} ${value.lastName || ''}`.trim();
            results.push({
              id: `person_${key}_${index}`,
              type: 'Person',
              name: personName || key,
              content: `Name: ${personName}\n${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
              source: filename,
              category: 'person',
              riskLevel: value.riskLevel || value.risk || 'medium',
              timestamp: value.timestamp || value.date || new Date().toISOString(),
              relevance: 70 + index,
              rawData: value
            });
          } 
          // Check if this looks like a message object
          else if (value.message || value.text || value.content) {
            results.push({
              id: `message_${key}_${index}`,
              type: 'Message',
              name: (value.message || value.text || value.content || `Message ${index + 1}`).substring(0, 50) + '...',
              content: `Message: ${value.message || value.text || value.content}\n${Object.entries(value).filter(([k]) => !['message', 'text', 'content'].includes(k)).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
              source: filename,
              category: 'communication',
              riskLevel: 'medium',
              timestamp: value.timestamp || value.date || new Date().toISOString(),
              relevance: 75 + index,
              rawData: value
            });
          }
          // Check if this looks like a location object
          else if (value.latitude || value.longitude || value.coordinates || value.address) {
            results.push({
              id: `location_${key}_${index}`,
              type: 'Location',
              name: value.address || value.name || `Location ${index + 1}`,
              content: `Location: ${value.address || value.name || 'Unknown'}\n${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
              source: filename,
              category: 'location',
              riskLevel: 'medium',
              timestamp: value.timestamp || new Date().toISOString(),
              relevance: 70 + index,
              rawData: value
            });
          }
          // Generic object with useful data
          else if (Object.keys(value).length > 0) {
            results.push({
              id: `data_${key}_${index}`,
              type: 'Data Entry',
              name: value.title || value.name || key || `Entry ${index + 1}`,
              content: `${Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
              source: filename,
              category: 'data',
              riskLevel: 'low',
              timestamp: value.timestamp || value.date || new Date().toISOString(),
              relevance: 60 + index,
              rawData: value
            });
          }
        }
        // Handle simple key-value pairs
        else if (value && typeof value === 'string' && value.length > 0) {
          results.push({
            id: `field_${key}_${index}`,
            type: 'Data Field',
            name: `${key}: ${value.substring(0, 30)}${value.length > 30 ? '...' : ''}`,
            content: `Field: ${key}\nValue: ${value}`,
            source: filename,
            category: 'data',
            riskLevel: 'low',
            timestamp: new Date().toISOString(),
            relevance: 50 + index,
            rawData: { [key]: value }
          });
        }
      });
    }

    // Handle arrays at root level
    if (Array.isArray(parsedContent)) {
      console.log('📋 Processing array data with', parsedContent.length, 'items');
      parsedContent.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          // Process each item in the array
          const itemName = item.name || item.title || item.id || `Item ${index + 1}`;
          results.push({
            id: `array_item_${index}`,
            type: 'Array Item',
            name: itemName,
            content: `${Object.entries(item).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
            source: filename,
            category: 'data',
            riskLevel: 'medium',
            timestamp: item.timestamp || item.date || new Date().toISOString(),
            relevance: 65 + index,
            rawData: item
          });
        }
      });
    }

    // Handle text content that might contain structured data
    if (parsedContent.rawText) {
      console.log('📝 Processing raw text content');
      const textContent = parsedContent.rawText;
      
      // Try to extract phone numbers
      const phoneRegex = /(\+?\d{1,4}[\s\-]?\(?\d{1,4}\)?[\s\-]?\d{1,4}[\s\-]?\d{1,9})/g;
      const phones = textContent.match(phoneRegex);
      if (phones) {
        phones.forEach((phone, index) => {
          results.push({
            id: `phone_text_${index}`,
            type: 'Phone Number',
            name: phone,
            content: `Phone: ${phone}\nFound in: ${filename}`,
            source: filename,
            category: 'communication',
            riskLevel: 'medium',
            timestamp: new Date().toISOString(),
            relevance: 80,
            rawData: { phone }
          });
        });
      }
      
      // Try to extract email addresses
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = textContent.match(emailRegex);
      if (emails) {
        emails.forEach((email, index) => {
          results.push({
            id: `email_text_${index}`,
            type: 'Email Address',
            name: email,
            content: `Email: ${email}\nFound in: ${filename}`,
            source: filename,
            category: 'communication',
            riskLevel: 'medium',
            timestamp: new Date().toISOString(),
            relevance: 80,
            rawData: { email }
          });
        });
      }
    }
    
    console.log('✅ Extracted', results.length, 'real data entries from', filename);
    console.log('📊 Data categories found:', [...new Set(results.map(r => r.category))]);
    return results;
  };



  // Generate database search results from files (real data only)
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
        console.log('⚠️ No extractable data found in file:', filename);
        console.log('📊 File content structure:', parsedContent ? Object.keys(parsedContent) : 'null');
      }
    }
    
    if (results.length === 0) {
      console.log('ℹ️ No data extracted from any files. Please ensure files contain valid JSON data with suspects, victims, evidence, or other case data.');
    }
    
    // Sort by relevance and timestamp
    return results.sort((a, b) => b.relevance - a.relevance || new Date(b.timestamp) - new Date(a.timestamp));
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
