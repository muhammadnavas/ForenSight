import { createContext, useContext, useEffect, useState } from 'react';

import { useCaseContext } from '../contexts/CaseContext';
import { CaseDataProvider, useCaseData } from '../contexts/CaseDataContext';
import AIInvestigation from './AIInvestigation';
import CaseManagement from './CaseManagement';
import DatabaseSearch from './DatabaseSearch';
import EvidenceViewer from './EvidenceViewer';
import NetworkAnalysis from './NetworkAnalysis';
import QueryInterface from './QueryInterface';
import Reports from './Reports';
import UploadUFDR from './UploadUFDR';
import UserManagement from './UserManagement';

// Global File Context for sharing uploaded files across components
const FileContext = createContext();

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
};

// Helper function for file size formatting
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getFileTypeIcon = (filename) => {
  if (!filename) return '📄';
  const ext = filename.toLowerCase().split('.').pop();
  const icons = {
    'db': '🗄️', 'sqlite': '🗄️', 'sql': '🗄️',
    'pcap': '🌐', 'pcapng': '🌐', 'cap': '🌐',
    'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
    'txt': '📝', 'log': '📋', 'json': '📊', 'xml': '📊',
    'zip': '📦', 'rar': '📦', '7z': '📦'
  };
  return icons[ext] || '📄';
};

// Shared Curved Arrow Component
const CurvedArrowSVG = ({ className }) => (
  <img
    src="/curved-arrow.png"
    alt="Curved Arrow"
    width="50"
    height="50"
    className={className}
    style={{
      filter: 'hue-rotate(200deg) brightness(1.4) saturate(1.3) contrast(1.2)',
      transition: 'all 0.3s ease',
      dropShadow: '0 2px 8px rgba(14, 165, 233, 0.4)'
    }}
  />
);

// Helper function to parse case data
const parseCaseData = (selectedCase) => {
  if (!selectedCase) return null;
  
  let parsedCaseData = selectedCase;
  if (typeof selectedCase.caseData === 'string') {
    try {
      parsedCaseData = { ...selectedCase, ...JSON.parse(selectedCase.caseData) };
    } catch (e) {
      console.log('Case data is not JSON, using as is');
    }
  }
  return parsedCaseData;
};

// No Case Selected Component
const NoCaseSelectedState = ({ featureName, description, requiresCase = true, requiresFiles = false, setCurrentView, cases }) => {
  const noCasesAvailable = !cases || cases.length === 0;

  const containerStyle = {
    padding: '24px',
    width: '100%',
    height: 'calc(100vh - 140px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box'
  };

  return (
    <div style={containerStyle}>
      <div style={{
        textAlign: 'center',
        padding: '60px 40px',
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        border: '1px solid #e2e8f0',
        maxWidth: '600px',
        width: '100%',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
        position: 'relative'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>
          {noCasesAvailable ? '📝' : '🗂️'}
        </div>
        
        <h3 style={{ fontSize: '28px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
          {noCasesAvailable ? 'No Cases Available' : `${featureName} Requires Case Selection`}
        </h3>
        
        <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '32px', lineHeight: '1.6' }}>
          {noCasesAvailable 
            ? `Create your first case to access ${featureName.toLowerCase()} features`
            : `${description || `Select a case to access ${featureName.toLowerCase()} functionality`}`
          }
        </p>

        {noCasesAvailable ? (
          // Show create case button when no cases exist
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '16px 32px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
              }}
              onClick={() => setCurrentView('cases')}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#047857';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 12px -1px rgba(5, 150, 105, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px -1px rgba(5, 150, 105, 0.3)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
              Create New Case
            </button>
          </div>
        ) : (
          // Show pointer to case selector when cases exist but none selected
          <div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
              <button
                style={{
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 6px -1px rgba(14, 165, 233, 0.3)'
                }}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0284c7';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 12px -1px rgba(14, 165, 233, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#0ea5e9';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(14, 165, 233, 0.3)';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                Select Case Above
              </button>
            </div>

            {/* Curved Arrow Pointing to Case Selector */}
            <div style={{
              position: 'fixed',
              top: '120px',
              right: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1000,
              transform: 'rotate(16deg)'
            }}>
              {/* Curved Animated Arrow */}
              <div style={{
                color: '#0ea5e9',
                animation: 'curvedArrowBounce 2s infinite',
                marginBottom: '8px',
                transform: 'scale(1.2)'
              }}>
                <CurvedArrowSVG className="curved-arrow-icon" />
              </div>
              
              {/* Label */}
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// File Selector Component
const FileSelector = () => {
  const { 
    selectedCase, 
    caseFiles, 
    selectedFiles, 
    loadCaseFiles,
    toggleFileSelection, 
    clearFileSelection 
  } = useCaseContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCase) {
      loadFiles();
    }
  }, [selectedCase]);

  const loadFiles = async () => {
    if (!selectedCase) return;
    
    try {
      setLoading(true);
      await loadCaseFiles(selectedCase._id || selectedCase.caseId);
    } catch (error) {
      console.error('Failed to load case files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedCase) return null;

  return (
    <div style={{
      position: 'relative',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      minWidth: '200px',
      maxWidth: '300px'
    }}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: 'transparent',
          border: 'none',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          width: '100%',
          borderRadius: '8px'
        }}
      >
        <span>{isExpanded ? '📂' : '📁'}</span>
        <span>Files ({selectedFiles.length > 0 ? '1' : '0'}/{caseFiles.length})</span>
        {selectedFiles.length > 0 && (
          <span style={{ 
            fontSize: '10px', 
            backgroundColor: '#059669', 
            color: 'white', 
            padding: '2px 6px', 
            borderRadius: '10px',
            marginLeft: '8px'
          }}>
            ✓ Selected
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '12px' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </button>
      
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderTop: '1px solid #cbd5e1',
          borderRadius: '0 0 8px 8px',
          maxHeight: '300px',
          overflowY: 'auto',
          zIndex: 1002,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            padding: '8px 12px',
            borderBottom: '1px solid #cbd5e1',
            display: 'flex',
            gap: '8px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              Select one file for analysis:
            </div>
            <button
              onClick={clearFileSelection}
              disabled={selectedFiles.length === 0}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                backgroundcolor: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                opacity: selectedFiles.length === 0 ? 0.5 : 1
              }}
            >
              Deselect
            </button>
          </div>
          
          {loading ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
              Loading files...
            </div>
          ) : caseFiles.length === 0 ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
              No files in this case
              <div style={{ fontSize: '12px', marginTop: '8px', color: '#64748b' }}>
                Upload files to this case to enable selection
              </div>
            </div>
          ) : (
            <div style={{ padding: '8px' }}>
              {caseFiles.map((file, index) => {
                const fileId = file.fileId || file._id || file.id;
                const fileName = file.originalName || file.filename || file.name || 'Unknown file';
                const fileSize = file.size || file.sizeBytes || 0;
                
                if (!fileId) {
                  console.warn('🚨 File missing ID:', file);
                  return null;
                }
                
                return (
                <div
                  key={fileId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    backgroundColor: selectedFiles.includes(fileId) ? '#e0f2fe' : 'transparent'
                  }}
                  onClick={() => toggleFileSelection(fileId)}
                >
                  <input
                    type="radio"
                    name="selectedFile"
                    checked={selectedFiles.includes(fileId)}
                    onChange={() => toggleFileSelection(fileId)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#1e293b',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1
                  }}>
                    {fileName}
                  </span>
                  <span style={{ 
                    fontSize: '10px', 
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getFileTypeIcon(fileName)}
                    {formatFileSize(fileSize)}
                  </span>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Case Selector Component
const CaseSelector = () => {
  const { cases, loading, selectedCase, setSelectedCase, loadCases } = useCaseContext();

  useEffect(() => {
    loadCases();
  }, []);

  // Auto-refresh cases every 30 seconds to stay synced
  useEffect(() => {
    const interval = setInterval(() => {
      loadCases();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadCases]);

  const handleCaseSelect = (caseId) => {
    const selected = cases.find(c => c._id === caseId || c.caseId === caseId);
    setSelectedCase(selected);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
        <span style={{
          fontSize: '14px',
          color: '#475569',
          fontWeight: '500'
        }}>
          Active Case:
        </span>
        
        <select
          value={selectedCase?._id || selectedCase?.caseId || ''}
          onChange={(e) => handleCaseSelect(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            color: '#1e293b',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            minWidth: '200px',
            outline: 'none'
          }}
        >
          <option value="">Select a case...</option>
          {cases.map((caseItem) => (
            <option 
              key={caseItem._id || caseItem.caseId} 
              value={caseItem._id || caseItem.caseId}
            >
              {caseItem.name} {caseItem.status && `(${caseItem.status})`}
            </option>
          ))}
        </select>
      </div>
    );
};

// Case Details Component
const CaseDetailsSection = ({ selectedCase, caseFiles }) => {
  if (!selectedCase) return null;

  const parsedCaseData = parseCaseData(selectedCase);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': '#059669',
      'COMPLETED': '#0ea5e9',
      'ARCHIVED': '#64748b',
      'PENDING': '#f59e0b',
      'CLOSED': '#94a3b8'
    };
    return colors[status?.toUpperCase()] || '#64748b';
  };

  const getRiskColor = (risk) => {
    const colors = {
      'EXTREME': '#dc2626',
      'HIGH': '#f59e0b',
      'MEDIUM': '#059669',
      'LOW': '#64748b'
    };
    return colors[risk?.toUpperCase()] || '#64748b';
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      marginBottom: '24px',
      overflow: 'hidden'
    }}>
      {/* Case Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: 'white', 
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              📂 {parsedCaseData.name || parsedCaseData.caseName || 'Unnamed Case'}
              <span style={{
                backgroundColor: getStatusColor(parsedCaseData.status),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {parsedCaseData.status || 'UNKNOWN'}
              </span>
            </h2>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontSize: '16px',
              lineHeight: '1.5',
              maxWidth: '80%'
            }}>
              {parsedCaseData.description || 'No description available'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              backgroundColor: getRiskColor(parsedCaseData.riskAssessment?.overallRisk || parsedCaseData.priority),
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              🚨 {parsedCaseData.riskAssessment?.overallRisk || parsedCaseData.priority || 'UNKNOWN'} RISK
            </div>
            <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
              Case ID: {parsedCaseData.caseId || parsedCaseData._id || 'N/A'}
            </div>
          </div>
        </div>

        {/* Case Metadata */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '16px'
        }}>
          <div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              INVESTIGATOR
            </div>
            <div style={{ color: 'white', fontSize: '14px' }}>
              {parsedCaseData.investigator || 'Not assigned'}
            </div>
          </div>
          <div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              DEPARTMENT
            </div>
            <div style={{ color: 'white', fontSize: '14px' }}>
              {parsedCaseData.department || 'Not specified'}
            </div>
          </div>
          <div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              CREATED
            </div>
            <div style={{ color: 'white', fontSize: '14px' }}>
              {formatDate(parsedCaseData.createdDate || parsedCaseData.createdAt)}
            </div>
          </div>
          <div>
            <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>
              LAST MODIFIED
            </div>
            <div style={{ color: 'white', fontSize: '14px' }}>
              {formatDate(parsedCaseData.lastModified || parsedCaseData.updatedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Case Statistics Grid */}
      <div style={{ padding: '24px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
              {parsedCaseData.suspects?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              SUSPECTS
            </div>
          </div>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
              {parsedCaseData.victims?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              VICTIMS
            </div>
          </div>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>
              {parsedCaseData.evidence?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              EVIDENCE
            </div>
          </div>
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
              {caseFiles?.length || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
              FILES
            </div>
          </div>
        </div>

        {/* Financial Impact */}
        {parsedCaseData.financialFlows && (
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '16px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Financial Impact
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>TOTAL LOSS</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                  ${parsedCaseData.victims?.reduce((sum, victim) => sum + (victim.financialLoss || 0), 0).toLocaleString() || '0'}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>CRYPTO WALLETS</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                  {parsedCaseData.financialFlows?.cryptoWallets?.length || 0}
                </div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>BANK ACCOUNTS</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>
                  {parsedCaseData.financialFlows?.bankAccounts?.length || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent = ({ setCurrentView, processUploadedFile }) => {
  const { uploadedFiles, processedFiles, fileAnalytics } = useFiles();
  const { caseData, statistics, loading, hasData, isDemo } = useCaseData();
  const { selectedCase, caseFiles, cases } = useCaseContext();

  // Check if no cases are available or no case selected
  if (!selectedCase) {
    return (
      <NoCaseSelectedState 
        featureName="Dashboard" 
        description="Select a case to view comprehensive forensic details, analytics, and investigation tools"
        setCurrentView={setCurrentView} 
        cases={cases} 
      />
    );
  }

  return (
    <div style={{ padding: '24px', width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box', position: 'relative' }} className="standard-scrollbar">
      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'left' }}>
                📊 ForenSight Dashboard
              </h1>
              {selectedCase && (
                <div style={{ fontSize: '16px', color: '#64748b' }}>
                  Viewing case: <span style={{ color: '#0ea5e9', fontWeight: '600' }}>
                    {selectedCase.name || selectedCase.caseName || 'Selected Case'}
                  </span>
                </div>
              )}
            </div>
            
            {/* User Welcome Section */}
            {user && (
              <div style={{
                backgroundColor: '#ffffff',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                  Welcome to
                </div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '2px' }}>
                  ForenSight Platform
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <span style={{
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    marginRight: '8px'
                  }}>
                    SYSTEM
                  </span>
                  Digital Forensics
                </div>
              </div>
            )}
          </div>
        </div>

        {!selectedCase && !hasData && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.7 }}>📁</div>
            <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#1e293b' }}>No Case Data Available</h3>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              Upload UFDR files or case data to begin your forensic investigation
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
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginRight: '12px'
              }}
              onClick={() => setCurrentView('upload')}
            >
              📤 Upload Files
            </button>
            <button 
              style={{
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={async () => {
                try {
                  const response = await fetch('/sample-case-data.json');
                  const data = await response.json();
                  await processUploadedFile({ text: async () => JSON.stringify(data) });
                } catch (error) {
                  console.error('Error loading sample data:', error);
                  alert('Failed to load sample data: ' + error.message);
                }
              }}
            >
              📋 Load Sample Data
            </button>
          </div>
        )}
        </div>

        {/* Case Details Section */}
        {selectedCase && <CaseDetailsSection selectedCase={selectedCase} caseFiles={caseFiles} />}

        {/* Files Overview Section */}
        {selectedCase && caseFiles && caseFiles.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📁 Case Files ({caseFiles.length})
              </h3>
              <p style={{ 
                color: '#64748b', 
                fontSize: '14px',
                margin: 0 
              }}>
                All files associated with this case
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {caseFiles.map((file, index) => {
                  const fileName = file.originalName || file.filename || file.name || 'Unknown file';
                  const fileSize = file.size || file.sizeBytes || 0;
                  const uploadDate = file.uploadedAt || file.createdAt || file.timestamp;
                  const fileExtension = fileName.toLowerCase().split('.').pop();
                  
                  return (
                    <div key={file.fileId || file._id || index} style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '20px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#0ea5e9';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          flexShrink: 0
                        }}>
                          {getFileTypeIcon(fileName)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#1e293b',
                            marginBottom: '4px',
                            wordBreak: 'break-word',
                            lineHeight: '1.4'
                          }}>
                            {fileName}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            marginBottom: '8px'
                          }}>
                            {fileExtension.toUpperCase()} • {formatFileSize(fileSize)}
                          </div>
                          {uploadDate && (
                            <div style={{
                              fontSize: '11px',
                              color: '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              📅 {new Date(uploadDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File Status and Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{
                          backgroundColor: file.status === 'processed' ? '#059669' :
                                           file.status === 'analyzed' ? '#7c3aed' :
                                           file.status === 'failed' ? '#dc2626' : '#0ea5e9',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          {file.status || 'available'}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            color: '#1e293b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f1f5f9';
                            e.target.style.borderColor = '#0ea5e9';
                            e.target.style.color = '#0ea5e9';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.color = '#1e293b';
                          }}>
                            👁️ View
                          </button>
                          <button style={{
                            backgroundColor: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            padding: '6px 12px',
                            fontSize: '11px',
                            color: '#1e293b',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#f1f5f9';
                            e.target.style.borderColor = '#0ea5e9';
                            e.target.style.color = '#0ea5e9';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#e2e8f0';
                            e.target.style.color = '#1e293b';
                          }}>
                            🔍 Analyze
                          </button>
                        </div>
                      </div>

                      {/* File Type Specific Info */}
                      {fileExtension === 'db' || fileExtension === 'sqlite' && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                            DATABASE FILE
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Ready for SQL analysis and data extraction
                          </div>
                        </div>
                      )}

                      {(fileExtension === 'pcap' || fileExtension === 'pcapng') && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                            NETWORK CAPTURE
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            Network traffic analysis available
                          </div>
                        </div>
                      )}

                      {fileExtension === 'json' && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          backgroundColor: '#f1f5f9',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1'
                        }}>
                          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                            STRUCTURED DATA
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            JSON data ready for parsing and analysis
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* File Statistics */}
              <div style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: '#f8fafc',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
                  📊 File Statistics
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>TOTAL FILES</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>
                      {caseFiles.length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>TOTAL SIZE</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                      {formatFileSize(caseFiles.reduce((sum, file) => sum + (file.size || file.sizeBytes || 0), 0))}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>PROCESSED</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
                      {caseFiles.filter(f => f.status === 'processed' || f.status === 'analyzed').length}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px', fontWeight: '600' }}>FILE TYPES</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#f59e0b' }}>
                      {new Set(caseFiles.map(f => (f.originalName || f.filename || '').toLowerCase().split('.').pop())).size}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Case Participants Section */}
        {selectedCase && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* Suspects Section */}
            {selectedCase.suspects && selectedCase.suspects.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#dc2626'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🚨 Suspects ({selectedCase.suspects.length})
                  </h3>
                </div>
                <div style={{ padding: '20px' }}>
                  {selectedCase.suspects.slice(0, 3).map((suspect, index) => (
                    <div key={suspect.id || index} style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: index < selectedCase.suspects.slice(0, 3).length - 1 ? '12px' : '0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                            {suspect.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Age: {suspect.age} • {suspect.nationality}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: suspect.riskLevel === 'EXTREME' ? '#dc2626' :
                                           suspect.riskLevel === 'HIGH' ? '#f59e0b' :
                                           suspect.riskLevel === 'MEDIUM' ? '#059669' : '#64748b',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {suspect.riskLevel || 'UNKNOWN'}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>ROLE</div>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {suspect.role || 'Not specified'}
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>LOCATION</div>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {suspect.coordinates ? `${suspect.coordinates.city}, ${suspect.coordinates.country}` : 'Unknown'}
                        </div>
                      </div>

                      {suspect.alias && suspect.alias.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>ALIASES</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {suspect.alias.slice(0, 3).map((alias, i) => (
                              <span key={i} style={{
                                backgroundColor: '#ffffff',
                                color: '#1e293b',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px'
                              }}>
                                {alias}
                              </span>
                            ))}
                            {suspect.alias.length > 3 && (
                              <span style={{
                                color: '#64748b',
                                fontSize: '11px',
                                padding: '2px 4px'
                              }}>
                                +{suspect.alias.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button style={{
                          backgroundColor: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}>
                          👁️ View Details
                        </button>
                        <button style={{
                          backgroundColor: 'transparent',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}>
                          📍 Track
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedCase.suspects.length > 3 && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        +{selectedCase.suspects.length - 3} more suspects
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Victims Section */}
            {selectedCase.victims && selectedCase.victims.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#f59e0b'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    👥 Victims ({selectedCase.victims.length})
                  </h3>
                </div>
                <div style={{ padding: '20px' }}>
                  {selectedCase.victims.slice(0, 3).map((victim, index) => (
                    <div key={victim.id || index} style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: index < selectedCase.victims.slice(0, 3).length - 1 ? '12px' : '0'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                            {victim.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            Age: {victim.age} • {victim.occupation}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          ${victim.financialLoss?.toLocaleString() || '0'}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>LOCATION</div>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {victim.location || (victim.coordinates ? `${victim.coordinates.city}, ${victim.coordinates.country}` : 'Unknown')}
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>INCIDENT DATE</div>
                        <div style={{ fontSize: '14px', color: '#1e293b' }}>
                          {victim.incidentDate ? new Date(victim.incidentDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'Unknown'}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                        <button style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}>
                          📞 Contact
                        </button>
                        <button style={{
                          backgroundColor: 'transparent',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}>
                          📋 Details
                        </button>
                      </div>
                    </div>
                  ))}
                  {selectedCase.victims.length > 3 && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '12px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        +{selectedCase.victims.length - 3} more victims
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Section */}
            {selectedCase.evidence && selectedCase.evidence.length > 0 && (
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                gridColumn: selectedCase.suspects?.length > 0 && selectedCase.victims?.length > 0 ? 'span 2' : 'auto'
              }}>
                <div style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  backgroundColor: '#0ea5e9'
                }}>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: 'white',
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    🔍 Evidence ({selectedCase.evidence.length})
                  </h3>
                </div>
                <div style={{ padding: '20px' }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '16px'
                  }}>
                    {selectedCase.evidence.slice(0, 4).map((evidence, index) => (
                      <div key={evidence.id || index} style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '16px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <div style={{
                              backgroundColor: evidence.type === 'DIGITAL' ? '#7c3aed' :
                                               evidence.type === 'FINANCIAL' ? '#059669' :
                                               evidence.type === 'PHYSICAL' ? '#f59e0b' : '#64748b',
                              color: 'white',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              fontSize: '10px',
                              fontWeight: '600',
                              marginBottom: '8px',
                              display: 'inline-block'
                            }}>
                              {evidence.type || 'UNKNOWN'}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                              {evidence.category}
                            </div>
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.4' }}>
                            {evidence.description}
                          </div>
                        </div>

                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>SEIZED</div>
                          <div style={{ fontSize: '12px', color: '#1e293b' }}>
                            {evidence.dateSeized ? new Date(evidence.dateSeized).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'Unknown'}
                          </div>
                        </div>

                        {evidence.findings && evidence.findings.length > 0 && (
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>KEY FINDINGS</div>
                            <div style={{ fontSize: '11px', color: '#1e293b' }}>
                              • {evidence.findings[0]}
                              {evidence.findings.length > 1 && (
                                <span style={{ color: '#64748b' }}> (+{evidence.findings.length - 1} more)</span>
                              )}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                          <button style={{
                            backgroundColor: '#7c3aed',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}>
                            🔬 Analyze
                          </button>
                          <button style={{
                            backgroundColor: 'transparent',
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}>
                            📋 Chain
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {selectedCase.evidence.length > 4 && (
                    <div style={{
                      textAlign: 'center',
                      marginTop: '16px',
                      padding: '12px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}>
                      <span style={{ color: '#64748b', fontSize: '12px' }}>
                        +{selectedCase.evidence.length - 4} more evidence items
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Case Timeline Section */}
        {selectedCase && selectedCase.timeline && selectedCase.timeline.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: 'white',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                ⏰ Case Timeline ({selectedCase.timeline.length} Events)
              </h3>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '14px',
                margin: '8px 0 0 0' 
              }}>
                Chronological sequence of case events and milestones
              </p>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ position: 'relative' }}>
                {/* Timeline Line */}
                <div style={{
                  position: 'absolute',
                  left: '24px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  backgroundColor: '#475569'
                }} />

                {/* Timeline Events */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedCase.timeline.slice(0, 8).map((event, index) => {
                    const eventTypeColors = {
                      'criminal_activity': '#dc2626',
                      'investigation': '#0ea5e9',
                      'law_enforcement': '#059669',
                      'technical': '#7c3aed',
                      'crime': '#f59e0b',
                      'legal': '#64748b'
                    };

                    const eventTypeIcons = {
                      'criminal_activity': '🚨',
                      'investigation': '🔍',
                      'law_enforcement': '👮',
                      'technical': '⚙️',
                      'crime': '⚠️',
                      'legal': '⚖️'
                    };

                    const eventColor = eventTypeColors[event.type] || '#64748b';
                    const eventIcon = eventTypeIcons[event.type] || '📅';

                    return (
                      <div key={index} style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '20px',
                        position: 'relative'
                      }}>
                        {/* Timeline Dot */}
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: eventColor,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '18px',
                          flexShrink: 0,
                          border: '4px solid #e2e8f0',
                          zIndex: 1
                        }}>
                          {eventIcon}
                        </div>

                        {/* Event Content */}
                        <div style={{
                          flex: 1,
                          backgroundColor: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          padding: '20px',
                          marginTop: '4px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                            <div>
                              <div style={{
                                backgroundColor: eventColor,
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '600',
                                marginBottom: '8px',
                                display: 'inline-block'
                              }}>
                                {event.type?.replace('_', ' ').toUpperCase() || 'EVENT'}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                {event.event}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {new Date(event.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <div style={{
                              backgroundColor: event.significance === 'extreme' ? '#dc2626' :
                                               event.significance === 'high' ? '#f59e0b' :
                                               event.significance === 'medium' ? '#059669' : '#64748b',
                              color: 'white',
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: '600'
                            }}>
                              {event.significance?.toUpperCase() || 'NORMAL'}
                            </div>
                          </div>

                          {event.location && (
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>📍 </span>
                              <span style={{ fontSize: '12px', color: '#1e293b' }}>
                                {event.location}
                              </span>
                            </div>
                          )}

                          {event.participants && event.participants.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>👥 </span>
                              <span style={{ fontSize: '12px', color: '#1e293b' }}>
                                {event.participants.join(', ')}
                              </span>
                            </div>
                          )}

                          {event.financialImpact && (
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', color: '#64748b' }}>💰 </span>
                              <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
                                ${event.financialImpact.toLocaleString()} loss
                              </span>
                            </div>
                          )}

                          {/* Progress indicator for ongoing events */}
                          {event.type === 'investigation' && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                                Investigation Progress
                              </div>
                              <div style={{
                                width: '100%',
                                height: '4px',
                                backgroundColor: '#ffffff',
                                borderRadius: '2px',
                                overflow: 'hidden'
                              }}>
                                <div style={{
                                  width: '75%',
                                  height: '100%',
                                  backgroundColor: '#0ea5e9',
                                  borderRadius: '2px'
                                }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedCase.timeline.length > 8 && (
                  <div style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '14px' }}>
                      +{selectedCase.timeline.length - 8} more timeline events
                    </span>
                    <div style={{ marginTop: '8px' }}>
                      <button style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}>
                        View Full Timeline
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Investigation Notes Section */}
        {selectedCase && selectedCase.investigationNotes && selectedCase.investigationNotes.length > 0 && (
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#7c3aed'
            }}>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: 'white',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                📝 Investigation Notes ({selectedCase.investigationNotes.length})
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '16px'
              }}>
                {selectedCase.investigationNotes.slice(0, 3).map((note, index) => (
                  <div key={note.id || index} style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <div style={{
                          backgroundColor: note.priority === 'HIGH' ? '#dc2626' :
                                           note.priority === 'MEDIUM' ? '#f59e0b' : '#059669',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '10px',
                          fontWeight: '600',
                          marginBottom: '4px',
                          display: 'inline-block'
                        }}>
                          {note.priority} PRIORITY
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {note.category} • {note.author}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.5' }}>
                        {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                      {new Date(note.timestamp).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {selectedCase.investigationNotes.length > 3 && (
                <div style={{
                  textAlign: 'center',
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>
                    +{selectedCase.investigationNotes.length - 3} more notes
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Show case selection prompt if no case is selected */}
        {!selectedCase && !hasData && (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.7 }}>📂</div>
            <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#1e293b', fontWeight: '700' }}>
              Select a Case to Begin
            </h3>
            <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '24px', lineHeight: '1.6' }}>
              Choose a case from the selector above to view comprehensive details, files, suspects, evidence, and investigation timeline
            </p>
            <div style={{ fontSize: '14px', color: '#64748b' }}>
              Or create a new case and upload UFDR files to start your investigation
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {selectedCase && (
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
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
        )}

        {/* System Status and Recent Activity */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* System Status */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
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
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Recent Files
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }} className="standard-scrollbar">
              {uploadedFiles.slice(-4).length > 0 ? (
                uploadedFiles.slice(-4).map((file) => (
                  <div key={file.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
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
  );
};



const DashboardInner = ({ onNavigateToHome }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { processUploadedFile } = useCaseData();
  const { cases, selectedCase } = useCaseContext();

  
  // Standard scrollbar styles
  const scrollbarStyles = `
    /* Global smooth scrolling and prevent horizontal overflow */
    html {
      scroll-behavior: smooth;
      overflow-x: hidden;
    }
    
    body {
      overflow-x: hidden;
      box-sizing: border-box;
    }
    
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    /* Standard scrollbar for webkit browsers (Chrome, Safari, Edge) */
    .standard-scrollbar::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .standard-scrollbar::-webkit-scrollbar-track {
      background: #f8fafc;
      border-radius: 4px;
      margin: 2px;
    }
    
    .standard-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
      border-radius: 4px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    
    .standard-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
      transform: scale(1.1);
    }
    
    .standard-scrollbar::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    .standard-scrollbar::-webkit-scrollbar-corner {
      background: #f8fafc;
    }
    
    /* Standard scrollbar for Firefox */
    .standard-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f8fafc;
    }
    
    /* Sidebar specific scrollbar */
    .sidebar-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
      margin: 1px;
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #cbd5e1 0%, #94a3b8 100%);
      border-radius: 3px;
      transition: all 0.2s ease;
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #94a3b8 0%, #64748b 100%);
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    .sidebar-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #cbd5e1 #f1f5f9;
    }
    
    /* Content scrollbar for cards and lists */
    .content-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .content-scrollbar::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 3px;
    }
    
    .content-scrollbar::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 3px;
      transition: background 0.2s ease;
    }
    
    .content-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    
    .content-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 #f1f5f9;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .dashboard-sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }
      
      .dashboard-sidebar.open {
        transform: translateX(0);
      }
      
      .dashboard-main-content {
        margin-left: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
      }
      
      .dashboard-header {
        padding: 0 16px !important;
      }
    }
    
    @media (max-width: 480px) {
      .dashboard-header {
        padding: 0 12px !important;
      }
      
      .dashboard-header h1 {
        font-size: 16px !important;
      }
    }
    
    /* Animation for the arrow indicator */
    @keyframes pulse {
      0% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(1.05);
      }
      100% {
        opacity: 1;
        transform: scale(1);
      }
    }
    
    /* Curved arrow bounce animation */
    @keyframes curvedArrowBounce {
      0%, 20%, 50%, 80%, 100% {
        transform: scale(1.2) translateY(0px);
      }
      40% {
        transform: scale(1.3) translateY(-6px);
      }
      60% {
        transform: scale(1.2) translateY(-3px);
      }
    }
    
    /* Arrow glow effect */
    @keyframes arrowGlow {
      0% {
        filter: drop-shadow(0 2px 4px rgba(14, 165, 233, 0.3));
      }
      50% {
        filter: drop-shadow(0 4px 12px rgba(14, 165, 233, 0.6)) drop-shadow(0 0 20px rgba(14, 165, 233, 0.4));
      }
      100% {
        filter: drop-shadow(0 2px 4px rgba(14, 165, 233, 0.3));
      }
    }
    
    /* Curved arrow icon styling */
    .curved-arrow-icon {
      transition: all 0.3s ease;
    }
    
    .curved-arrow-icon:hover {
      transform: scale(1.1);
    }
  `;
  
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
  const addFiles = async (files) => {
    console.log('Adding files:', files);
    setUploadedFiles(prev => [...prev, ...files]);
    updateAnalytics(files);
    
    // Process uploaded files for case data
    for (const fileMetadata of files) {
      const originalFile = fileMetadata.originalFile;
      console.log('Processing file:', fileMetadata.name, 'Original file:', originalFile);
      if (originalFile && (fileMetadata.name.toLowerCase().includes('case') || fileMetadata.name.toLowerCase().includes('.json'))) {
        try {
          console.log('Processing case data file:', fileMetadata.name);
          await processUploadedFile(originalFile);
          updateFileStatus(fileMetadata.id, 'processed', { 
            message: 'Case data loaded successfully',
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('Failed to process file:', error);
          updateFileStatus(fileMetadata.id, 'failed', { 
            error: error.message,
            timestamp: new Date().toISOString()
          });
        }
      }
    }
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
  
  const unifiedHeaderStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    zIndex: 1001,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(8px)'
  };

  const sidebarStyle = {
    width: '240px',
    backgroundColor: '#f8fafc',
    color: '#1e293b',
    height: 'calc(100vh - 70px)',
    position: 'fixed',
    left: 0,
    top: '70px',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 1000,
    borderRight: '1px solid #e2e8f0'
  };

  const mainContentStyle = {
    marginLeft: '240px',
    marginTop: '70px',
    backgroundColor: '#ffffff',
    minHeight: 'calc(100vh - 70px)',
    color: '#1e293b',
    width: 'calc(100vw - 240px)',
    overflowY: 'auto',
    overflowX: 'hidden',
    maxWidth: 'calc(100vw - 240px)',
    boxSizing: 'border-box',
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
        { icon: '🔍', label: 'Database Search', view: 'search', active: currentView === 'search' },
        { icon: '🎬', label: 'Media Analysis', view: 'media-analysis', active: currentView === 'media-analysis' }
      ]
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { icon: '👥', label: 'User Management', view: 'users', active: currentView === 'users' },
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
      backgroundColor: item.active ? '#e0f2fe' : 'transparent',
      borderRight: item.active ? '3px solid #0ea5e9' : 'none',
      transition: 'all 0.2s ease',
      justifyContent: 'flex-start',
      position: 'relative',
      color: item.active ? '#0284c7' : '#475569'
    };

    return (
      <div
        key={index}
        style={itemStyle}
        onClick={() => item.view && setCurrentView(item.view)}
        onMouseEnter={(e) => {
          if (!item.active) {
            e.target.style.backgroundColor = '#f1f5f9';
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
      <style>{scrollbarStyles}</style>
      <div style={{ 
        backgroundColor: '#ffffff', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header with Case Selector */}
        <div style={unifiedHeaderStyle} className="dashboard-header">
          <div 
            style={{
              fontSize: '28px', 
              fontWeight: '700',
              color: '#1e293b',
              cursor: onNavigateToHome ? 'pointer' : 'default',
              flex: '0 0 auto'
            }}
            onClick={onNavigateToHome}
            title={onNavigateToHome ? 'Click to return to home page' : ''}
          >
            Insightic
          </div>
          
          {/* Case and File Selector */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '16px',
            flex: '1 1 auto',
            justifyContent: 'flex-end',
            maxWidth: '700px'
          }}>
            <CaseSelector />
            <FileSelector />
          </div>
        </div>

        {/* Sidebar */}
        <div style={sidebarStyle} className="sidebar-scrollbar dashboard-sidebar">
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
        <div style={mainContentStyle} className="standard-scrollbar dashboard-main-content">
          {/* Main Content Based on Current View */}
          {currentView === 'dashboard' && <DashboardContent setCurrentView={setCurrentView} processUploadedFile={processUploadedFile} />}

          {/* Other Views */}
          {currentView === 'query' && (
            selectedCase ? <QueryInterface /> : 
            <NoCaseSelectedState 
              featureName="Query Interface" 
              description="Select a case to analyze data and run forensic queries on case files and evidence."
              setCurrentView={setCurrentView}
              cases={cases}
            />
          )}
          
          {currentView === 'evidence' && (
            selectedCase ? <EvidenceViewer /> :
            <NoCaseSelectedState 
              featureName="Evidence Viewer" 
              description="Select a case to view and analyze digital evidence, files, and forensic artifacts."
              setCurrentView={setCurrentView}
              cases={cases}
            />
          )}
          

          
          {currentView === 'network' && (
            selectedCase ? <NetworkAnalysis /> :
            <NoCaseSelectedState 
              featureName="Network Analysis" 
              description="Select a case to perform network traffic analysis, connection mapping, and communication pattern detection."
              setCurrentView={setCurrentView}
              cases={cases}
            />
          )}
          
          {currentView === 'cases' && <CaseManagement />}
          {currentView === 'upload' && <UploadUFDR setCurrentView={setCurrentView} />}
          
          {currentView === 'reports' && (
            selectedCase ? <Reports /> :
            <NoCaseSelectedState 
              featureName="Reports" 
              description="Select a case to generate comprehensive forensic reports, timelines, and investigation summaries."
              setCurrentView={setCurrentView}
              cases={cases}
            />
          )}

          {currentView === 'analytics' && (
            selectedCase ? (
            <div style={{ padding: '24px', width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }} className="standard-scrollbar">
              <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    📈 Analytics Dashboard
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '16px' }}>
                    Comprehensive forensic data analysis and insights for your investigations
                  </p>
                </div>

                {/* Analytics Cards Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>
                  {/* File Analysis Card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0ea5e9' }}>📊</span>
                      File Analysis
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Total Files Processed</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>{uploadedFiles.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Success Rate</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                          {uploadedFiles.length > 0 ? Math.round((uploadedFiles.filter(f => f.status === 'completed' || f.status === 'processed').length / uploadedFiles.length) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Failed Files</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                          {uploadedFiles.filter(f => f.status === 'failed').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Types Card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#059669' }}>�️</span>
                      Evidence Types
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { type: 'Database Files', count: uploadedFiles.filter(f => f.fileType === 'database').length, color: '#0ea5e9' },
                        { type: 'Archive Files', count: uploadedFiles.filter(f => f.fileType === 'archive').length, color: '#7c3aed' },
                        { type: 'Text Logs', count: uploadedFiles.filter(f => f.fileType === 'text').length, color: '#059669' },
                        { type: 'Data Files', count: uploadedFiles.filter(f => f.fileType === 'data').length, color: '#f59e0b' }
                      ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: '#1e293b' }}>{item.type}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '60px',
                              height: '6px',
                              backgroundColor: '#f8fafc',
                              borderRadius: '3px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${uploadedFiles.length > 0 ? (item.count / uploadedFiles.length) * 100 : 0}%`,
                                height: '100%',
                                backgroundColor: item.color,
                                transition: 'width 0.3s ease'
                              }} />
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.color, minWidth: '20px' }}>
                              {item.count}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Processing Timeline Card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#7c3aed' }}>⏱️</span>
                      Processing Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Uploading</span>
                        <span style={{ 
                          backgroundColor: '#0ea5e9', 
                          color: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {uploadedFiles.filter(f => f.status === 'uploading').length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Completed</span>
                        <span style={{ 
                          backgroundColor: '#059669', 
                          color: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {uploadedFiles.filter(f => f.status === 'completed').length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Processed</span>
                        <span style={{ 
                          backgroundColor: '#7c3aed', 
                          color: 'white', 
                          padding: '4px 12px', 
                          borderRadius: '12px', 
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {uploadedFiles.filter(f => f.status === 'processed').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analytics Section */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>
                  {/* Investigation Progress */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#f59e0b' }}>🎯</span>
                      Investigation Progress
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {[
                        { task: 'Data Collection', progress: uploadedFiles.length > 0 ? 85 : 0, color: '#0ea5e9' },
                        { task: 'Analysis Processing', progress: processedFiles.length > 0 ? 65 : 0, color: '#059669' },
                        { task: 'Evidence Review', progress: uploadedFiles.filter(f => f.status === 'processed').length > 0 ? 45 : 0, color: '#7c3aed' },
                        { task: 'Report Generation', progress: 25, color: '#f59e0b' }
                      ].map((item, index) => (
                        <div key={index}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#1e293b' }}>{item.task}</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.color }}>{item.progress}%</span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: '#f8fafc',
                            borderRadius: '4px',
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              width: `${item.progress}%`,
                              height: '100%',
                              backgroundColor: item.color,
                              borderRadius: '4px',
                              transition: 'width 0.5s ease'
                            }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Performance */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0d9488' }}>⚡</span>
                      System Performance
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Processing Speed</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>Optimal</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Memory Usage</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>67%</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Network Status</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#0ea5e9', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#0ea5e9', fontWeight: '600' }}>Connected</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1e293b' }}>Database Status</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  maxWidth: '100%',
                  boxSizing: 'border-box'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: '#dc2626' }}>📈</span>
                    Recent Analytics Activity
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }} className="content-scrollbar">
                    {uploadedFiles.length > 0 ? (
                      uploadedFiles.slice(-5).map((file, index) => (
                        <div key={file.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '16px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: file.status === 'processed' ? '#7c3aed' : file.status === 'completed' ? '#059669' : '#0ea5e9',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px'
                            }}>
                              {file.fileType === 'database' ? '🗄️' : file.fileType === 'archive' ? '📦' : file.fileType === 'text' ? '📄' : '📁'}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b', marginBottom: '4px' }}>
                                {file.name.length > 30 ? file.name.substring(0, 30) + '...' : file.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {file.fileType || 'unknown'} • {Math.round(file.size / 1024)} KB
                              </div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              backgroundColor: 
                                file.status === 'completed' ? '#059669' :
                                file.status === 'processed' ? '#7c3aed' :
                                file.status === 'failed' ? '#dc2626' : '#0ea5e9',
                              color: 'white',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              marginBottom: '4px'
                            }}>
                              {file.status || 'uploading'}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px 20px',
                        color: '#64748b'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                        <p style={{ fontSize: '16px', marginBottom: '8px' }}>No Analytics Data Available</p>
                        <p style={{ fontSize: '14px' }}>Upload evidence files to view detailed analytics and insights</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            ) : (
            <NoCaseSelectedState 
              featureName="Analytics Dashboard" 
              description="Select a case to view comprehensive forensic data analysis, file statistics, and investigation insights."
              setCurrentView={setCurrentView}
              cases={cases}
            />
            )
          )}

          {currentView === 'ai' && <AIInvestigation />}

          {currentView === 'search' && (
            selectedCase ? <DatabaseSearch /> :
            <NoCaseSelectedState 
              featureName="Database Search" 
              description="Select a case to search through database files, query structured data, and analyze forensic databases."
              setCurrentView={setCurrentView}
              cases={cases}
            />
          )}

          {currentView === 'media-analysis' && (
            selectedCase ? (
            <div style={{ padding: '24px', width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }} className="standard-scrollbar">
              <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                {/* Header */}
                <div style={{ marginBottom: '32px' }}>
                  <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    🎬 Media Analysis Dashboard
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '16px' }}>
                    Advanced video and image forensic analysis tools for digital evidence processing
                  </p>
                </div>

                {/* Analysis Type Selection */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                  gap: '24px',
                  marginBottom: '32px'
                }}>
                  {/* Video Analysis Card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0ea5e9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(14, 165, 233, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#0ea5e9',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px'
                      }}>
                        🎥
                      </div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                          Video Analysis
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                          Motion detection, frame extraction, metadata analysis
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                        Comprehensive video forensic analysis including timestamp verification, compression artifacts detection, and content authentication.
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {['Motion Detection', 'Frame Analysis', 'Metadata Extraction', 'Timestamp Verification'].map((feature, index) => (
                          <span key={index} style={{
                            backgroundColor: '#f8fafc',
                            color: '#0ea5e9',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: '1px solid #0ea5e9'
                          }}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        flex: 1
                      }}>
                        🎬 Start Video Analysis
                      </button>
                      <button style={{
                        backgroundColor: 'transparent',
                        color: '#0ea5e9',
                        border: '1px solid #0ea5e9',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                        📁 Upload Video
                      </button>
                    </div>
                  </div>

                  {/* Image Analysis Card */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#059669';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(5, 150, 105, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#475569';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                      <div style={{
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#059669',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px'
                      }}>
                        🖼️
                      </div>
                      <div>
                        <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                          Image Analysis
                        </h3>
                        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                          EXIF data, manipulation detection, visual enhancement
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', marginBottom: '16px' }}>
                        Advanced image forensics including metadata analysis, tampering detection, enhancement techniques, and authenticity verification.
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {['EXIF Analysis', 'Tampering Detection', 'Enhancement Tools', 'Comparison Mode'].map((feature, index) => (
                          <span key={index} style={{
                            backgroundColor: '#f8fafc',
                            color: '#059669',
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '500',
                            border: '1px solid #059669'
                          }}>
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        flex: 1
                      }}>
                        🖼️ Start Image Analysis
                      </button>
                      <button style={{
                        backgroundColor: 'transparent',
                        color: '#059669',
                        border: '1px solid #059669',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}>
                        📁 Upload Images
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Media Analysis */}
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '24px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
                  }}>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      color: 'white',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      📊 Recent Media Analysis
                    </h3>
                    <p style={{ 
                      color: 'rgba(255, 255, 255, 0.9)', 
                      fontSize: '14px',
                      margin: '8px 0 0 0' 
                    }}>
                      Latest processed media files and analysis results
                    </p>
                  </div>

                  <div style={{ padding: '24px' }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#64748b'
                    }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.6 }}>🎬</div>
                      <h4 style={{ fontSize: '18px', marginBottom: '8px', color: '#1e293b' }}>No Media Files Analyzed Yet</h4>
                      <p style={{ fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
                        Upload video or image files to begin forensic media analysis
                      </p>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button style={{
                          backgroundColor: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          🎥 Upload Video
                        </button>
                        <button style={{
                          backgroundColor: '#059669',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          🖼️ Upload Images
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Tools Overview */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '24px'
                }}>
                  {/* Video Tools */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0ea5e9' }}>🎥</span>
                      Video Analysis Tools
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { tool: 'Frame Extraction', status: 'Available', color: '#059669' },
                        { tool: 'Motion Detection', status: 'Available', color: '#059669' },
                        { tool: 'Compression Analysis', status: 'Available', color: '#059669' },
                        { tool: 'Timestamp Verification', status: 'Available', color: '#059669' },
                        { tool: 'Audio Forensics', status: 'Coming Soon', color: '#f59e0b' }
                      ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: '#1e293b' }}>{item.tool}</span>
                          <span style={{
                            backgroundColor: item.color,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Image Tools */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#059669' }}>🖼️</span>
                      Image Analysis Tools
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { tool: 'EXIF Data Extraction', status: 'Available', color: '#059669' },
                        { tool: 'Tampering Detection', status: 'Available', color: '#059669' },
                        { tool: 'Noise Analysis', status: 'Available', color: '#059669' },
                        { tool: 'Similarity Matching', status: 'Available', color: '#059669' },
                        { tool: 'Face Recognition', status: 'Beta', color: '#7c3aed' }
                      ].map((item, index) => (
                        <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '14px', color: '#1e293b' }}>{item.tool}</span>
                          <span style={{
                            backgroundColor: item.color,
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Analysis Statistics */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#7c3aed' }}>📊</span>
                      Analysis Statistics
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>0</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Videos Processed</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>0</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Images Analyzed</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>0</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Anomalies Detected</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            ) : (
            <NoCaseSelectedState 
              featureName="Media Analysis" 
              description="Select a case to analyze video and image evidence, extract metadata, detect tampering, and perform forensic media analysis."
              setCurrentView={setCurrentView}
              cases={cases}
            />
            )
          )}

          {currentView === 'users' && (
            <UserManagement />
          )}
        </div>
      </div>
    </FileContext.Provider>
  );
};

const Dashboard = ({ onNavigateToHome }) => {
  return (
    <CaseDataProvider>
      <DashboardInner onNavigateToHome={onNavigateToHome} />
    </CaseDataProvider>
  );
};

export default Dashboard;
