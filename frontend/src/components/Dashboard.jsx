import { createContext, useContext, useState } from 'react';
import forensicLogo from '../assets/forensic.svg';

import CaseManagement from './CaseManagement';
import EvidenceViewer from './EvidenceViewer';
import NetworkAnalysis from './NetworkAnalysis';
import QueryInterface from './QueryInterface';
import Reports from './Reports';
import UploadUFDR from './UploadUFDR';

// Global File Context for sharing uploaded files across components
const FileContext = createContext();

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Global file management state
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [fileAnalytics, setFileAnalytics] = useState({
    totalFiles: 0,
    totalSize: 0,
    processedCount: 0,
    lastUpload: null
  });
  
  // File operations
  const addFiles = (files) => {
    setUploadedFiles(prev => [...prev, ...files]);
    updateAnalytics(files);
  };
  
  const updateFileStatus = (fileId, status, additionalData = {}) => {
    setUploadedFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status, ...additionalData }
          : file
      )
    );
    
    if (status === 'processed') {
      const file = uploadedFiles.find(f => f.id === fileId);
      if (file) {
        setProcessedFiles(prev => [...prev, { ...file, status, ...additionalData }]);
      }
    }
  };
  
  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setProcessedFiles(prev => prev.filter(file => file.id !== fileId));
  };
  
  const updateAnalytics = (newFiles) => {
    setFileAnalytics(prev => ({
      totalFiles: uploadedFiles.length + newFiles.length,
      totalSize: prev.totalSize + newFiles.reduce((sum, file) => sum + file.size, 0),
      processedCount: processedFiles.length,
      lastUpload: new Date().toISOString()
    }));
  };
  
  const fileContextValue = {
    uploadedFiles,
    processedFiles,
    fileAnalytics,
    addFiles,
    updateFileStatus,
    removeFile,
    setUploadedFiles,
    setProcessedFiles
  };
  
  const sidebarStyle = {
    width: '240px',
    backgroundColor: '#0f172a',
    color: 'white',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto',
    zIndex: 1000
  };

  const mainContentStyle = {
    marginLeft: '240px',
    backgroundColor: '#1e293b',
    minHeight: '100vh',
    color: 'white',
    width: 'calc(100vw - 240px)'
  };

  const headerStyle = {
    backgroundColor: '#0f172a',
    padding: '16px 24px',
    borderBottom: '1px solid #334155',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%'
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '20px 24px',
    borderBottom: '1px solid #334155',
    position: 'relative'
  };

  const menuSections = [
    {
      title: 'MAIN',
      items: [
        { icon: '📊', label: 'Dashboard', view: 'dashboard', active: currentView === 'dashboard' },
        { icon: '📁', label: 'Cases', view: 'cases', active: currentView === 'cases' },
        { icon: '🔍', label: 'Query Interface', view: 'query', active: currentView === 'query' },
        { icon: '📤', label: 'Upload UFDR', view: 'upload', active: currentView === 'upload' },
        { icon: '📋', label: 'Reports', view: 'reports', active: currentView === 'reports' },
        { icon: '📈', label: 'Analytics', view: 'analytics', active: currentView === 'analytics' }
      ]
    },
    {
      title: 'INVESTIGATION',
      items: [
        { icon: '👁️', label: 'Evidence Viewer', view: 'evidence', active: currentView === 'evidence' },
        { icon: '🤖', label: 'AI Investigation', view: 'ai', active: currentView === 'ai' },
        { icon: '🌐', label: 'Network Analysis', view: 'network', active: currentView === 'network' },
        { icon: '🔍', label: 'Database Search', view: 'search', active: currentView === 'search' }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { icon: '👥', label: 'User Management', view: 'users', active: currentView === 'users' },
        { icon: '⚙️', label: 'System Settings', view: 'settings', active: currentView === 'settings' }
      ]
    }
  ];

  const renderMenuItem = (item, index) => {
    const itemStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 24px',
      cursor: 'pointer',
      backgroundColor: item.active ? '#1e40af' : 'transparent',
      borderRight: item.active ? '3px solid #3b82f6' : 'none',
      transition: 'all 0.2s ease',
      justifyContent: 'flex-start',
      position: 'relative'
    };

    return (
      <div
        key={index}
        style={itemStyle}
        onClick={() => item.view && setCurrentView(item.view)}
        onMouseEnter={(e) => {
          if (!item.active) {
            e.target.style.backgroundColor = '#334155';
          }
        }}
        onMouseLeave={(e) => {
          if (!item.active) {
            e.target.style.backgroundColor = 'transparent';
          }
        }}
      >
        <span style={{ fontSize: '16px' }}>{item.icon}</span>
        <span style={{ fontSize: '14px', fontWeight: item.active ? '600' : '400' }}>
          {item.label}
        </span>
      </div>
    );
  };

  return (
    <FileContext.Provider value={fileContextValue}>
      <div style={{ display: 'flex', backgroundColor: '#1e293b', minHeight: '100vh' }}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          {/* Logo */}
          <div style={logoStyle}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={forensicLogo} 
                alt="ForenSight Logo" 
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                }}
                onError={(e) => {
                  // Fallback to text logo if image fails to load
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#0ea5e9',
                  borderRadius: '8px',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                FS
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>ForenSight</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AI-Driven UFDR Analysis</div>
            </div>
          </div>

          {/* Menu */}
          <div style={{ padding: '20px 0' }}>
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} style={{ marginBottom: '24px' }}>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#64748b',
                  padding: '0 24px 8px',
                  letterSpacing: '0.05em'
                }}>
                  {section.title}
                </div>
                {section.items.map(renderMenuItem)}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div style={mainContentStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(14, 165, 233, 0.2)'
              }}>
                <img 
                  src={forensicLogo} 
                  alt="ForenSight Logo" 
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div 
                  style={{
                    width: '28px',
                    height: '28px',
                    backgroundColor: '#0ea5e9',
                    borderRadius: '6px',
                    display: 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: 'white'
                  }}
                >
                  FS
                </div>
                <div>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '700',
                    color: '#0ea5e9',
                    lineHeight: '1.2'
                  }}>
                    ForenSight
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#64748b',
                    lineHeight: '1.2',
                    fontWeight: '500'
                  }}>
                    Digital Forensics Platform
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '6px 12px',
                backgroundColor: '#059669',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'white'
              }}>
                ONLINE
              </div>
              <div style={{
                fontSize: '14px',
                color: '#64748b'
              }}>
                System Status: Active
              </div>
            </div>
          </div>

          {/* Main Content Based on Current View */}
          {currentView === 'dashboard' && (
            <div style={{ padding: '24px', width: '100%' }}>
              <div style={{ width: '100%' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'left' }}>
                  📊 ForenSight Dashboard
                </h1>
                
                {/* File Analytics Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px',
                  width: '100%'
                }}>
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #475569',
                    background: 'linear-gradient(135deg, #334155 0%, #3c4c63 100%)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '16px' 
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#0ea5e9',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        📁
                      </div>
                      <div style={{
                        backgroundColor: fileAnalytics.totalFiles > 0 ? '#059669' : '#64748b',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {fileAnalytics.totalFiles > 0 ? 'ACTIVE' : 'EMPTY'}
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                      {fileAnalytics.totalFiles}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Evidence Files
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📊</span> Total files uploaded
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #475569',
                    background: 'linear-gradient(135deg, #334155 0%, #3c4c63 100%)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '16px' 
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#059669',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        💾
                      </div>
                      <div style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        STORAGE
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                      {Math.round(fileAnalytics.totalSize / (1024 * 1024))} MB
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      Data Processed
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>📈</span> Total storage used
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: '#334155',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #475569',
                    background: 'linear-gradient(135deg, #334155 0%, #3c4c63 100%)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      marginBottom: '16px' 
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#7c3aed',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        🤖
                      </div>
                      <div style={{
                        backgroundColor: processedFiles.length > 0 ? '#7c3aed' : '#64748b',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {processedFiles.length > 0 ? 'AI READY' : 'WAITING'}
                      </div>
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
                      {processedFiles.length}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                      AI Processed
                    </div>
                    <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>⚡</span> Ready for analysis
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions Section */}
                <div style={{
                  backgroundColor: '#334155',
                  padding: '24px',
                  borderRadius: '16px',
                  border: '1px solid #475569',
                  marginBottom: '32px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#0ea5e9' }}>●</span>
                    Quick Actions
                  </h3>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                      style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setCurrentView('upload')}
                    >
                      📤 Upload UFDR Data
                    </button>
                    <button 
                      style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setCurrentView('evidence')}
                    >
                      👁️ View Evidence
                    </button>
                    <button 
                      style={{
                        backgroundColor: '#0d9488',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setCurrentView('query')}
                    >
                      🔍 Start Investigation
                    </button>
                    <button 
                      style={{
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        border: 'none',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => setCurrentView('network')}
                    >
                      🌐 Network Analysis
                    </button>
                  </div>
                </div>

                {/* System Status and Recent Activity */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '24px',
                  width: '100%'
                }}>
                  {/* System Status */}
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #475569'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#059669' }}>●</span>
                      System Status
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>AI Processing Engine</span>
                        <span style={{
                          backgroundColor: '#0ea5e9',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          Online
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Evidence Storage</span>
                        <span style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          Available
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Query Interface</span>
                        <span style={{
                          backgroundColor: processedFiles.length > 0 ? '#0d9488' : '#64748b',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {processedFiles.length > 0 ? 'Ready' : 'Waiting'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px' }}>Network Analysis</span>
                        <span style={{
                          backgroundColor: '#7c3aed',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          Standby
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Files */}
                  <div style={{
                    backgroundColor: '#334155',
                    padding: '24px',
                    borderRadius: '16px',
                    border: '1px solid #475569'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                      Recent Files
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {uploadedFiles.slice(-4).length > 0 ? (
                        uploadedFiles.slice(-4).map((file) => (
                          <div key={file.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px',
                            backgroundColor: '#1e293b',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '16px' }}>📁</span>
                              <span style={{ fontSize: '14px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {file.name}
                              </span>
                            </div>
                            <span style={{
                              backgroundColor: 
                                file.status === 'completed' ? '#059669' :
                                file.status === 'processed' ? '#7c3aed' :
                                file.status === 'failed' ? '#dc2626' : '#0ea5e9',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              fontSize: '11px'
                            }}>
                              {file.status || 'uploading'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          padding: '20px',
                          color: '#64748b'
                        }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📂</div>
                          <p style={{ fontSize: '14px' }}>No files uploaded yet</p>
                          <p style={{ fontSize: '12px' }}>Upload UFDR data to get started</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Views */}
          {currentView === 'query' && <QueryInterface />}
          {currentView === 'evidence' && <EvidenceViewer />}
          {currentView === 'network' && <NetworkAnalysis />}
          {currentView === 'cases' && <CaseManagement />}
          {currentView === 'upload' && <UploadUFDR />}
          {currentView === 'reports' && <Reports />}

          {currentView === 'analytics' && (
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                📈 Analytics
              </h1>
              <p style={{ color: '#64748b' }}>No analytics data available. Upload evidence files to view analysis.</p>
            </div>
          )}

          {currentView === 'ai' && (
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                🤖 AI Investigation
              </h1>
              <p style={{ color: '#64748b' }}>No evidence data available for AI analysis. Please upload UFDR files first.</p>
            </div>
          )}

          {currentView === 'search' && (
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                🔍 Database Search
              </h1>
              <p style={{ color: '#64748b' }}>No database files available for search. Upload UFDR data to enable database queries.</p>
            </div>
          )}

          {currentView === 'users' && (
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                👥 User Management
              </h1>
              <p style={{ color: '#64748b' }}>User management requires administrator privileges. Contact your system administrator.</p>
            </div>
          )}

          {currentView === 'settings' && (
            <div style={{ padding: '24px' }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
                ⚙️ System Settings
              </h1>
              <p style={{ color: '#64748b' }}>System configuration requires administrator access. Please contact your system administrator.</p>
            </div>
          )}
        </div>
      </div>
    </FileContext.Provider>
  );
};

export default Dashboard;
