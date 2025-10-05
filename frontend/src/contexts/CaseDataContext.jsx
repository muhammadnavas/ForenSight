import { createContext, useContext, useEffect, useState } from 'react';

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

  // Initialize the context
  useEffect(() => {
    // Set initial empty state
    setLoading(false);
  }, []);

  // Case data will be loaded when files are uploaded
  // No automatic loading of mock data

  const loadCaseData = async (fileData = null) => {
    try {
      setLoading(true);
      setError(null);
      
      if (fileData) {
        // Load data from uploaded file
        setCaseData(fileData);
        calculateStatistics(fileData);
      } else {
        // No data available - set empty state
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
      console.error('Error loading case data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const calculateStatistics = (data) => {
    if (!data) return;
    
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
    
    setStatistics(stats);
  };

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