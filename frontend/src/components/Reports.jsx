import { useState } from 'react';

const Reports = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reportData, setReportData] = useState({
    title: '',
    investigator: 'sai',
    caseId: '115',
    dateRange: { start: '', end: '' },
    includeEvidence: true,
    includeTimeline: true,
    includeAnalysis: true
  });
  const [isGenerating, setIsGenerating] = useState(false);

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

  const templates = [
    {
      id: 'standard',
      name: 'Standard Investigation Report',
      description: 'Comprehensive report with evidence summary, timeline, and analysis',
      icon: '📋',
      color: '#0ea5e9',
      sections: ['Executive Summary', 'Evidence Overview', 'Timeline', 'Key Findings', 'Recommendations']
    },
    {
      id: 'court',
      name: 'Court-Ready Legal Report',
      description: 'Formal report formatted for legal proceedings and court submission',
      icon: '⚖️',
      color: '#059669',
      sections: ['Legal Declaration', 'Chain of Custody', 'Technical Analysis', 'Expert Opinion', 'Appendices']
    },
    {
      id: 'technical',
      name: 'Technical Analysis Report',
      description: 'Detailed technical findings with forensic methodologies and data analysis',
      icon: '🔬',
      color: '#0d9488',
      sections: ['Methodology', 'Technical Findings', 'Data Analysis', 'Tool Validation', 'Raw Data']
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for management and stakeholders',
      icon: '📊',
      color: '#7c3aed',
      sections: ['Overview', 'Key Findings', 'Impact Assessment', 'Recommendations', 'Next Steps']
    }
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      alert('Report generated successfully!');
    }, 3000);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>
          📋 Report Generation
        </h1>
        <p style={subtitleStyle}>
          Generate professional forensic investigation reports with AI-powered analysis and insights. 
          Choose from court-ready templates or create custom reports.
        </p>
      </div>

      {/* Report Templates */}
      <div style={{
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>
          📝 Report Templates
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {templates.map((template) => (
            <div
              key={template.id}
              style={{
                backgroundColor: selectedTemplate?.id === template.id ? '#1e40af' : '#334155',
                border: selectedTemplate?.id === template.id ? '2px solid #3b82f6' : '1px solid #475569',
                borderRadius: '12px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setSelectedTemplate(template)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: template.color,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px'
                }}>
                  {template.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {template.name}
                  </h3>
                </div>
              </div>
              <p style={{ 
                color: '#64748b', 
                fontSize: '14px', 
                marginBottom: '16px',
                lineHeight: '1.4'
              }}>
                {template.description}
              </p>
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', color: '#94a3b8' }}>
                  INCLUDED SECTIONS:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {template.sections.map((section, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: '#1e293b',
                        color: '#94a3b8',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px'
                      }}
                    >
                      {section}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Configuration */}
      {selectedTemplate && (
        <div style={{
          backgroundColor: '#334155',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid #475569'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            ⚙️ Report Configuration
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Report Title
              </label>
              <input
                type="text"
                value={reportData.title}
                onChange={(e) => setReportData({...reportData, title: e.target.value})}
                placeholder="Enter report title..."
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Case ID
              </label>
              <input
                type="text"
                value={reportData.caseId}
                onChange={(e) => setReportData({...reportData, caseId: e.target.value})}
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Lead Investigator
              </label>
              <input
                type="text"
                value={reportData.investigator}
                onChange={(e) => setReportData({...reportData, investigator: e.target.value})}
                style={{
                  width: '100%',
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Date Range
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="date"
                  value={reportData.dateRange.start}
                  onChange={(e) => setReportData({
                    ...reportData,
                    dateRange: {...reportData.dateRange, start: e.target.value}
                  })}
                  style={{
                    flex: 1,
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="date"
                  value={reportData.dateRange.end}
                  onChange={(e) => setReportData({
                    ...reportData,
                    dateRange: {...reportData.dateRange, end: e.target.value}
                  })}
                  style={{
                    flex: 1,
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Report Options */}
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              📋 Include in Report
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {[
                { key: 'includeEvidence', label: 'Evidence Summary', icon: '📁' },
                { key: 'includeTimeline', label: 'Timeline Analysis', icon: '⏰' },
                { key: 'includeAnalysis', label: 'AI Analysis', icon: '🤖' }
              ].map((option) => (
                <label key={option.key} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}>
                  <input
                    type="checkbox"
                    checked={reportData[option.key]}
                    onChange={(e) => setReportData({
                      ...reportData,
                      [option.key]: e.target.checked
                    })}
                    style={{ marginRight: '4px' }}
                  />
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Button */}
      {selectedTemplate && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleGenerateReport}
            disabled={isGenerating || !reportData.title}
            style={{
              backgroundColor: isGenerating ? '#64748b' : '#059669',
              color: 'white',
              border: 'none',
              padding: '16px 32px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isGenerating || !reportData.title ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto'
            }}
          >
            {isGenerating ? '⏳' : '📋'} 
            {isGenerating ? 'Generating Report...' : 'Generate Report'}
          </button>
        </div>
      )}

      {/* Recent Reports */}
      <div style={{
        backgroundColor: '#334155',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '32px',
        border: '1px solid #475569'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
          📚 Recent Reports
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { name: 'Case 115 - Standard Investigation Report', date: '2024-10-03', type: 'Standard', status: 'Ready' },
            { name: 'Digital Evidence Analysis - Court Report', date: '2024-10-02', type: 'Court-Ready', status: 'Ready' },
            { name: 'Technical Forensic Analysis', date: '2024-10-01', type: 'Technical', status: 'Ready' }
          ].map((report, index) => (
            <div key={index} style={{
              backgroundColor: '#1e293b',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    {report.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {report.date} • {report.type}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{
                  backgroundColor: '#059669',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {report.status}
                </span>
                <button style={{
                  backgroundColor: '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  📥 Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;