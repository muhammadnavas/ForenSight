import { useEffect } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { useCaseData } from '../contexts/CaseDataContext';

/**
 * Hook that integrates CaseContext with CaseDataContext
 * Automatically loads case data when files are selected
 */
const useCaseFileIntegration = () => {
  const { selectedFiles, getSelectedFileObjects, selectedCase } = useCaseContext();
  const { loadCaseDataFromFiles, caseData, hasData, loading } = useCaseData();

  // Auto-load case data when files are selected
  useEffect(() => {
    const loadDataFromSelectedFiles = async () => {
      if (selectedFiles.length > 0 && selectedCase) {
        console.log('🔄 Files selected, attempting to load case data...');
        const selectedFileObjects = getSelectedFileObjects();
        console.log('📂 Selected files:', selectedFileObjects.map(f => f.originalName || f.filename || f.name));
        
        // Check if any selected file is a JSON case file
        const jsonFiles = selectedFileObjects.filter(file => {
          const fileName = (file.originalName || file.filename || file.name || '').toLowerCase();
          return fileName.endsWith('.json') && (
            fileName.includes('case') || 
            fileName.includes('apt-') || 
            fileName.includes('investigation') ||
            fileName.includes('forensic')
          );
        });

        if (jsonFiles.length > 0) {
          console.log('📊 JSON case files detected:', jsonFiles.map(f => f.originalName || f.filename || f.name));
          const caseId = selectedCase._id || selectedCase.caseId;
          await loadCaseDataFromFiles(jsonFiles, caseId);
        } else {
          console.log('ℹ️ No JSON case files in selection, case data will remain empty');
          await loadCaseDataFromFiles([], null); // Clear case data
        }
      } else {
        console.log('🧹 No files selected, clearing case data');
        await loadCaseDataFromFiles([], null); // Clear case data
      }
    };

    loadDataFromSelectedFiles();
  }, [selectedFiles, selectedCase, getSelectedFileObjects, loadCaseDataFromFiles]);

  // Return integration status
  return {
    isIntegrated: hasData && selectedFiles.length > 0,
    caseDataAvailable: hasData,
    filesSelected: selectedFiles.length > 0,
    loading,
    caseData
  };
};

export { useCaseFileIntegration };
export default useCaseFileIntegration;