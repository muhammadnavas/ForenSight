import { useState } from 'react';
import { useFiles } from './Dashboard';

const EvidenceViewer = () => {
  const { uploadedFiles, processedFiles } = useFiles();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Convert uploaded files to evidence format
  const evidenceFiles = uploadedFiles.map(file => ({
    id: file.id,
    name: file.name,
    type: file.fileType || 'unknown',
    size: formatFileSize(file.size),
    uploaded: new Date(file.uploadedAt || Date.now()).toLocaleString(),
    processed: file.status === 'processed',
    category: getCategoryFromType(file.fileType || 'unknown'),
    icon: getFileIcon(file.name),
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
    display: 'flex',
    height: '100vh',
    width: '100%',
    backgroundColor: '#1e293b',
    color: 'white'
  };

  const sidebarStyle = {
    width: '280px',
    backgroundColor: '#334155',
    borderRight: '1px solid #475569',
    padding: '24px',
    overflowY: 'auto'
  };

  const mainContentStyle = {
    flex: 1,
    padding: '24px',
    overflowY: 'auto'
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
    backgroundColor: '#334155',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #475569',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    height: 'fit-content'
  };

  const fileListItemStyle = {
    backgroundColor: '#334155',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #475569',
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
          color: 'white',
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
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '10px',
        fontWeight: '600'
      }}>
        {file.processed ? 'PROCESSED' : 'PENDING'}
      </div>
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px' }}>
          👁️ Evidence Viewer
        </h2>

        {/* View Mode Toggle */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', backgroundColor: '#1e293b', borderRadius: '8px', padding: '4px' }}>
            <button
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: viewMode === 'grid' ? '#1e40af' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={() => setViewMode('grid')}
            >
              🔳 Grid
            </button>
            <button
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: viewMode === 'list' ? '#1e40af' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#64748b' }}>
            CATEGORIES
          </h3>
          {categories.map(category => (
            <div
              key={category.id}
              style={categoryItemStyle(selectedCategory === category.id)}
              onClick={() => setSelectedCategory(category.id)}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = '#475569';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '14px' }}>{category.name}</span>
              <span style={{
                backgroundColor: '#64748b',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                {category.count}
              </span>
            </div>
          ))}
        </div>

        {/* File Stats */}
        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#1e293b', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Statistics</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Files:</span>
              <span style={{ color: 'white' }}>{evidenceFiles.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Processed:</span>
              <span style={{ color: '#059669' }}>{evidenceFiles.filter(f => f.processed).length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Pending:</span>
              <span style={{ color: '#f59e0b' }}>{evidenceFiles.filter(f => !f.processed).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={mainContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              Evidence Files
            </h1>
            <p style={{ color: '#64748b' }}>
              {filteredFiles.length} files in {selectedCategory === 'all' ? 'all categories' : categories.find(c => c.id === selectedCategory)?.name}
            </p>
          </div>
          <button style={{
            backgroundColor: '#1e40af',
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
          }}>
            📤 Upload New Evidence
          </button>
        </div>

        {/* File Grid/List */}
        {filteredFiles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📂</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'white' }}>
              No Evidence Files Found
            </h3>
            <p style={{ marginBottom: '24px' }}>
              Upload UFDR files to begin your forensic investigation.
            </p>
            <button 
              style={{
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
              onClick={() => window.location.hash = '#upload'}
            >
              📤 Upload Evidence Files
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}>
            {filteredFiles.map(renderFileCard)}
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
            backgroundColor: '#1e293b',
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
                    color: 'white',
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
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: '#334155', borderRadius: '6px' }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>{key}:</span>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                backgroundColor: '#1e40af',
                color: 'white',
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
                color: 'white',
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