import { createContext, useContext, useState } from 'react';

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
  // TODO: Add case management state when API is available

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'query', 'evidence', 'network', etc.
  
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
  
  // Custom scrollbar styles
  const customScrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #1e293b;
      border-radius: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
      transition: background-color 0.2s ease;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
  `;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarStyle = {
    width: sidebarCollapsed ? '60px' : '240px',
    backgroundColor: '#0f172a',
    color: 'white',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    overflowY: 'auto',
    zIndex: 1000,
    transition: 'width 0.3s ease',
    scrollbarWidth: 'thin',
    scrollbarColor: '#475569 #1e293b'
  };

  const mainContentStyle = {
    marginLeft: sidebarCollapsed ? '60px' : '240px',
    backgroundColor: '#1e293b',
    minHeight: '100vh',
    color: 'white',
    transition: 'margin-left 0.3s ease',
    width: `calc(100vw - ${sidebarCollapsed ? '60px' : '240px'})`
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

  const logoIconStyle = {
    width: '32px',
    height: '32px',
    backgroundColor: '#0ea5e9',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
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
      gap: sidebarCollapsed ? '0' : '12px',
      padding: sidebarCollapsed ? '12px' : '12px 24px',
      cursor: 'pointer',
      backgroundColor: item.active ? '#1e40af' : 'transparent',
      borderRight: item.active ? '3px solid #3b82f6' : 'none',
      transition: 'all 0.2s ease',
      justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
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
        title={sidebarCollapsed ? item.label : ''}
      >
        <span style={{ fontSize: '16px' }}>{item.icon}</span>
        {!sidebarCollapsed && (
          <span style={{ fontSize: '14px', fontWeight: item.active ? '600' : '400' }}>
            {item.label}
          </span>
        )}
      </div>
    );
  };

  return (
    <FileContext.Provider value={fileContextValue}>
      <style>{customScrollbarStyles}</style>
      <div style={{ display: 'flex', backgroundColor: '#1e293b', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={sidebarStyle} className="custom-scrollbar">
        {/* Logo */}
        <div style={logoStyle}>
          <div style={logoIconStyle}>
            <span>FS</span>
          </div>
          {!sidebarCollapsed && (
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>ForenSight</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>AI-Driven UFDR Analysis</div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#334155',
              border: 'none',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>

        {/* Menu */}
        <div style={{ padding: '20px 0' }}>
          {menuSections.map((section, sectionIndex) => (
            <div key={sectionIndex} style={{ marginBottom: sidebarCollapsed ? '12px' : '24px' }}>
              {!sidebarCollapsed && (
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#64748b',
                  padding: '0 24px 8px',
                  letterSpacing: '0.05em'
                }}>
                  {section.title}
                </div>
              )}
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
            <span style={{ fontSize: '18px', fontWeight: '600' }}>ForenSight</span>
            <span style={{ color: '#64748b' }}>AI-Driven UFDR Analysis Platform</span>
          </div>
        </div>

        {/* Main Content Based on Current View */}
        {currentView === 'dashboard' && (
          <div style={{ padding: '24px' }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '600px'
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                backgroundColor: '#334155',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px',
                fontSize: '48px'
              }}>
                �
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
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
        {currentView === 'query' && (
          <QueryInterface />
        )}

        {currentView === 'evidence' && (
          <EvidenceViewer />
        )}

        {currentView === 'network' && (
          <NetworkAnalysis />
        )}

        {/* Placeholder views for other menu items */}
        {currentView === 'cases' && (
          <CaseManagement />
        )}

        {currentView === 'upload' && (
          <UploadUFDR />
        )}

        {currentView === 'reports' && (
          <Reports />
        )}

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