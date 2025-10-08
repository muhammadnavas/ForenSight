import { useEffect, useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';

const EvidenceViewer = () => {
  const { selectedCase, getCaseFiles } = useCaseContext();
  const [caseFiles, setCaseFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);

  // Load files when selected case changes
  useEffect(() => {
    if (selectedCase) {
      loadCaseFiles();
    } else {
      setCaseFiles([]);
    }
  }, [selectedCase]);

  const loadCaseFiles = async () => {
    if (!selectedCase) return;
    
    try {
      setLoading(true);
      const files = await getCaseFiles(selectedCase._id || selectedCase.caseId);
      setCaseFiles(files);
    } catch (error) {
      console.error('Failed to load case files:', error);
      setCaseFiles([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Convert case files to evidence format
  const evidenceFiles = caseFiles.map(file => ({
    id: file._id || file.id,
    name: file.originalName || file.name,
    type: file.mimetype || file.fileType || 'unknown',
    size: formatFileSize(file.size),
    uploaded: new Date(file.uploadedAt || file.createdAt || Date.now()).toLocaleString(),
    processed: file.status === 'processed',
    category: getCategoryFromType(file.mimetype || file.fileType || 'unknown'),
    icon: getFileIcon(file.originalName || file.name),
    preview: generatePreview(file),
    metadata: generateMetadata(file)
  }));
  
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  function getCategoryFromType(fileType) {
    switch (fileType) {
      case 'database': return 'communications';
      case 'data': return 'documents';
      case 'archive': return 'files';
      case 'text': return 'documents';
      case 'image': return 'media';
      default: return 'files';
    }
  }
  
  function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    switch (extension) {
      case 'db': case 'sqlite': return '💬';
      case 'json': case 'xml': return '📋';
      case 'zip': case 'rar': case '7z': return '📦';
      case 'txt': case 'log': return '📄';
      case 'img': case 'dd': return '💽';
      case 'png': case 'jpg': case 'jpeg': return '🖼️';
      default: return '📁';
    }
  }
  
  function generatePreview(file) {
    if (file.status === 'processed') {
      return `File successfully processed and ready for analysis. AI indexing complete.`;
    } else if (file.status === 'completed') {
      return `File uploaded successfully. Ready for processing and AI analysis.`;
    } else {
      return `Upload in progress... File will be available for analysis once complete.`;
    }
  }
  
  function generateMetadata(file) {
    return {
      'File Size': formatFileSize(file.size),
      'Upload Date': new Date(file.uploadedAt || Date.now()).toLocaleDateString(),
      'Status': file.status || 'uploading',
      'Type': file.fileType || 'unknown',
      'Processed': file.status === 'processed' ? 'Yes' : 'No'
    };
  }

  // TODO: Load evidence files from API
  // useEffect(() => {
  //   const loadEvidenceFiles = async () => {
  //     try {
  //       const response = await fetch('/api/evidence');
  //       const files = await response.json();
  //       setEvidenceFiles(files);
  //     } catch (error) {
  //       console.error('Failed to load evidence files:', error);
  //     }
  //   };
  //   loadEvidenceFiles();
  // }, []);

  // Remove this mock data array - replaced with empty state above
  const mockEvidenceFiles = [
    {
      id: 1,
      name: 'WhatsApp_Backup_2024.db',
      type: 'database',
      size: '2.3 MB',
      uploaded: '2024-03-15 09:30:00',
      processed: true,
      category: 'communications',
      icon: '💬',
      preview: 'Contains 1,247 messages, 89 contacts, 156 media files',
      metadata: { messages: 1247, contacts: 89, media: 156 }
    },
    {
      id: 2,
      name: 'Call_Logs_Extract.json',
      type: 'json',
      size: '45 KB',
      uploaded: '2024-03-15 09:32:00',
      processed: true,
      category: 'communications',
      icon: '📞',
      preview: '234 call records including duration, timestamps, and contact info',
      metadata: { calls: 234, duration: '15h 42m', international: 12 }
    },
    {
      id: 3,
      name: 'Crypto_Wallet_Screenshot.png',
      type: 'image',
      size: '245 KB',
      uploaded: '2024-03-15 10:15:00',
      processed: true,
      category: 'media',
      icon: '🖼️',
      preview: 'Screenshot showing Bitcoin wallet with balance of 2.3 BTC',
      metadata: { resolution: '1920x1080', format: 'PNG', location: 'Gallery' }
    },
    {
      id: 4,
      name: 'SMS_Messages_2024.xml',
      type: 'xml',
      size: '1.8 MB',
      uploaded: '2024-03-15 10:20:00',
      processed: true,
      category: 'communications',
      icon: '📱',
      preview: '3,456 SMS messages with timestamps and contact details',
      metadata: { messages: 3456, contacts: 67, threads: 45 }
    },
    {
      id: 5,
      name: 'Browser_History.csv',
      type: 'csv',
      size: '892 KB',
      uploaded: '2024-03-15 11:00:00',
      processed: false,
      category: 'files',
      icon: '🌐',
      preview: 'Web browsing history with 12,000+ entries',
      metadata: { entries: 12000, domains: 450, timespan: '6 months' }
    },
    {
      id: 6,
      name: 'Financial_Records.pdf',
      type: 'pdf',
      size: '3.2 MB',
      uploaded: '2024-03-15 11:30:00',
      processed: true,
      category: 'documents',
      icon: '📄',
      preview: 'Bank statements and transaction records',
      metadata: { pages: 45, transactions: 178, accounts: 3 }
    },
    {
      id: 7,
      name: 'GPS_Coordinates.kml',
      type: 'kml',
      size: '156 KB',
      uploaded: '2024-03-15 12:00:00',
      processed: true,
      category: 'location',
      icon: '📍',
      preview: 'Location data with 234 GPS coordinates and timestamps',
      metadata: { coordinates: 234, timespan: '30 days', accuracy: 'High' }
    },
    {
      id: 8,
      name: 'Encrypted_Archive.zip',
      type: 'archive',
      size: '15.7 MB',
      uploaded: '2024-03-15 12:30:00',
      processed: false,
      category: 'files',
      icon: '🔐',
      preview: 'Password-protected archive containing unknown files',
      metadata: { files: 'Unknown', encryption: 'AES-256', status: 'Encrypted' }
    }
  ]; // This mock data is no longer used

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
    backgroundColor: isActive ? '#1e40af' : 'transparent',
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
      onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#334155'}
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
              Please select a case from the header to view its evidence files
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
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <button style={{
          backgroundColor: '#1e40af',
          color: '#1e293b',
          border: 'none',
          borderRadius: '8px',
          padding: '12px 20px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          📤 Upload New Evidence
        </button>
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
                backgroundColor: selectedCategory === category.id ? '#1e40af' : '#1e293b',
                border: selectedCategory === category.id ? '2px solid #3b82f6' : '1px solid #475569',
                color: '#1e293b',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedCategory(category.id)}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = '#475569';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = '#1e293b';
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
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
                }}
                onClick={() => window.location.hash = '#upload'}
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
            border: '1px solid #334155'
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

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                backgroundColor: '#1e40af',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                🔍 Analyze File
              </button>
              <button style={{
                backgroundColor: '#059669',
                color: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                📊 Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceViewer;
