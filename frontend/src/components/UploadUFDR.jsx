import { useState } from 'react';
import { useFiles } from './Dashboard';

const UploadUFDR = () => {
  const { uploadedFiles, addFiles, updateFileStatus, removeFile: removeFileFromContext } = useFiles();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#1e293b',
    minHeight: '100vh',
    width: '100%',
    color: 'white'
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
    backgroundColor: isDragging ? '#1e40af' : '#334155',
    border: `2px dashed ${isDragging ? '#3b82f6' : '#475569'}`,
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
    color: isDragging ? 'white' : '#e2e8f0'
  };

  const uploadSubtextStyle = {
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '20px'
  };

  const browseButtonStyle = {
    backgroundColor: '#0ea5e9',
    color: 'white',
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

  const handleFiles = (files) => {
    const validFiles = [];
    const errors = [];
    
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploading',
          progress: 0,
          error: null,
          uploadedAt: new Date().toISOString(),
          fileType: getFileType(file.name)
        });
      } else {
        errors.push({ fileName: file.name, error: validation.error });
      }
    });

    if (errors.length > 0) {
      // Show errors to user
      console.warn('File validation errors:', errors);
      alert(`Some files were rejected:\n${errors.map(e => `${e.fileName}: ${e.error}`).join('\n')}`);
    }

    if (validFiles.length > 0) {
      addFiles(validFiles);
      
      // Start upload simulation for valid files
      validFiles.forEach(file => {
        simulateUpload(file.id);
      });
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

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          📤 Upload UFDR Data
        </h1>
        <p style={subtitleStyle}>
          Upload your UFDR (Universal Forensic Data Repository) files for AI-powered analysis. 
          Supported formats include SQLite databases, XML exports, and compressed archives.
        </p>
      </div>

      {/* Upload Area */}
      <div
        style={uploadAreaStyle}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById('fileInput').click();
        }}
      >
        <div style={uploadIconStyle}>
          {isDragging ? '⬇️' : '📤'}
        </div>
        <div style={uploadTextStyle}>
          {isDragging ? 'Drop files here' : 'Drag & Drop UFDR files'}
        </div>
        <div style={uploadSubtextStyle}>
          or click to browse your computer
        </div>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginBottom: '16px'
        }}>
          Maximum file size: 500MB • Supported formats: DB, XML, ZIP, TXT, JSON, IMG
        </div>
        <button style={browseButtonStyle}>
          Browse Files
        </button>
        <input
          id="fileInput"
          type="file"
          multiple
          accept=".db,.sqlite,.xml,.zip,.rar,.7z,.txt,.log,.json"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
      </div>

      {/* Supported Formats */}
      <div style={{
        backgroundColor: '#334155',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px',
        border: '1px solid #475569'
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
              backgroundColor: '#1e293b',
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
          backgroundColor: '#334155',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          border: '1px solid #475569'
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
          backgroundColor: '#334155',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #475569'
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
                  color: 'white',
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
                backgroundColor: '#1e293b',
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
                        color: 'white',
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
                            color: 'white',
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
  );
};

export default UploadUFDR;