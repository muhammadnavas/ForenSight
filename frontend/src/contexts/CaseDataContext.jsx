import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Case Data Context
const CaseDataContext = createContext();

export const useCaseData = () => {
  const context = useContext(CaseDataContext);
  if (!context) {
    throw new Error('useCaseData must be used within a CaseDataProvider');
  }
  return context;
};

export const CaseDataProvider = ({ children }) => {
  console.log('🏗️ CaseDataProvider initializing...');
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalSuspects: 0,
    totalVictims: 0,
    totalEvidence: 0,
    totalLocations: 0,
    riskLevel: 'UNKNOWN',
    caseStatus: 'INACTIVE',
    completionPercentage: 0
  });

  console.log('📊 CaseDataProvider current state:', {
    hasCaseData: !!caseData,
    loading,
    error,
    statistics
  });

  // Initialize the context and try to load public case data immediately
  useEffect(() => {
    // Set initial empty state
    setLoading(false);
    
    // Try to load the example case data immediately for demo purposes
    const loadExampleCaseData = async () => {
      try {
        console.log('🔄 Attempting to load example case data for demo...');
        
        // Try multiple potential paths for the case data
        const possiblePaths = [
          '/apt-case-003.json',
          './apt-case-003.json',
          '/public/apt-case-003.json'
        ];
        
        let jsonData = null;
        for (const path of possiblePaths) {
          try {
            console.log(`📄 Trying to load case data from: ${path}`);
            const response = await fetch(path);
            if (response.ok) {
              jsonData = await response.json();
              console.log(`✅ Successfully loaded case data from: ${path}`);
              break;
            }
          } catch (err) {
            console.log(`❌ Failed to load from ${path}:`, err.message);
          }
        }
        
        if (jsonData) {
          console.log('🎯 Processing loaded case data:', jsonData.caseName || jsonData.caseId);
          await loadCaseData(jsonData);
          console.log('📊 Case statistics updated:', {
            suspects: jsonData.suspects?.length || 0,
            victims: jsonData.victims?.length || 0,
            evidence: jsonData.evidence?.length || 0
          });
        } else {
          console.log('ℹ️ No example case data found - this is normal for production');
        }
      } catch (err) {
        console.log('⚠️ Error loading example case data:', err.message);
        // This is fine - not all deployments will have the example file
      }
    };
    
    loadExampleCaseData();
  }, []);

  // Helper functions for calculating statistics (defined before loadCaseData to avoid dependency issues)
  const calculateCompletionPercentage = (data) => {
    if (!data.nextSteps || data.nextSteps.length === 0) return 0;
    
    const completed = data.nextSteps.filter(step => step.status === 'COMPLETED').length;
    const inProgress = data.nextSteps.filter(step => step.status === 'IN_PROGRESS').length * 0.5;
    
    return Math.round(((completed + inProgress) / data.nextSteps.length) * 100);
  };

  const calculateFinancialImpact = (data) => {
    let totalImpact = 0;
    
    // Add victim losses
    if (data.victims) {
      totalImpact += data.victims.reduce((sum, victim) => sum + (victim.financialLoss || 0), 0);
    }
    
    // Add criminal activity financial impact
    if (data.geographicData?.criminalActivity) {
      totalImpact += data.geographicData.criminalActivity.reduce((sum, activity) => sum + (activity.financialImpact || 0), 0);
    }
    
    return totalImpact;
  };

  const calculateStatistics = useCallback((data) => {
    console.log('📊 Calculating statistics for:', data ? 'case data' : 'no data');
    
    if (!data) {
      console.log('⚠️ No data provided to calculateStatistics');
      return;
    }
    
    const stats = {
      totalSuspects: data.suspects?.length || 0,
      totalVictims: data.victims?.length || 0,
      totalEvidence: data.evidence?.length || 0,
      totalLocations: (data.geographicData?.suspectLocations?.length || 0) + 
                     (data.geographicData?.criminalActivity?.length || 0) +
                     (data.geographicData?.infrastructure?.length || 0),
      riskLevel: data.riskAssessment?.overallRisk || 'UNKNOWN',
      caseStatus: data.status || 'INACTIVE',
      completionPercentage: calculateCompletionPercentage(data),
      financialImpact: calculateFinancialImpact(data),
      networkComplexity: (data.networkTopology?.nodes?.length || 0) + (data.networkTopology?.edges?.length || 0),
      investigationProgress: data.nextSteps ? 
        (data.nextSteps.filter(step => step.status === 'COMPLETED').length / data.nextSteps.length) * 100 : 0
    };
    
    console.log('📈 Calculated statistics:', stats);
    setStatistics(stats);
  }, []);

  // Case data will be loaded when files are uploaded
  // No automatic loading of mock data

  const loadCaseData = useCallback(async (fileData = null) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📥 loadCaseData called with:', fileData ? 'data present' : 'no data');
      
      if (fileData) {
        // Load data from uploaded file
        console.log('🔄 Setting case data:', {
          caseId: fileData.caseId,
          caseName: fileData.caseName,
          suspects: fileData.suspects?.length || 0,
          victims: fileData.victims?.length || 0,
          evidence: fileData.evidence?.length || 0
        });
        setCaseData(fileData);
        calculateStatistics(fileData);
        console.log('✅ Case data loaded successfully');
      } else {
        // No data available - set empty state
        console.log('🧹 Clearing case data');
        setCaseData(null);
        setStatistics({
          totalSuspects: 0,
          totalVictims: 0,
          totalEvidence: 0,
          totalLocations: 0,
          riskLevel: 'UNKNOWN',
          caseStatus: 'INACTIVE',
          completionPercentage: 0,
          financialImpact: 0,
          networkComplexity: 0,
          investigationProgress: 0
        });
      }
      
    } catch (err) {
      console.error('❌ Error loading case data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [calculateStatistics]); // Include calculateStatistics as dependency

  // Function to process uploaded file data
  const processUploadedFile = async (file) => {
    try {
      console.log('Processing uploaded file:', file);
      const text = await file.text();
      console.log('File content length:', text.length);
      const data = JSON.parse(text);
      console.log('Parsed data:', data);
      await loadCaseData(data);
      console.log('Case data loaded successfully');
      return data;
    } catch (err) {
      console.error('Error processing uploaded file:', err);
      setError('Failed to process uploaded file: ' + err.message);
      throw err;
    }
  };

  // Function to process file content from case files
  const processFileContent = async (fileContent) => {
    try {
      console.log('Processing file content from case files');
      let data;
      if (typeof fileContent === 'string') {
        data = JSON.parse(fileContent);
      } else {
        data = fileContent;
      }
      console.log('Processed case file data:', data);
      await loadCaseData(data);
      return data;
    } catch (err) {
      console.error('Error processing file content:', err);
      setError('Failed to process file content: ' + err.message);
      throw err;
    }
  };

  // Function to load case data from backend API file content
  const loadCaseDataFromFiles = useCallback(async (selectedFileObjects, caseId) => {
    try {
      console.log('🔄 Loading case data from selected files:', selectedFileObjects.length);
      
      if (!selectedFileObjects || selectedFileObjects.length === 0) {
        console.log('🧹 No files selected, clearing case data');
        setCaseData(null);
        calculateStatistics(null);
        return;
      }

      // Process the first selected file (for now, we'll handle single file selection)
      const file = selectedFileObjects[0];
      console.log('📂 Processing file:', file.originalName || file.filename || file.name);
      console.log('📋 File details:', {
        fileId: file.fileId,
        _id: file._id,
        name: file.name,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.sizeBytes || file.size
      });
      
      // If it's a JSON file, try to fetch its content from the backend
      const fileName = file.originalName || file.filename || file.name || '';
      if (fileName.toLowerCase().endsWith('.json')) {
        console.log('📄 JSON file detected, fetching content from backend');
        
        try {
          setLoading(true);
          
          // Try to fetch the file content from the backend
          const fileId = file.fileId || file._id;
          const response = await fetch(`http://localhost:5000/api/cases/${caseId}/files/${fileId}/content`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const fileContentResponse = await response.json();
            console.log('📥 File content response:', fileContentResponse);
            
            if (fileContentResponse.success && fileContentResponse.content) {
              console.log('✅ Successfully fetched file content from backend');
              let jsonData;
              
              // Parse the content if it's a string
              if (typeof fileContentResponse.content === 'string') {
                jsonData = JSON.parse(fileContentResponse.content);
              } else {
                jsonData = fileContentResponse.content;
              }
              
              console.log('🎯 Parsed JSON case data:', {
                caseId: jsonData.caseId,
                caseName: jsonData.caseName, 
                suspects: jsonData.suspects?.length || 0,
                victims: jsonData.victims?.length || 0,
                evidence: jsonData.evidence?.length || 0
              });
              
              await loadCaseData(jsonData);
              return;
            } else {
              console.log('❌ Backend response missing content:', fileContentResponse);
            }
          } else {
            console.log('❌ Failed to fetch file content from backend:', response.status, response.statusText);
          }
        } catch (fetchError) {
          console.error('❌ Error fetching file content from backend:', fetchError);
        }
        
        // Fallback: try to load from public folder as demo
        if (fileName.includes('apt-case-003')) {
          try {
            console.log('🔄 Fallback: trying public folder demo file');
            const response = await fetch('/apt-case-003.json');
            if (response.ok) {
              const jsonData = await response.json();
              console.log('✅ Loaded demo case data from public file:', jsonData.caseName);
              await loadCaseData(jsonData);
              return;
            }
          } catch (err) {
            console.log('❌ Could not load from public folder:', err.message);
          }
        }
        
        // If all else fails, clear case data
        console.log('⚠️ File content not available, clearing case data');
        setCaseData(null);
        calculateStatistics(null);
      } else {
        console.log('ℹ️ Non-JSON file selected, cannot extract case data');
        setCaseData(null);
        calculateStatistics(null);
      }
    } catch (err) {
      console.error('❌ Error loading case data from files:', err);
      setError('Failed to load case data from files: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [loadCaseData, calculateStatistics]); // Include dependencies

  // Get network data formatted for visualization
  const getNetworkData = () => {
    if (!caseData?.networkTopology) {
      return {
        nodes: [],
        edges: []
      };
    }
    
    return {
      nodes: caseData.networkTopology.nodes.map(node => ({
        ...node,
        x: Math.random() * 800 + 100, // Random positioning for demo
        y: Math.random() * 600 + 100,
        connections: caseData.networkTopology.edges.filter(
          edge => edge.from === node.id || edge.to === node.id
        ).length
      })),
      edges: caseData.networkTopology.edges || []
    };
  };

  // Get geographic data for mapping
  const getGeographicData = () => {
    if (!caseData?.geographicData) {
      return {
        suspectLocations: [],
        crimeLocations: [],
        infrastructureLocations: []
      };
    }
    
    return {
      suspectLocations: caseData.geographicData.suspectLocations?.map(location => ({
        ...location,
        lat: location.coordinates?.[1] || 0,
        lng: location.coordinates?.[0] || 0,
        type: 'suspect'
      })) || [],
      crimeLocations: caseData.geographicData.criminalActivity?.map(activity => ({
        ...activity,
        lat: activity.coordinates?.[1] || 0,
        lng: activity.coordinates?.[0] || 0,
        type: 'crime'
      })) || [],
      infrastructureLocations: caseData.geographicData.infrastructure?.map(infra => ({
        ...infra,
        lat: infra.coordinates?.[1] || 0,
        lng: infra.coordinates?.[0] || 0,
        type: 'infrastructure'
      })) || []
    };
  };

  // Get evidence data
  const getEvidenceData = () => {
    if (!caseData?.evidence) return [];
    
    return caseData.evidence.map(item => ({
      ...item,
      status: 'analyzed',
      priority: item.type === 'DIGITAL' ? 'high' : 'medium'
    }));
  };

  // Get financial data
  const getFinancialData = () => {
    if (!caseData?.financialFlows) {
      return {
        wallets: [],
        transactions: [],
        bankAccounts: []
      };
    }
    
    return {
      wallets: caseData.financialFlows.cryptoWallets || [],
      transactions: caseData.financialFlows.transactions || [],
      bankAccounts: caseData.financialFlows.bankAccounts || []
    };
  };

  // Get timeline data
  const getTimelineData = () => {
    if (!caseData?.timeline) return [];
    
    return caseData.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Search functionality
  const searchData = (query) => {
    if (!caseData || !query) return {};
    
    const results = {
      suspects: [],
      victims: [],
      evidence: [],
      locations: []
    };
    
    const searchTerm = query.toLowerCase();
    
    // Search suspects
    if (caseData.suspects) {
      results.suspects = caseData.suspects.filter(suspect =>
        suspect.name.toLowerCase().includes(searchTerm) ||
        suspect.alias?.some(alias => alias.toLowerCase().includes(searchTerm)) ||
        suspect.occupation?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Search victims
    if (caseData.victims) {
      results.victims = caseData.victims.filter(victim =>
        victim.name.toLowerCase().includes(searchTerm) ||
        victim.occupation?.toLowerCase().includes(searchTerm) ||
        victim.location?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Search evidence
    if (caseData.evidence) {
      results.evidence = caseData.evidence.filter(evidence =>
        evidence.description.toLowerCase().includes(searchTerm) ||
        evidence.type.toLowerCase().includes(searchTerm) ||
        evidence.category?.toLowerCase().includes(searchTerm)
      );
    }
    
    return results;
  };

  const contextValue = {
    // Core data
    caseData,
    loading,
    error,
    statistics,
    
    // Data getters
    getNetworkData,
    getGeographicData,
    getEvidenceData,
    getFinancialData,
    getTimelineData,
    
    // Utilities
    searchData,
    loadCaseData,
    processUploadedFile,
    processFileContent,
    loadCaseDataFromFiles,
    
    // Computed properties
    hasData: !!caseData && caseData.suspects?.length > 0,
    isDemo: false
  };

  return (
    <CaseDataContext.Provider value={contextValue}>
      {children}
    </CaseDataContext.Provider>
  );
};

export default CaseDataProvider;