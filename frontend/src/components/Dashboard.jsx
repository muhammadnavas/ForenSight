import { createContext, useContext, useState } from 'react';

import { CaseDataProvider, useCaseData } from '../contexts/CaseDataContext';
import CaseManagement from './CaseManagement';
import DatabaseSearch from './DatabaseSearch';
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

// Dashboard Content Component
const DashboardContent = ({ setCurrentView, processUploadedFile }) => {
  const { uploadedFiles, processedFiles, fileAnalytics } = useFiles();
  const { caseData, statistics, loading, hasData, isDemo } = useCaseData();

  // If no data, show centered empty state
  if (!hasData) {
    return (
      <div style={{ 
        padding: '24px', 
        width: '100%', 
        height: 'calc(100vh - 140px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 40px',
          backgroundColor: '#334155',
          borderRadius: '20px',
          border: '1px solid #475569',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.8 }}>📁</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#e2e8f0', fontWeight: '700' }}>
            No Case Data Available
          </h3>
          <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px', lineHeight: '1.6' }}>
            Upload UFDR files or case data to begin your forensic investigation
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
              onClick={() => setCurrentView('upload')}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#0284c7';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#0ea5e9';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📤 Upload Files
            </button>
            <button 
              style={{
                backgroundColor: '#059669',
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
                boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)'
              }}
              onClick={async () => {
                try {
                  const response = await fetch('/sample-case-data.json');
                  const data = await response.json();
                  await processUploadedFile({ text: async () => JSON.stringify(data) });
                } catch (error) {
                  console.error('Error loading sample data:', error);
                  // Fallback sample data
                  const sampleData = {
                    caseName: "SAMPLE_CASE_001",
                    suspects: 3,
                    victims: 2,
                    evidence: 45,
                    locations: 7,
                    financialImpact: 125000,
                    networkComplexity: 28
                  };
                  processUploadedFile(sampleData);
                }
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#047857';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              📋 Load Sample Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', width: '100%', height: '100%', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }} className="standard-scrollbar">
      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', textAlign: 'left' }}>
              📊 ForenSight Dashboard
            </h1>
            {hasData && !isDemo && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <h2 style={{ fontSize: '18px', color: '#0ea5e9', fontWeight: '600' }}>
                  {caseData.caseName}
                </h2>
                <span style={{
                  backgroundColor: statistics.caseStatus === 'ACTIVE' ? '#059669' : '#64748b',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  {statistics.caseStatus}
                </span>
                <span style={{
                  backgroundColor: 
                    statistics.riskLevel === 'EXTREME' ? '#dc2626' :
                    statistics.riskLevel === 'HIGH' ? '#f59e0b' :
                    statistics.riskLevel === 'MEDIUM' ? '#059669' : '#64748b',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '600'
                }}>
                  RISK: {statistics.riskLevel}
                </span>
              </div>
            )}
          </div>
          {hasData && !isDemo && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9' }}>
                {statistics.completionPercentage}%
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Investigation Complete
              </div>
            </div>
          )}
          {!hasData && (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              backgroundColor: '#334155',
              borderRadius: '12px',
              border: '1px solid #475569',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.7 }}>📁</div>
              <h3 style={{ fontSize: '20px', marginBottom: '8px', color: '#e2e8f0' }}>No Case Data Available</h3>
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
        
        {hasData && (
        <>
        {/* Case Statistics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Suspects */}
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
                backgroundColor: '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                S
              </div>
              <div style={{
                backgroundColor: '#475569',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {statistics.totalSuspects > 0 ? 'IDENTIFIED' : 'NONE'}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              {statistics.totalSuspects}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Suspects
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Identified individuals
            </div>
          </div>

          {/* Victims */}
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
                backgroundColor: '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                V
              </div>
              <div style={{
                backgroundColor: '#475569',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {statistics.totalVictims > 0 ? 'IMPACTED' : 'NONE'}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              {statistics.totalVictims}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Victims
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Affected individuals
            </div>
          </div>

          {/* Evidence */}
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
                backgroundColor: '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                E
              </div>
              <div style={{
                backgroundColor: '#475569',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {statistics.totalEvidence > 0 ? 'AVAILABLE' : 'NONE'}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              {statistics.totalEvidence}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Evidence Items
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Digital & physical evidence
            </div>
          </div>

          {/* Locations */}
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
                backgroundColor: '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                L
              </div>
              <div style={{
                backgroundColor: '#475569',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {statistics.totalLocations > 0 ? 'MAPPED' : 'NONE'}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              {statistics.totalLocations}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Locations
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Geographic points of interest
            </div>
          </div>

          {/* Financial Impact */}
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
                backgroundColor: '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                F
              </div>
              <div style={{
                backgroundColor: '#475569',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {statistics.financialImpact > 0 ? 'LOSSES' : 'NONE'}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              ${statistics.financialImpact ? (statistics.financialImpact / 1000).toFixed(0) + 'K' : '0'}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Financial Impact
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Total estimated losses
            </div>
          </div>

          {/* Network Complexity */}
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
                backgroundColor: '#475569',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white'
              }}>
                N
              </div>
              <div style={{
                backgroundColor: '#475569',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {statistics.networkComplexity > 0 ? 'COMPLEX' : 'SIMPLE'}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: 'white' }}>
              {statistics.networkComplexity}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Network Elements
            </div>
            <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Nodes and connections
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }} className="standard-scrollbar">
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
        </>
        )}
      </div>
    </div>
  );
};

const DashboardInner = ({ onNavigateToHome }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const { processUploadedFile } = useCaseData();
  
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
      background: #1e293b;
      border-radius: 4px;
      margin: 2px;
    }
    
    .standard-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #475569 0%, #334155 100%);
      border-radius: 4px;
      border: 1px solid #334155;
      transition: all 0.2s ease;
    }
    
    .standard-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #64748b 0%, #475569 100%);
      transform: scale(1.1);
    }
    
    .standard-scrollbar::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    .standard-scrollbar::-webkit-scrollbar-corner {
      background: #1e293b;
    }
    
    /* Standard scrollbar for Firefox */
    .standard-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #475569 #1e293b;
    }
    
    /* Sidebar specific scrollbar */
    .sidebar-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-track {
      background: #0f172a;
      border-radius: 3px;
      margin: 1px;
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
      border-radius: 3px;
      transition: all 0.2s ease;
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #475569 0%, #334155 100%);
    }
    
    .sidebar-scrollbar::-webkit-scrollbar-thumb:active {
      background: linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%);
    }
    
    .sidebar-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #334155 #0f172a;
    }
    
    /* Content scrollbar for cards and lists */
    .content-scrollbar::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    
    .content-scrollbar::-webkit-scrollbar-track {
      background: #334155;
      border-radius: 3px;
    }
    
    .content-scrollbar::-webkit-scrollbar-thumb {
      background: #64748b;
      border-radius: 3px;
      transition: background 0.2s ease;
    }
    
    .content-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }
    
    .content-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #64748b #334155;
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
    backgroundColor: '#0f172a',
    borderBottom: '1px solid #334155',
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
    backgroundColor: '#0f172a',
    color: 'white',
    height: 'calc(100vh - 70px)',
    position: 'fixed',
    left: 0,
    top: '70px',
    overflowY: 'auto',
    overflowX: 'hidden',
    zIndex: 1000,
    borderRight: '1px solid #334155'
  };

  const mainContentStyle = {
    marginLeft: '240px',
    marginTop: '70px',
    backgroundColor: '#1e293b',
    minHeight: 'calc(100vh - 70px)',
    color: 'white',
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
      <style>{scrollbarStyles}</style>
      <div style={{ 
        backgroundColor: '#1e293b', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Simple Header */}
        <div style={unifiedHeaderStyle} className="dashboard-header">
          <div 
            style={{
              fontSize: '28px', 
              fontWeight: '700',
              color: '#ffffff',
              cursor: onNavigateToHome ? 'pointer' : 'default'
            }}
            onClick={onNavigateToHome}
            title={onNavigateToHome ? 'Click to return to home page' : ''}
          >
            ForenSight
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
          {currentView === 'query' && <QueryInterface />}
          {currentView === 'evidence' && <EvidenceViewer />}
          {currentView === 'network' && <NetworkAnalysis />}
          {currentView === 'cases' && <CaseManagement />}
          {currentView === 'upload' && <UploadUFDR setCurrentView={setCurrentView} />}
          {currentView === 'reports' && <Reports />}

          {currentView === 'analytics' && (
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
                    backgroundColor: '#334155',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #475569'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0ea5e9' }}>📊</span>
                      File Analysis
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Total Files Processed</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#0ea5e9' }}>{uploadedFiles.length}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Success Rate</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>
                          {uploadedFiles.length > 0 ? Math.round((uploadedFiles.filter(f => f.status === 'completed' || f.status === 'processed').length / uploadedFiles.length) * 100) : 0}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Failed Files</span>
                        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626' }}>
                          {uploadedFiles.filter(f => f.status === 'failed').length}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Types Card */}
                  <div style={{
                    backgroundColor: '#334155',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #475569'
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
                          <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{item.type}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '60px',
                              height: '6px',
                              backgroundColor: '#1e293b',
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
                    backgroundColor: '#334155',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #475569'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#7c3aed' }}>⏱️</span>
                      Processing Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Uploading</span>
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
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Completed</span>
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
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Processed</span>
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
                    backgroundColor: '#334155',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #475569'
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
                            <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{item.task}</span>
                            <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.color }}>{item.progress}%</span>
                          </div>
                          <div style={{
                            width: '100%',
                            height: '8px',
                            backgroundColor: '#1e293b',
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
                    backgroundColor: '#334155',
                    borderRadius: '16px',
                    padding: '24px',
                    border: '1px solid #475569'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#0d9488' }}>⚡</span>
                      System Performance
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Processing Speed</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#059669', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#059669', fontWeight: '600' }}>Optimal</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Memory Usage</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#f59e0b', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#f59e0b', fontWeight: '600' }}>67%</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Network Status</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: '#0ea5e9', borderRadius: '50%' }} />
                          <span style={{ fontSize: '14px', color: '#0ea5e9', fontWeight: '600' }}>Connected</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>Database Status</span>
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
                  backgroundColor: '#334155',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #475569',
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
                          backgroundColor: '#1e293b',
                          borderRadius: '12px',
                          border: '1px solid #475569'
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
                              <div style={{ fontSize: '14px', fontWeight: '500', color: '#e2e8f0', marginBottom: '4px' }}>
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
          )}

          {currentView === 'ai' && (
            <div style={{ 
              padding: '24px', 
              height: 'calc(100vh - 70px)', 
              display: 'flex', 
              flexDirection: 'column',
              boxSizing: 'border-box'
            }}>
              {/* Clean Header */}
              <div style={{ 
                marginBottom: '24px',
                paddingBottom: '16px',
                borderBottom: '1px solid #334155'
              }}>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  marginBottom: '6px',
                  color: '#f1f5f9',
                  letterSpacing: '-0.025em'
                }}>
                  AI Case Assistant
                </h1>
                <p style={{ 
                  color: '#94a3b8', 
                  fontSize: '15px',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Professional AI assistant for forensic investigation support
                </p>
              </div>

              {/* Professional Chat Container */}
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                {/* Professional Chat Header */}
                <div style={{
                  padding: '20px 24px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    backgroundColor: '#0ea5e9',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px'
                  }}>
                    🤖
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      marginBottom: '2px'
                    }}>
                      ForenSight AI
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#10b981',
                        borderRadius: '50%'
                      }}></div>
                      Online and ready to assist
                    </div>
                  </div>
                </div>

                {/* Clean Chat Messages Area */}
                <div style={{
                  flex: 1,
                  padding: '24px',
                  overflowY: 'auto',
                  backgroundColor: '#ffffff'
                }} className="standard-scrollbar">
                  {/* Welcome Message */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#0ea5e9',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      🤖
                    </div>
                    <div style={{
                      backgroundColor: '#f1f5f9',
                      padding: '16px 20px',
                      borderRadius: '16px',
                      borderTopLeftRadius: '6px',
                      maxWidth: '85%',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{ 
                        fontSize: '15px',
                        color: '#1e293b', 
                        lineHeight: '1.6',
                        marginBottom: '12px',
                        fontWeight: '500'
                      }}>
                        Welcome! I'm your AI forensic assistant specialized in digital investigations.
                      </div>
                      <div style={{ 
                        fontSize: '14px',
                        color: '#475569',
                        lineHeight: '1.5'
                      }}>
                        I can assist you with evidence analysis, investigation strategies, forensic procedures, and technical guidance throughout your case.
                      </div>
                    </div>
                  </div>

                  {/* Professional Suggested Questions */}
                  <div style={{ 
                    backgroundColor: '#f8fafc',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#374151', 
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      Common Investigation Questions
                    </div>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                      gap: '8px'
                    }}>
                      {[
                        "What evidence should I prioritize?",
                        "How should I analyze encrypted files?",
                        "What patterns indicate suspicious activity?",
                        "Help me build a case timeline",
                        "Which forensic tools are most effective?"
                      ].map((question, index) => (
                        <button
                          key={index}
                          style={{
                            backgroundColor: '#ffffff',
                            color: '#374151',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '13px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            textAlign: 'left',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#0ea5e9';
                            e.target.style.color = '#ffffff';
                            e.target.style.borderColor = '#0ea5e9';
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow = '0 4px 6px -1px rgba(14, 165, 233, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = '#ffffff';
                            e.target.style.color = '#374151';
                            e.target.style.borderColor = '#d1d5db';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                          }}
                          onClick={() => {
                            console.log('Send question:', question);
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Professional Chat Input */}
                <div style={{
                  padding: '20px 24px',
                  backgroundColor: '#f8fafc',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ flex: 1 }}>
                      <textarea
                        placeholder="Type your forensic question or case inquiry..."
                        style={{
                          width: '100%',
                          minHeight: '44px',
                          maxHeight: '120px',
                          backgroundColor: '#ffffff',
                          border: '1px solid #d1d5db',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          color: '#1e293b',
                          fontSize: '14px',
                          resize: 'none',
                          outline: 'none',
                          fontFamily: 'inherit',
                          boxSizing: 'border-box',
                          lineHeight: '1.5',
                          transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#0ea5e9';
                          e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            console.log('Send message:', e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>
                    <button
                      style={{
                        backgroundColor: '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '12px 20px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        minWidth: '100px',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px -1px rgba(14, 165, 233, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#0284c7';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 6px -1px rgba(14, 165, 233, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#0ea5e9';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px -1px rgba(14, 165, 233, 0.3)';
                      }}
                      onClick={() => {
                        console.log('Send button clicked');
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      Send
                    </button>
                  </div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#64748b', 
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    Press Enter to send • Shift+Enter for new line
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'search' && <DatabaseSearch />}

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

const Dashboard = ({ onNavigateToHome }) => {
  return (
    <CaseDataProvider>
      <DashboardInner onNavigateToHome={onNavigateToHome} />
    </CaseDataProvider>
  );
};

export default Dashboard;
