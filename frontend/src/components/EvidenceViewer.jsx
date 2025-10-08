import { useEffect, useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';

const EvidenceViewer = () => {
  const { selectedCase, caseFiles, getCaseFiles, loading: contextLoading } = useCaseContext();
  const [localLoading, setLocalLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');

  // Add CSS for loading animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Load files when selected case changes
  useEffect(() => {
    if (selectedCase) {
      loadCaseFiles();
    }
  }, [selectedCase]);

  const loadCaseFiles = async () => {
    if (!selectedCase) return;
    
    try {
      setLocalLoading(true);
      setError('');
      await getCaseFiles(selectedCase._id || selectedCase.caseId);
    } catch (error) {
      console.error('Failed to load case files:', error);
      setError('Failed to load case files. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };
  
  // Convert case files to evidence format
  const evidenceFiles = (caseFiles || []).map(file => ({
    id: file._id || file.id || file.filename,
    name: file.originalName || file.filename || file.name || 'Unknown File',
    type: file.mimetype || file.contentType || file.fileType || 'unknown',
    size: formatFileSize(file.size || 0),
    uploaded: new Date(file.uploadedAt || file.createdAt || Date.now()).toLocaleString(),
    processed: file.status === 'processed' || file.status === 'completed',
    category: getCategoryFromType(file.mimetype || file.contentType || file.fileType || 'unknown'),
    icon: getFileIcon(file.originalName || file.filename || file.name || 'unknown'),
    preview: generatePreview(file),
    metadata: generateMetadata(file),
    rawFile: file // Keep reference to original file data
  }));
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function getCategoryFromType(fileType) {
    if (!fileType) return 'files';
    
    const type = fileType.toLowerCase();
    
    // Database and communication files
    if (type.includes('database') || type.includes('sqlite') || type.includes('db')) {
      return 'communications';
    }
    
    // Document types
    if (type.includes('text') || type.includes('json') || type.includes('xml') || 
        type.includes('csv') || type.includes('pdf') || type.includes('document')) {
      return 'documents';
    }
    
    // Media files
    if (type.includes('image') || type.includes('video') || type.includes('audio') ||
        type.includes('png') || type.includes('jpg') || type.includes('jpeg') || 
        type.includes('gif') || type.includes('mp4') || type.includes('mp3')) {
      return 'media';
    }
    
    // Location data
    if (type.includes('kml') || type.includes('gps') || type.includes('location')) {
      return 'location';
    }
    
    // Archive files
    if (type.includes('archive') || type.includes('zip') || type.includes('rar') || 
        type.includes('7z') || type.includes('tar')) {
      return 'files';
    }
    
    return 'files';
  }
  
  function getFileIcon(fileName) {
    if (!fileName) return '📁';
    
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      // Database files
      case 'db': 
      case 'sqlite': 
      case 'sqlite3': 
        return '💬';
      
      // Data files
      case 'json': 
      case 'xml': 
      case 'csv': 
        return '📋';
      
      // Archive files
      case 'zip': 
      case 'rar': 
      case '7z': 
      case 'tar': 
      case 'gz': 
        return '📦';
      
      // Text files
      case 'txt': 
      case 'log': 
      case 'md': 
        return '📄';
      
      // Document files
      case 'pdf': 
        return '📜';
      case 'doc':
      case 'docx':
        return '�';
      
      // Image files
      case 'png': 
      case 'jpg': 
      case 'jpeg': 
      case 'gif': 
      case 'bmp': 
      case 'webp': 
        return '🖼️';
      
      // Video files
      case 'mp4': 
      case 'avi': 
      case 'mov': 
      case 'wmv': 
        return '🎥';
      
      // Audio files
      case 'mp3': 
      case 'wav': 
      case 'flac': 
        return '🎵';
      
      // Disk image files
      case 'img': 
      case 'dd': 
      case 'iso': 
        return '💽';
      
      // Location files
      case 'kml': 
      case 'gpx': 
        return '📍';
      
      // Executable files
      case 'exe': 
      case 'msi': 
        return '⚙️';
      
      default: 
        return '📁';
    }
  }
  
  function generatePreview(file) {
    const fileName = file.originalName || file.filename || 'Unknown file';
    const fileType = file.mimetype || file.contentType || file.fileType || 'unknown';
    
    // Generate preview based on file type and status
    if (file.status === 'processed') {
      if (fileType.includes('database') || fileType.includes('sqlite')) {
        return `Database file processed and indexed. Ready for communication analysis and timeline reconstruction.`;
      } else if (fileType.includes('json') || fileType.includes('xml')) {
        return `Structured data file processed. Contains metadata and information ready for forensic analysis.`;
      } else if (fileType.includes('image')) {
        return `Image file processed. Metadata extracted and ready for analysis including EXIF data and content recognition.`;
      } else if (fileType.includes('archive')) {
        return `Archive file processed. Contents extracted and individual files analyzed for evidence.`;
      } else {
        return `File successfully processed and indexed. Ready for comprehensive forensic analysis.`;
      }
    } else if (file.status === 'completed' || file.status === 'uploaded') {
      return `File uploaded successfully. Queued for processing and AI-powered forensic analysis.`;
    } else if (file.status === 'processing') {
      return `Currently processing file contents. AI analysis and indexing in progress...`;
    } else if (file.status === 'error' || file.status === 'failed') {
      return `File processing failed. Please check file integrity and try uploading again.`;
    } else {
      return `File upload in progress. Will be processed automatically once upload completes.`;
    }
  }
  
  function generateMetadata(file) {
    const metadata = {
      'File Size': formatFileSize(file.size || 0),
      'Upload Date': new Date(file.uploadedAt || file.createdAt || Date.now()).toLocaleDateString(),
      'Status': (file.status || 'unknown').charAt(0).toUpperCase() + (file.status || 'unknown').slice(1),
      'Type': file.mimetype || file.contentType || file.fileType || 'unknown',
      'Processed': (file.status === 'processed' || file.status === 'completed') ? 'Yes' : 'No'
    };

    // Add additional metadata based on file type
    if (file.originalName || file.filename) {
      metadata['Original Name'] = file.originalName || file.filename;
    }

    if (file.path) {
      metadata['File Path'] = file.path;
    }

    if (file.encoding) {
      metadata['Encoding'] = file.encoding;
    }

    // Add case-specific metadata
    if (file.caseId) {
      metadata['Case ID'] = file.caseId;
    }

    return metadata;
  }

  // Helper function to refresh case files
  const refreshFiles = async () => {
    if (selectedCase) {
      await loadCaseFiles();
    }
  };

  const categories = [
    { id: 'all', name: 'All Files', count: evidenceFiles.length },
    { id: 'communications', name: 'Communications', count: evidenceFiles.filter(f => f.category === 'communications').length },
    { id: 'media', name: 'Media Files', count: evidenceFiles.filter(f => f.category === 'media').length },
    { id: 'documents', name: 'Documents', count: evidenceFiles.filter(f => f.category === 'documents').length },
    { id: 'location', name: 'Location Data', count: evidenceFiles.filter(f => f.category === 'location').length },
    { id: 'files', name: 'Other Files', count: evidenceFiles.filter(f => f.category === 'files').length }
  ];

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    color: '#1e293b',
    width: '100%',
    boxSizing: 'border-box'
  };

  const sidebarStyle = {
    width: '280px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    marginBottom: '24px'
  };

  const mainContentStyle = {
    flex: 1
  };

  const categoryItemStyle = (isActive) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '8px',
    backgroundColor: isActive ? '#0ea5e9' : 'transparent',
    transition: 'background-color 0.2s ease'
  });

  const fileCardStyle = {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: 'fit-content'
  };

  const fileListItemStyle = {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const filteredFiles = selectedCategory === 'all' 
    ? evidenceFiles 
    : evidenceFiles.filter(file => file.category === selectedCategory);

  const renderFileCard = (file) => (
    <div
      key={file.id}
      style={fileCardStyle}
      onClick={() => setSelectedFile(file)}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{file.icon}</span>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {file.name}
          </h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
            <span>{file.size}</span>
            <span>{file.type.toUpperCase()}</span>
          </div>
        </div>
        <div style={{
          backgroundColor: file.processed ? '#059669' : '#f59e0b',
          color: '#1e293b',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '10px',
          fontWeight: '600'
        }}>
          {file.processed ? 'PROCESSED' : 'PENDING'}
        </div>
      </div>
      <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '12px', lineHeight: '1.4' }}>
        {file.preview}
      </p>
      <div style={{ fontSize: '12px', color: '#64748b' }}>
        Uploaded: {file.uploaded}
      </div>
    </div>
  );

  const renderFileListItem = (file) => (
    <div
      key={file.id}
      style={fileListItemStyle}
      onClick={() => setSelectedFile(file)}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#f8fafc'}
    >
      <span style={{ fontSize: '24px' }}>{file.icon}</span>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
          {file.name}
        </h3>
        <p style={{ color: '#d1d5db', fontSize: '14px', marginBottom: '4px' }}>
          {file.preview}
        </p>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
          <span>{file.size}</span>
          <span>{file.type.toUpperCase()}</span>
          <span>{file.uploaded}</span>
        </div>
      </div>
      <div style={{
        backgroundColor: file.processed ? '#059669' : '#f59e0b',
        color: '#1e293b',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '600'
      }}>
        {file.processed ? 'PROCESSED' : 'PENDING'}
      </div>
    </div>
  );

  // Show empty state if no case is selected
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
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>📁</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
              No Case Selected
            </h3>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5' }}>
              Please select a case from the Case Management section to view its evidence files
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  const isLoading = localLoading || contextLoading;
  if (isLoading && (!caseFiles || caseFiles.length === 0)) {
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
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '24px', 
              animation: 'spin 2s linear infinite',
              display: 'inline-block'
            }}>⏳</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
              Loading Evidence Files
            </h3>
            <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5' }}>
              Retrieving files for case: {selectedCase.name || selectedCase.title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          👁️ Evidence Viewer {selectedCase && `- ${selectedCase.name}`}
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          {selectedCase ? 
            `Viewing evidence files for case: ${selectedCase.name}` :
            'Comprehensive evidence file management and analysis for your forensic investigations'
          }
        </p>
      </div>

      {/* Controls Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#dc2626',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              ⚠️ {error}
              <button 
                onClick={() => setError('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '0 4px'
                }}
              >
                ✕
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={refreshFiles}
            disabled={isLoading}
            style={{
              backgroundColor: isLoading ? '#94a3b8' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? '⏳' : '🔄'} Refresh Files
          </button>
          
          <button 
            onClick={() => {
              // Navigate to upload component
              const event = new CustomEvent('navigate', { detail: { component: 'UploadUFDR' } });
              window.dispatchEvent(event);
            }}
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            📤 Upload New Evidence
          </button>
        </div>
      </div>

      {/* Categories Filter */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
          Filter by Category
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px' 
        }}>
          {categories.map(category => (
            <button
              key={category.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedCategory === category.id ? '#0ea5e9' : '#f8fafc',
                border: selectedCategory === category.id ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                color: selectedCategory === category.id ? 'white' : '#1e293b',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedCategory(category.id)}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = '#e2e8f0';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = '#f8fafc';
                }
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '500' }}>{category.name}</span>
              <span style={{
                backgroundColor: selectedCategory === category.id ? 'rgba(255,255,255,0.2)' : '#64748b',
                color: '#1e293b',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div style={{
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
          📊 File Statistics
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>
              {evidenceFiles.length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Files</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
              {evidenceFiles.filter(f => f.processed).length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Processed</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ffffff', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
              {evidenceFiles.filter(f => !f.processed).length}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Pending</div>
          </div>
        </div>
      </div>

      {/* File Results Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
          Evidence Files
        </h2>
        <p style={{ color: '#64748b' }}>
          {filteredFiles.length} files in {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name}
        </p>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        {/* File Grid/List */}
        {filteredFiles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8fafc',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>📂</div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px', color: '#1e293b' }}>
              No Evidence Files Found
            </h3>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
              {selectedCategory === 'all' 
                ? 'Upload UFDR files to begin your forensic investigation.' 
                : `No files found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`}
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                style={{
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
                }}
                onClick={() => {
                  // Navigate to upload component
                  const event = new CustomEvent('navigate', { detail: { component: 'UploadUFDR' } });
                  window.dispatchEvent(event);
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0284c7';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0ea5e9';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                📤 Upload Evidence Files
              </button>
              {selectedCategory !== 'all' && (
                <button 
                  style={{
                    backgroundColor: '#6b7280',
                    color: '#1e293b',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => setSelectedCategory('all')}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#4b5563';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#6b7280';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  📋 View All Files
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {filteredFiles.map(renderFileListItem)}
          </div>
        )}
      </div>

      {/* File Details Modal */}
      {selectedFile && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>File Details</h2>
              <button
                onClick={() => setSelectedFile(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '20px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <span style={{ fontSize: '48px' }}>{selectedFile.icon}</span>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                  {selectedFile.name}
                </h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#64748b' }}>
                  <span>{selectedFile.size}</span>
                  <span>{selectedFile.type.toUpperCase()}</span>
                  <span style={{
                    backgroundColor: selectedFile.processed ? '#059669' : '#f59e0b',
                    color: '#1e293b',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}>
                    {selectedFile.processed ? 'PROCESSED' : 'PENDING'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Description</h4>
              <p style={{ color: '#d1d5db', lineHeight: '1.6' }}>{selectedFile.preview}</p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Metadata</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {Object.entries(selectedFile.metadata).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>{key}:</span>
                    <span style={{ color: '#1e293b', fontSize: '14px', fontWeight: '600' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  // TODO: Implement AI analysis functionality
                  console.log('Analyze file:', selectedFile.name);
                  setSelectedFile(null);
                }}
                disabled={!selectedFile.processed}
                style={{
                  backgroundColor: selectedFile.processed ? '#0ea5e9' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: selectedFile.processed ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: selectedFile.processed ? 1 : 0.6
                }}
              >
                🔍 Analyze File
              </button>
              
              <button 
                onClick={() => {
                  // TODO: Implement report generation
                  console.log('Generate report for:', selectedFile.name);
                  setSelectedFile(null);
                }}
                disabled={!selectedFile.processed}
                style={{
                  backgroundColor: selectedFile.processed ? '#059669' : '#94a3b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: selectedFile.processed ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '600',
                  opacity: selectedFile.processed ? 1 : 0.6
                }}
              >
                📊 Generate Report
              </button>
              
              <button 
                onClick={() => {
                  // TODO: Implement file download
                  console.log('Download file:', selectedFile.name);
                }}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                💾 Download
              </button>
              
              {selectedFile.rawFile && (
                <button 
                  onClick={() => {
                    // TODO: Implement file deletion with confirmation
                    if (window.confirm(`Are you sure you want to delete ${selectedFile.name}? This action cannot be undone.`)) {
                      console.log('Delete file:', selectedFile.name);
                      setSelectedFile(null);
                      refreshFiles();
                    }
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
