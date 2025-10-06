import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const CaseContext = createContext();

export const useCaseContext = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCaseContext must be used within a CaseProvider');
  }
  return context;
};

export const CaseProvider = ({ children }) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caseFiles, setCaseFiles] = useState([]);

  // Load all cases
  const loadCases = async (userId = 'default') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch cases');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCases(data.cases);
        return data.cases;
      } else {
        throw new Error(data.error || 'Failed to load cases');
      }
    } catch (error) {
      console.error('Failed to load cases:', error);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new case
  const createCase = async (caseData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...caseData,
          userId: 'default', // TODO: Replace with actual user ID from auth
          status: 'active'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create case');
      }

      const data = await response.json();
      
      if (data.success) {
        // Add the new case to the cases list
        setCases(prev => [data.case, ...prev]);
        return data.case;
      } else {
        throw new Error(data.error || 'Failed to create case');
      }
    } catch (error) {
      console.error('Failed to create case:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get case by ID
  const getCaseById = async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`);
      
      if (!response.ok) {
        throw new Error('Case not found');
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.case;
      } else {
        throw new Error(data.error || 'Failed to get case');
      }
    } catch (error) {
      console.error('Failed to get case:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update case
  const updateCase = async (caseId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update case');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local cases list
        setCases(prev => prev.map(c => 
          c._id === caseId || c.caseId === caseId 
            ? { ...c, ...updateData, updatedAt: new Date().toISOString() }
            : c
        ));
        return true;
      } else {
        throw new Error(data.error || 'Failed to update case');
      }
    } catch (error) {
      console.error('Failed to update case:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get case files
  const getCaseFiles = async (caseId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get case files');
      }

      const data = await response.json();
      
      if (data.success) {
        return data.files || [];
      } else {
        throw new Error(data.error || 'Failed to get case files');
      }
    } catch (error) {
      console.error('Failed to get case files:', error);
      return [];
    }
  };

  // Add file to case
  const addFileToCase = async (caseId, fileData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileData)
      });

      if (!response.ok) {
        throw new Error('Failed to add file to case');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local case with the new file
        setCases(prev => prev.map(c => {
          if (c._id === caseId || c.caseId === caseId) {
            return {
              ...c,
              files: [...(c.files || []), { ...fileData, _id: data.fileId }],
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        }));
        return data.fileId;
      } else {
        throw new Error(data.error || 'Failed to add file to case');
      }
    } catch (error) {
      console.error('Failed to add file to case:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Upload file to case
  const uploadFileToCase = async (caseId, file) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/upload`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local case with the new file
        setCases(prev => prev.map(c => {
          if (c._id === caseId || c.caseId === caseId) {
            return {
              ...c,
              files: [...(c.files || []), data.file],
              updatedAt: new Date().toISOString()
            };
          }
          return c;
        }));
        return data.file;
      } else {
        throw new Error(data.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Failed to upload file:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete case
  const deleteCase = async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete case');
      }

      const data = await response.json();
      
      if (data.success) {
        // Remove the case from the local list
        setCases(prev => prev.filter(c => c._id !== caseId && c.caseId !== caseId));
        
        // Clear selected case if it was deleted
        if (selectedCase && (selectedCase._id === caseId || selectedCase.caseId === caseId)) {
          setSelectedCase(null);
        }
        
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete case');
      }
    } catch (error) {
      console.error('Failed to delete case:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get active cases (helper)
  const getActiveCases = () => {
    return cases.filter(c => c.status === 'active');
  };

  // Get completed cases (helper)
  const getCompletedCases = () => {
    return cases.filter(c => c.status === 'completed');
  };

  // Get archived cases (helper)
  const getArchivedCases = () => {
    return cases.filter(c => c.status === 'archived');
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // File selection methods
  const toggleFileSelection = (fileId) => {
    setSelectedFiles(prev => {
      if (prev.includes(fileId)) {
        return prev.filter(id => id !== fileId);
      } else {
        return [...prev, fileId];
      }
    });
  };

  const selectAllFiles = () => {
    const allFileIds = caseFiles.map(file => file._id || file.id);
    setSelectedFiles(allFileIds);
  };

  const clearFileSelection = () => {
    setSelectedFiles([]);
  };

  const getSelectedFileObjects = () => {
    return caseFiles.filter(file => selectedFiles.includes(file._id || file.id));
  };

  // Load case files and update local state
  const loadCaseFiles = async (caseId) => {
    try {
      const files = await getCaseFiles(caseId);
      setCaseFiles(files);
      // Clear file selection when case changes
      setSelectedFiles([]);
      return files;
    } catch (error) {
      console.error('Failed to load case files:', error);
      setCaseFiles([]);
      setSelectedFiles([]);
      return [];
    }
  };

  // Load cases on mount with retry logic
  useEffect(() => {
    const loadCasesWithRetry = async () => {
      try {
        await loadCases();
      } catch (error) {
        // If initial load fails, retry after 2 seconds
        console.log('Initial case load failed, retrying in 2 seconds...');
        setTimeout(() => {
          loadCases().catch(err => {
            console.log('Retry failed, backend may not be running:', err.message);
          });
        }, 2000);
      }
    };
    
    loadCasesWithRetry();
  }, []);

  const value = {
    // State
    cases,
    selectedCase,
    selectedFiles,
    caseFiles,
    loading,
    error,
    
    // Actions
    loadCases,
    createCase,
    getCaseById,
    updateCase,
    getCaseFiles,
    loadCaseFiles,
    addFileToCase,
    uploadFileToCase,
    deleteCase,
    setSelectedCase,
    clearError,
    
    // File Selection
    toggleFileSelection,
    selectAllFiles,
    clearFileSelection,
    getSelectedFileObjects,
    
    // Helpers
    getActiveCases,
    getCompletedCases,
    getArchivedCases
  };

  return (
    <CaseContext.Provider value={value}>
      {children}
    </CaseContext.Provider>
  );
};

export default CaseProvider;