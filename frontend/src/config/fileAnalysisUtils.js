// File Analysis Utilities for ForenSight
// Shared utilities for analyzing file types, content, and generating appropriate mock data

/**
 * Enhanced file type detection for forensic analysis
 * Determines file purpose based on filename, extension, and content patterns
 */
export const detectFileType = (filename, fileSize = 0, metadata = {}) => {
  if (!filename) return 'unknown';
  
  const name = filename.toLowerCase();
  const ext = name.split('.').pop();
  
  // Priority-based detection (most specific first)
  
  // Mobile forensic files
  if (ext === 'ufdr' || ext === 'ufd' || name.includes('logical') || name.includes('physical')) {
    return 'mobile_forensics';
  }
  
  // Network analysis files
  if (['pcap', 'pcapng', 'cap'].includes(ext) || name.includes('wireshark') || name.includes('tcpdump')) {
    return 'network_capture';
  }
  
  // Communication data
  if (name.includes('chat') || name.includes('message') || name.includes('sms') || name.includes('whatsapp') || name.includes('telegram')) {
    return 'communications';
  }
  
  // Contact databases
  if (name.includes('contact') || name.includes('phonebook') || name.includes('address')) {
    return 'contacts';
  }
  
  // Call logs
  if (name.includes('call') || name.includes('dialer') || (name.includes('log') && (name.includes('call') || name.includes('phone')))) {
    return 'call_logs';
  }
  
  // Location data
  if (name.includes('location') || name.includes('gps') || name.includes('coordinate') || ['kml', 'gpx', 'geo'].includes(ext)) {
    return 'location_data';
  }
  
  // Financial data
  if (name.includes('bank') || name.includes('financial') || name.includes('transaction') || name.includes('payment') || name.includes('wallet') || name.includes('crypto')) {
    return 'financial_data';
  }
  
  // Browser data
  if (name.includes('browser') || name.includes('history') || name.includes('bookmark') || name.includes('chrome') || name.includes('firefox') || name.includes('safari')) {
    return 'browser_data';
  }
  
  // System logs
  if (name.includes('system') || name.includes('event') || name.includes('audit') || (name.includes('log') && !name.includes('call'))) {
    return 'system_logs';
  }
  
  // Database files
  if (['db', 'sqlite', 'sqlite3', 'sql'].includes(ext)) {
    return 'database';
  }
  
  // Case files (JSON with forensic data)
  if (ext === 'json' && (name.includes('case') || name.includes('evidence') || name.includes('forensic'))) {
    return 'case_data';
  }
  
  // Image/media files
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'raw'].includes(ext)) {
    return 'image_evidence';
  }
  
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(ext)) {
    return 'video_evidence';
  }
  
  if (['mp3', 'wav', 'aac', 'flac', 'ogg'].includes(ext)) {
    return 'audio_evidence';
  }
  
  // Document files
  if (['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(ext)) {
    return 'document_evidence';
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return 'archive';
  }
  
  // Memory dumps
  if (name.includes('memory') || name.includes('dump') || name.includes('ram') || ext === 'dmp') {
    return 'memory_dump';
  }
  
  // Disk images
  if (['dd', 'img', 'raw', 'e01', 'ex01', 'aff', 'afd'].includes(ext)) {
    return 'disk_image';
  }
  
  return 'generic_data';
};

/**
 * Get file analysis metadata for forensic context
 */
export const getFileAnalysisMetadata = (filename, fileSize = 0) => {
  const fileType = detectFileType(filename, fileSize);
  
  const metadata = {
    type: fileType,
    category: getFileCategory(fileType),
    priority: getFilePriority(fileType),
    riskLevel: getFileRiskLevel(fileType),
    expectedDataTypes: getExpectedDataTypes(fileType),
    analysisComplexity: getAnalysisComplexity(fileType),
    estimatedRecords: estimateRecordCount(fileType, fileSize),
    forensicValue: getForensicValue(fileType)
  };
  
  return metadata;
};

/**
 * Categorize file types into broader forensic categories
 */
export const getFileCategory = (fileType) => {
  const categories = {
    'mobile_forensics': 'mobile',
    'communications': 'communication',
    'contacts': 'communication', 
    'call_logs': 'communication',
    'network_capture': 'network',
    'location_data': 'location',
    'financial_data': 'financial',
    'browser_data': 'digital',
    'system_logs': 'system',
    'database': 'data',
    'case_data': 'case',
    'image_evidence': 'media',
    'video_evidence': 'media',
    'audio_evidence': 'media',
    'document_evidence': 'document',
    'archive': 'container',
    'memory_dump': 'system',
    'disk_image': 'system',
    'generic_data': 'data'
  };
  
  return categories[fileType] || 'unknown';
};

/**
 * Assign priority levels for analysis order
 */
export const getFilePriority = (fileType) => {
  const priorities = {
    'case_data': 1,
    'communications': 2,
    'financial_data': 2,
    'contacts': 3,
    'call_logs': 3,
    'location_data': 3,
    'mobile_forensics': 4,
    'network_capture': 4,
    'browser_data': 5,
    'system_logs': 6,
    'database': 7,
    'document_evidence': 8,
    'media': 9,
    'archive': 10
  };
  
  return priorities[fileType] || 99;
};

/**
 * Assess risk level based on file type
 */
export const getFileRiskLevel = (fileType) => {
  const riskLevels = {
    'communications': 'high',
    'financial_data': 'critical',
    'network_capture': 'high',
    'mobile_forensics': 'high',
    'case_data': 'critical',
    'contacts': 'medium',
    'call_logs': 'medium',
    'location_data': 'medium',
    'browser_data': 'medium',
    'system_logs': 'low',
    'database': 'medium',
    'document_evidence': 'low',
    'media': 'low'
  };
  
  return riskLevels[fileType] || 'low';
};

/**
 * Get expected data types that can be extracted from each file type
 */
export const getExpectedDataTypes = (fileType) => {
  const dataTypes = {
    'mobile_forensics': ['contacts', 'messages', 'call_logs', 'app_data', 'location', 'media'],
    'communications': ['messages', 'participants', 'timestamps', 'attachments', 'metadata'],
    'contacts': ['names', 'phone_numbers', 'emails', 'addresses', 'relationships'],
    'call_logs': ['caller_id', 'duration', 'timestamps', 'call_type', 'frequency'],
    'network_capture': ['ip_addresses', 'protocols', 'traffic_volume', 'connections', 'ports'],
    'location_data': ['coordinates', 'addresses', 'timestamps', 'accuracy', 'movement_patterns'],
    'financial_data': ['transactions', 'accounts', 'amounts', 'participants', 'timestamps'],
    'browser_data': ['urls', 'search_history', 'downloads', 'cookies', 'session_data'],
    'system_logs': ['events', 'timestamps', 'users', 'processes', 'errors'],
    'database': ['records', 'relationships', 'metadata', 'indexes'],
    'case_data': ['suspects', 'victims', 'evidence', 'timeline', 'relationships'],
    'document_evidence': ['text_content', 'metadata', 'creation_date', 'author'],
    'media': ['metadata', 'exif_data', 'timestamps', 'geolocation']
  };
  
  return dataTypes[fileType] || ['raw_data'];
};

/**
 * Estimate analysis complexity
 */
export const getAnalysisComplexity = (fileType) => {
  const complexity = {
    'network_capture': 'very_high',
    'mobile_forensics': 'very_high', 
    'memory_dump': 'very_high',
    'disk_image': 'very_high',
    'financial_data': 'high',
    'communications': 'high',
    'case_data': 'medium',
    'database': 'medium',
    'system_logs': 'medium',
    'contacts': 'low',
    'call_logs': 'low',
    'location_data': 'low',
    'browser_data': 'low',
    'document_evidence': 'low',
    'media': 'low'
  };
  
  return complexity[fileType] || 'medium';
};

/**
 * Estimate number of records based on file type and size
 */
export const estimateRecordCount = (fileType, fileSize) => {
  if (!fileSize) return 'unknown';
  
  // Average bytes per record for different file types
  const avgBytesPerRecord = {
    'contacts': 200,
    'call_logs': 150,
    'communications': 500,
    'location_data': 100,
    'financial_data': 300,
    'browser_data': 250,
    'system_logs': 400,
    'network_capture': 1000,
    'mobile_forensics': 800,
    'case_data': 2000
  };
  
  const avgBytes = avgBytesPerRecord[fileType] || 500;
  const estimatedRecords = Math.floor(fileSize / avgBytes);
  
  if (estimatedRecords < 100) return 'small (< 100 records)';
  if (estimatedRecords < 1000) return 'medium (100-1K records)';
  if (estimatedRecords < 10000) return 'large (1K-10K records)';
  return 'very_large (> 10K records)';
};

/**
 * Assess forensic value of different file types
 */
export const getForensicValue = (fileType) => {
  const values = {
    'case_data': 'critical',
    'financial_data': 'critical',
    'communications': 'very_high',
    'network_capture': 'very_high',
    'mobile_forensics': 'very_high',
    'contacts': 'high',
    'call_logs': 'high',
    'location_data': 'high',
    'browser_data': 'medium',
    'system_logs': 'medium',
    'database': 'medium',
    'document_evidence': 'low',
    'media': 'low'
  };
  
  return values[fileType] || 'low';
};

/**
 * Generate analysis recommendations based on file type
 */
export const getAnalysisRecommendations = (fileType, metadata = {}) => {
  const recommendations = {
    'mobile_forensics': [
      'Extract contact lists and analyze communication patterns',
      'Review message content for keywords and suspicious conversations', 
      'Analyze app usage and installed applications',
      'Check location data for movement patterns',
      'Examine media files for evidence'
    ],
    'communications': [
      'Search for keywords related to criminal activity',
      'Analyze participant relationships and communication frequency',
      'Timeline analysis of message patterns',
      'Extract and analyze shared media/files',
      'Identify encryption or coded language'
    ],
    'financial_data': [
      'Trace transaction flows and identify patterns',
      'Identify suspicious large transactions or patterns',
      'Analyze account relationships and beneficiaries', 
      'Check for money laundering indicators',
      'Cross-reference with known criminal accounts'
    ],
    'network_capture': [
      'Analyze traffic patterns and identify anomalies',
      'Extract HTTP/HTTPS communications',
      'Identify connected systems and potential C&C servers',
      'Search for data exfiltration patterns',
      'Analyze encrypted traffic metadata'
    ],
    'contacts': [
      'Build relationship maps between contacts',
      'Identify key persons of interest',
      'Analyze contact frequency and communication methods',
      'Cross-reference with case suspects/victims',
      'Look for encrypted or anonymous contact methods'
    ],
    'location_data': [
      'Create movement timeline and pattern analysis',
      'Identify frequently visited locations',
      'Correlate location data with known crime scenes',
      'Analyze travel patterns for operational security',
      'Check for location spoofing or manipulation'
    ]
  };
  
  return recommendations[fileType] || ['Perform standard data extraction and analysis'];
};

/**
 * Generate mock network connections based on file relationships
 */
export const generateForensicConnections = (files) => {
  const connections = [];
  
  // Group files by type
  const fileGroups = {};
  files.forEach(file => {
    const type = detectFileType(file.name);
    if (!fileGroups[type]) fileGroups[type] = [];
    fileGroups[type].push(file);
  });
  
  // Generate logical connections between file types
  Object.keys(fileGroups).forEach(sourceType => {
    Object.keys(fileGroups).forEach(targetType => {
      if (sourceType !== targetType) {
        const connectionStrength = getConnectionStrength(sourceType, targetType);
        if (connectionStrength > 0) {
          fileGroups[sourceType].forEach(sourceFile => {
            fileGroups[targetType].forEach(targetFile => {
              connections.push({
                source: sourceFile.id,
                target: targetFile.id,
                type: getConnectionType(sourceType, targetType),
                strength: connectionStrength,
                description: getConnectionDescription(sourceType, targetType)
              });
            });
          });
        }
      }
    });
  });
  
  return connections;
};

/**
 * Calculate logical connection strength between file types
 */
const getConnectionStrength = (sourceType, targetType) => {
  const connections = {
    'communications': { 'contacts': 9, 'location_data': 7, 'financial_data': 6 },
    'contacts': { 'call_logs': 9, 'location_data': 5, 'financial_data': 4 },
    'call_logs': { 'contacts': 9, 'location_data': 6 },
    'financial_data': { 'contacts': 6, 'communications': 7, 'location_data': 4 },
    'location_data': { 'contacts': 5, 'communications': 7, 'financial_data': 4 },
    'mobile_forensics': { 'contacts': 9, 'communications': 9, 'call_logs': 9, 'location_data': 8 },
    'network_capture': { 'communications': 6, 'financial_data': 5, 'browser_data': 8 },
    'browser_data': { 'network_capture': 8, 'communications': 5, 'financial_data': 6 }
  };
  
  return connections[sourceType]?.[targetType] || 0;
};

/**
 * Get connection type description
 */
const getConnectionType = (sourceType, targetType) => {
  const types = {
    'communications-contacts': 'participant_relationship',
    'contacts-call_logs': 'call_records', 
    'communications-location_data': 'location_sharing',
    'financial_data-contacts': 'account_ownership',
    'mobile_forensics-contacts': 'device_contacts',
    'network_capture-communications': 'traffic_analysis',
    'browser_data-network_capture': 'web_traffic'
  };
  
  const key = `${sourceType}-${targetType}`;
  return types[key] || 'data_correlation';
};

/**
 * Get human-readable connection description
 */
const getConnectionDescription = (sourceType, targetType) => {
  const descriptions = {
    'communications-contacts': 'Message participants found in contact list',
    'contacts-call_logs': 'Contact appears in call history',
    'communications-location_data': 'Location shared in messages',
    'financial_data-contacts': 'Financial account linked to contact',
    'mobile_forensics-contacts': 'Contact extracted from mobile device',
    'network_capture-communications': 'Network traffic contains communication data',
    'browser_data-network_capture': 'Browser activity captured in network logs'
  };
  
  const key = `${sourceType}-${targetType}`;
  return descriptions[key] || 'Files contain related forensic data';
};