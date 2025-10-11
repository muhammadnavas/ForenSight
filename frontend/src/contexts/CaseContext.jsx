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
  const loadCases = async () => {
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
        // Show all cases since we removed authentication
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
          userId: 'default',
          createdBy: 'system',
          investigator: 'system',
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
      console.log('🔍 Getting files for case ID:', caseId);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/cases/${caseId}/files`);
      
      if (!caseId) {
        throw new Error('Case ID is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/files`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to get case files (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('📄 Response data:', data);
      
      if (data.success) {
        console.log('✅ Files retrieved successfully:', data.files?.length || 0);
        return data.files;
      } else {
        throw new Error(data.error || 'Failed to get case files');
      }
    } catch (error) {
      console.error('💥 Failed to get case files:', error);
      console.error('🔍 Case ID was:', caseId);
      console.error('🌐 API Base URL:', API_BASE_URL);
      throw error;
    }
  };

  // Add file to case
  const addFileToCase = async (caseId, fileData) => {
    try {
      console.log('📁 Adding file to case ID:', caseId);
      console.log('📄 File data:', fileData);
      console.log('🌐 API URL:', `${API_BASE_URL}/api/cases/${caseId}/files`);
      
      setLoading(true);
      setError(null);
      
      if (!caseId) {
        throw new Error('Case ID is required');
      }
      
      if (!fileData) {
        throw new Error('File data is required');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/cases/${caseId}/files`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileData)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response OK:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        throw new Error(`Failed to add file to case (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('📄 Response data:', data);
      
      if (data.success) {
        console.log('✅ File added successfully with ID:', data.fileId);
        // Refresh case files if this is the selected case
        if (selectedCase && (selectedCase._id === caseId || selectedCase.caseId === caseId)) {
          console.log('🔄 Refreshing case files...');
          await loadCaseFiles(caseId);
        }
        return data.fileId;
      } else {
        throw new Error(data.error || 'Failed to add file to case');
      }
    } catch (error) {
      console.error('💥 Failed to add file to case:', error);
      console.error('🔍 Case ID was:', caseId);
      console.error('📄 File data was:', fileData);
      console.error('🌐 API Base URL:', API_BASE_URL);
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

  // File selection methods (single file only)
  const toggleFileSelection = (fileId) => {
    console.log('🔄 Toggling file selection for ID:', fileId);
    console.log('📂 Available files:', caseFiles.map(f => ({ 
      name: f.originalName || f.filename, 
      fileId: f.fileId, 
      _id: f._id, 
      id: f.id 
    })));
    
    setSelectedFiles(prev => {
      // If the file is already selected, deselect it
      if (prev.includes(fileId)) {
        console.log('📁 File deselected:', fileId);
        return [];
      } else {
        // Replace any existing selection with the new file (single selection only)
        console.log('📁 File selected:', fileId, '(replacing any previous selection)');
        console.log('📁 Previous selection:', prev);
        return [fileId];
      }
    });
  };

  // Note: selectAllFiles removed since we only support single file selection
  const selectSingleFile = (fileId) => {
    setSelectedFiles([fileId]);
    console.log('📁 Single file selected:', fileId);
  };

  const clearFileSelection = () => {
    setSelectedFiles([]);
  };

  const getSelectedFileObjects = () => {
    const selectedFileObjects = caseFiles.filter(file => selectedFiles.includes(file.fileId || file._id || file.id));
    console.log('📋 Getting selected file objects:', selectedFileObjects.length);
    return selectedFileObjects;
  };

  // Get selected files with detailed info for analysis
  const getSelectedFilesForAnalysis = () => {
    return caseFiles.filter(file => selectedFiles.includes(file.fileId || file._id || file.id)).map(file => ({
      ...file,
      fileType: getFileType(file.originalName || file.filename),
      isDatabase: isDatabase(file.originalName || file.filename),
      isImage: isImage(file.originalName || file.filename),
      isNetwork: isNetwork(file.originalName || file.filename)
    }));
  };

  // Helper function to determine file type
  const getFileType = (filename) => {
    if (!filename) return 'unknown';
    const ext = filename.toLowerCase().split('.').pop();
    const types = {
      'db': 'database', 'sqlite': 'database', 'sql': 'database',
      'pcap': 'network', 'pcapng': 'network', 'cap': 'network',
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'image',
      'txt': 'text', 'log': 'log', 'json': 'data', 'xml': 'data',
      'zip': 'archive', 'rar': 'archive', '7z': 'archive'
    };
    return types[ext] || 'file';
  };

  const isDatabase = (filename) => {
    if (!filename) return false;
    const ext = filename.toLowerCase().split('.').pop();
    return ['db', 'sqlite', 'sql'].includes(ext);
  };

  const isImage = (filename) => {
    if (!filename) return false;
    const ext = filename.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'].includes(ext);
  };

  const isNetwork = (filename) => {
    if (!filename) return false;
    const ext = filename.toLowerCase().split('.').pop();
    return ['pcap', 'pcapng', 'cap'].includes(ext);
  };

  // Load case files and update local state
  const loadCaseFiles = async (caseId) => {
    try {
      const files = await getCaseFiles(caseId);
      console.log('📁 Loaded case files:', files.length);
      console.log('📂 File details:', files.map(f => ({ 
        name: f.originalName || f.filename || f.name, 
        fileId: f.fileId, 
        _id: f._id, 
        id: f.id,
        size: f.size || f.sizeBytes 
      })));
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

  // Load cases on mount
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
    selectSingleFile,
    clearFileSelection,
    getSelectedFileObjects,
    getSelectedFilesForAnalysis,
    
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