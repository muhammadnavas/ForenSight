import { useState } from 'react';

const EvidenceSummary = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const summaryStyle = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: '240px', // Account for sidebar width
    backgroundColor: '#0f172a',
    borderTop: '1px solid #334155',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    height: isExpanded ? '300px' : '60px',
    transition: 'height 0.3s ease'
  };

  const rightSectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  };

  const evidenceTitleStyle = {
    color: 'white',
    fontSize: '16px',
    fontWeight: '600'
  };

  const controlButtonStyle = {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px'
  };

  return (
    <div style={summaryStyle}>
      {!isExpanded ? (
        // Collapsed view - Evidence Summary Bar
        <div style={rightSectionStyle}>
          <span style={evidenceTitleStyle}>Evidence Summary</span>
          <button 
            style={controlButtonStyle}
            onClick={() => setIsExpanded(true)}
            title="Expand Evidence Summary"
          >
            🔍
          </button>
          <button style={controlButtonStyle} title="Timeline View">
            📊
          </button>
          <button style={controlButtonStyle} title="Settings">
            ⚙️
          </button>
          <button style={controlButtonStyle} title="Fullscreen">
            ⛶
          </button>
        </div>
      ) : (
        // Expanded view - Evidence details
        <div style={{ width: '100%', height: '100%', padding: '20px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'white', fontSize: '18px', fontWeight: '600' }}>
              Evidence Summary & Analysis
            </h3>
            <button 
              style={controlButtonStyle}
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px', height: 'calc(100% - 60px)' }}>
            {/* Evidence Timeline */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Evidence Timeline
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { time: '0:00', event: 'Case opened', type: 'system' },
                  { time: '0:15', event: 'UFDR data uploaded', type: 'upload' },
                  { time: '0:31', event: 'Processing initiated', type: 'process' },
                  { time: '1:45', event: 'AI analysis started', type: 'ai' },
                  { time: '2:30', event: 'Entities extracted', type: 'analysis' }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px',
                    backgroundColor: item.time === currentTime ? '#1e40af' : 'transparent',
                    borderRadius: '4px'
                  }}>
                    <span style={{ color: '#64748b', fontSize: '12px', minWidth: '30px' }}>
                      {item.time}
                    </span>
                    <span style={{ color: 'white', fontSize: '12px' }}>
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Findings */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Key Findings
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { icon: '📱', text: '156 mobile communications', priority: 'high' },
                  { icon: '💰', text: '3 crypto wallet addresses', priority: 'critical' },
                  { icon: '🌍', text: '12 international contacts', priority: 'medium' },
                  { icon: '📸', text: '45 multimedia files', priority: 'low' },
                  { icon: '📍', text: '8 location markers', priority: 'medium' }
                ].map((finding, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px'
                  }}>
                    <span style={{ fontSize: '14px' }}>{finding.icon}</span>
                    <span style={{ color: 'white', fontSize: '12px', flex: 1 }}>
                      {finding.text}
                    </span>
                    <span style={{
                      backgroundColor: finding.priority === 'critical' ? '#ef4444' : 
                                    finding.priority === 'high' ? '#f59e0b' :
                                    finding.priority === 'medium' ? '#10b981' : '#6b7280',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '8px',
                      fontSize: '10px'
                    }}>
                      {finding.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Analysis Progress */}
            <div style={{
              backgroundColor: '#1e293b',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Analysis Progress
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { task: 'Data Extraction', progress: 100, status: 'Complete' },
                  { task: 'Entity Recognition', progress: 85, status: 'Processing' },
                  { task: 'Relationship Mapping', progress: 60, status: 'In Progress' },
                  { task: 'Timeline Analysis', progress: 30, status: 'Queued' },
                  { task: 'Report Generation', progress: 0, status: 'Pending' }
                ].map((task, index) => (
                  <div key={index}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ color: 'white', fontSize: '12px' }}>{task.task}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{task.progress}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '4px',
                      backgroundColor: '#334155',
                      borderRadius: '2px'
                    }}>
                      <div style={{
                        width: `${task.progress}%`,
                        height: '100%',
                        backgroundColor: task.progress === 100 ? '#10b981' : 
                                        task.progress > 0 ? '#3b82f6' : '#6b7280',
                        borderRadius: '2px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvidenceSummary;