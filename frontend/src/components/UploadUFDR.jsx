import { useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';
import { useFiles } from './Dashboard';

const UploadUFDR = ({ setCurrentView }) => {
  const { uploadedFiles, addFiles, updateFileStatus, removeFile: removeFileFromContext } = useFiles();
  const { cases, loading: casesLoading, error: casesError, selectedCase, setSelectedCase, getActiveCases, addFileToCase } = useCaseContext();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCaseSelector, setShowCaseSelector] = useState(true);
  const [error, setError] = useState(null);

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    width: '100%',
    color: '#1e293b',
    overflowX: 'hidden',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    marginBottom: '32px'
  };

  const titleStyle = {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const subtitleStyle = {
    color: '#64748b',
    fontSize: '16px',
    marginBottom: '24px'
  };

  const uploadAreaStyle = {
    backgroundColor: isDragging ? '#e0f2fe' : '#f8fafc',
    border: `2px dashed ${isDragging ? '#0ea5e9' : '#cbd5e1'}`,
    borderRadius: '12px',
    padding: '64px 32px',
    textAlign: 'center',
    marginBottom: '32px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const uploadIconStyle = {
    fontSize: '48px',
    marginBottom: '16px',
    opacity: isDragging ? 1 : 0.7
  };

  const uploadTextStyle = {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: isDragging ? '#0284c7' : '#1e293b'
  };

  const uploadSubtextStyle = {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '20px'
  };

  const browseButtonStyle = {
    backgroundColor: '#0ea5e9',
    color: '#ffffff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the drop zone entirely
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const validateFile = (file) => {
    const allowedTypes = ['.db', '.sqlite', '.xml', '.zip', '.rar', '.7z', '.txt', '.log', '.json', '.img', '.dd'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    const maxSize = 500 * 1024 * 1024; // 500MB limit
    
    if (!allowedTypes.includes(fileExtension)) {
      return { valid: false, error: `File type ${fileExtension} not supported` };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 500MB limit' };
    }
    
    return { valid: true };
  };

  const handleFiles = async (files) => {
    // Check if a case is selected
    if (!selectedCase) {
      setError('Please select a case before uploading files');
      return;
    }

    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        const fileMetadata = {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          error: null,
          uploadedAt: new Date().toISOString(),
          fileType: getFileType(file.name),
          caseId: selectedCase, // Associate with selected case
          originalFile: file // Keep reference to original File object
        };
        validFiles.push(fileMetadata);
      } else {
        errors.push({ fileName: file.name, error: validation.error });
      }
    });

    if (errors.length > 0) {
      setError(`Some files were rejected:\n${errors.map(e => `${e.fileName}: ${e.error}`).join('\n')}`);
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
      
      // Start upload to backend for valid files
      validFiles.forEach(file => {
        uploadToBackend(file);
      });
    }
  };

  const uploadToBackend = async (fileMetadata) => {
    try {
      // Show initial progress
      updateFileStatus(fileMetadata.id, 'uploading', { progress: 5 });
      
      const formData = new FormData();
      formData.append('file', fileMetadata.originalFile);
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 90); // Reserve 10% for server processing
          updateFileStatus(fileMetadata.id, 'uploading', { progress });
        }
      });
      
      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            if (data.success) {
              updateFileStatus(fileMetadata.id, 'completed', { 
                progress: 100,
                completedAt: new Date().toISOString(),
                backendFileId: data.fileId
              });
              
              // Update the case context with the new file
              if (data.file && addFileToCase && selectedCase?._id) {
                addFileToCase(selectedCase._id, data.file).catch(contextError => {
                  console.warn('Failed to update case context:', contextError);
                });
              }
            } else {
              throw new Error(data.error || 'Upload failed');
            }
          } catch (parseError) {
            throw new Error('Invalid server response');
          }
        } else {
          throw new Error(`Upload failed with status: ${xhr.status}`);
        }
      });
      
      // Handle errors
      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });
      
      // Handle timeout
      xhr.addEventListener('timeout', () => {
        throw new Error('Upload timed out');
      });
      
      // Configure and send request
      xhr.timeout = 300000; // 5 minute timeout
      xhr.open('POST', `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/cases/${selectedCase._id || selectedCase.caseId}/files`);
      xhr.send(formData);
      
    } catch (error) {
      console.error('Upload failed:', error);
      updateFileStatus(fileMetadata.id, 'failed', { 
        error: error.message,
        progress: 0
      });
      setError(`Upload failed for ${fileMetadata.name}: ${error.message}`);
    }
  };
  
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['db', 'sqlite'].includes(extension)) return 'database';
    if (['xml', 'json'].includes(extension)) return 'data';
    if (['zip', 'rar', '7z'].includes(extension)) return 'archive';
    if (['txt', 'log'].includes(extension)) return 'text';
    if (['img', 'dd'].includes(extension)) return 'image';
    return 'unknown';
  };

  const simulateUpload = (fileId) => {
    let progress = 0;
    const uploadSpeed = Math.random() * 15 + 5; // Random speed between 5-20
    
    const interval = setInterval(() => {
      progress += uploadSpeed;
      
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        updateFileStatus(fileId, 'completed', { 
          progress: 100,
          completedAt: new Date().toISOString()
        });
      }
      
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: Math.min(progress, 100)
      }));
    }, 300);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      // Update completed files to processed status
      uploadedFiles.forEach(file => {
        if (file.status === 'completed') {
          updateFileStatus(file.id, 'processed', {
            processedAt: new Date().toISOString(),
            aiAnalysisComplete: true,
            searchable: true
          });
        }
      });
    }, 3000);
  };

  const retryUpload = (fileId) => {
    updateFileStatus(fileId, 'uploading', { progress: 0, error: null });
    simulateUpload(fileId);
  };

  const removeFile = (fileId) => {
    removeFileFromContext(fileId);
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'zip': case 'rar': case '7z': return '📦';
      case 'db': case 'sqlite': return '🗄️';
      case 'txt': case 'log': return '📄';
      case 'json': case 'xml': return '📋';
      case 'img': case 'dd': return '💽';
      default: return '📁';
    }
  };

  const activeCases = getActiveCases();

  // Add spinner animation
  const spinnerAnimation = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{spinnerAnimation}</style>
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          📤 Upload UFDR Data
        </h1>
        <p style={subtitleStyle}>
          Upload your UFDR (Universal Forensic Data Repository) files for AI-powered analysis. 
          Files must be associated with an active case before upload.
        </p>
        
        {/* Error Display */}
        {(error || casesError) && (
          <div style={{
            backgroundColor: '#dc2626',
            color: '#1e293b',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error || casesError}
            <button
              onClick={() => setError(null)}
              style={{
                backgroundColor: 'transparent',
                color: '#1e293b',
                border: 'none',
                float: 'right',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Selected Case Info */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          📋 Upload Target
        </h3>
        
        {selectedCase ? (
          <div style={{
            backgroundColor: '#059669',
            color: '#1e293b',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '20px' }}>✅</span>
            <div>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                Files will be uploaded to: {selectedCase.name}
              </div>
              <div style={{ opacity: 0.9, fontSize: '12px' }}>
                Case ID: {selectedCase.caseId || selectedCase._id} • Lead: {selectedCase.investigator || 'Not specified'}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '16px',
            backgroundColor: '#f59e0b',
            color: '#1e293b',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>Please select a case from the header dropdown to enable file upload</span>
          </div>
        )}
      </div>      {/* Upload Area */}
      <div
        style={{
          ...uploadAreaStyle,
          opacity: selectedCase ? 1 : 0.5,
          cursor: selectedCase ? 'pointer' : 'not-allowed',
          backgroundColor: selectedCase ? (isDragging ? '#e0f2fe' : '#f8fafc') : '#f1f5f9'
        }}
        onDragOver={selectedCase ? handleDragOver : undefined}
        onDragEnter={selectedCase ? handleDragEnter : undefined}
        onDragLeave={selectedCase ? handleDragLeave : undefined}
        onDrop={selectedCase ? handleDrop : undefined}
        onClick={(e) => {
          if (!selectedCase) {
            setError('Please select a case first');
            return;
          }
          e.stopPropagation();
          document.getElementById('fileInput').click();
        }}
      >
        <div style={uploadIconStyle}>
          {isDragging ? '⬇️' : '📤'}
        </div>
        <div style={uploadTextStyle}>
          {!selectedCase ? 'Select a case first' : 
           isDragging ? 'Drop files here' : 'Drag & Drop UFDR files'}
        </div>
        <div style={uploadSubtextStyle}>
          {selectedCase ? 'or click to browse your computer' : 'Case selection required for file upload'}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginBottom: '16px'
        }}>
          Maximum file size: 500MB • Supported formats: DB, XML, ZIP, TXT, JSON, IMG
        </div>
        <button 
          style={{
            ...browseButtonStyle,
            backgroundColor: selectedCase ? '#0ea5e9' : '#64748b',
            cursor: selectedCase ? 'pointer' : 'not-allowed'
          }}
          disabled={!selectedCase}
        >
          Browse Files
        </button>
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".db,.sqlite,.xml,.zip,.rar,.7z,.txt,.log,.json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
          disabled={!selectedCase}
        />
      </div>

      {/* Supported Formats */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px',
        border: '1px solid #e2e8f0'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          📋 Supported File Formats
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: '🗄️', name: 'SQLite Database', desc: '.db, .sqlite files' },
            { icon: '📋', name: 'XML Export', desc: '.xml data files' },
            { icon: '📦', name: 'Compressed Archives', desc: '.zip, .rar, .7z files' },
            { icon: '📄', name: 'Text Logs', desc: '.txt, .log files' },
            { icon: '📊', name: 'JSON Data', desc: '.json format files' },
            { icon: '💽', name: 'Disk Images', desc: '.img, .dd files' }
          ].map((format, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              backgroundColor: '#ffffff',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>{format.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{format.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{format.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Statistics */}
      {uploadedFiles.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            📊 Upload Statistics
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
                {uploadedFiles.length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Total Files</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                {uploadedFiles.filter(f => f.status === 'completed').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
                {uploadedFiles.filter(f => f.status === 'uploading').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Uploading</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
                {uploadedFiles.filter(f => f.status === 'failed').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Failed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>
                {uploadedFiles.filter(f => f.status === 'processed').length}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Processed</div>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
              📁 Uploaded Files ({uploadedFiles.length})
            </h3>
            {uploadedFiles.some(f => f.status === 'completed') && !isProcessing && (
              <button
                style={{
                  backgroundColor: isProcessing ? '#64748b' : '#059669',
                  color: '#1e293b',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onClick={startProcessing}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳' : '▶️'} 
                {isProcessing ? 'Processing...' : 'Start Processing'}
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {uploadedFiles.map((file) => (
              <div key={file.id} style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <span style={{ fontSize: '24px' }}>{getFileIcon(file.name)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>{file.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        backgroundColor: 
                          file.status === 'completed' ? '#059669' :
                          file.status === 'processed' ? '#7c3aed' :
                          file.status === 'failed' ? '#dc2626' : '#0ea5e9',
                        color: '#1e293b',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {file.status === 'completed' ? 'Completed' :
                         file.status === 'processed' ? 'Processed' :
                         file.status === 'failed' ? 'Failed' : 'Uploading'}
                      </span>
                      {file.status === 'failed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryUpload(file.id);
                          }}
                          style={{
                            backgroundColor: '#059669',
                            color: '#1e293b',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          🔄 Retry
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          color: '#64748b',
                          border: 'none',
                          padding: '4px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                    {formatFileSize(file.size)}
                    {file.error && (
                      <span style={{ color: '#dc2626', marginLeft: '8px' }}>
                        • {file.error}
                      </span>
                    )}
                  </div>
                  {(file.status === 'uploading' || file.status === 'failed') && (
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#475569',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${uploadProgress[file.id] || 0}%`,
                        height: '100%',
                        backgroundColor: file.status === 'failed' ? '#dc2626' : '#0ea5e9',
                        transition: 'width 0.2s ease'
                      }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Processing Status */}
      {isProcessing && (
        <div style={{
          backgroundColor: '#1e40af',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Processing UFDR Data...
          </h3>
          <p style={{ color: '#bfdbfe' }}>
            AI is analyzing your forensic data and preparing it for investigation queries.
          </p>
        </div>
      )}
    </div>
    </>
  );
};

export default UploadUFDR;
