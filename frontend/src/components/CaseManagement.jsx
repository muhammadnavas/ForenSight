import { useState } from 'react';

const CaseManagement = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCase, setNewCase] = useState({
    name: '',
    investigator: '',
    priority: 'medium',
    description: ''
  });

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

  const [cases, setCases] = useState({
    active: [],
    completed: [],
    archived: []
  });

  // TODO: Load cases from API
  // useEffect(() => {
  //   const loadCases = async () => {
  //     try {
  //       const response = await fetch('/api/cases');
  //       const casesData = await response.json();
  //       setCases(casesData);
  //     } catch (error) {
  //       console.error('Failed to load cases:', error);
  //     }
  //   };
  //   loadCases();
  // }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc2626';
      case 'medium': return '#f59e0b';
      case 'low': return '#059669';
      default: return '#64748b';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#059669';
      case 'COMPLETED': return '#0ea5e9';
      case 'ARCHIVED': return '#64748b';
      default: return '#64748b';
    }
  };

  const handleCreateCase = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/cases', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newCase)
      // });
      // const createdCase = await response.json();
      // setCases(prev => ({
      //   ...prev,
      //   active: [createdCase, ...prev.active]
      // }));
      
      console.log('Creating case:', newCase);
      setShowCreateModal(false);
      setNewCase({ name: '', investigator: '', priority: 'medium', description: '' });
    } catch (error) {
      console.error('Failed to create case:', error);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={titleStyle}>
              📁 Case Management
            </h1>
            <p style={subtitleStyle}>
              Manage and organize your forensic investigation cases with comprehensive tracking and collaboration tools.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#0ea5e9',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ New Case
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '1px solid #334155'
      }}>
        {[
          { key: 'active', label: 'Active Cases', count: cases.active.length },
          { key: 'completed', label: 'Completed', count: cases.completed.length },
          { key: 'archived', label: 'Archived', count: cases.archived.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? '#1e40af' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#64748b',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
            <span style={{
              backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#475569',
              color: activeTab === tab.key ? 'white' : '#94a3b8',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cases Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
        gap: '24px'
      }}>
        {cases[activeTab].map((caseItem) => (
          <div
            key={caseItem.id}
            style={{
              backgroundColor: '#334155',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #475569',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Case Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                    Case {caseItem.id}
                  </h3>
                  <span style={{
                    backgroundColor: getPriorityColor(caseItem.priority),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {caseItem.priority}
                  </span>
                </div>
                <p style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  margin: '0 0 4px 0',
                  color: '#e2e8f0' 
                }}>
                  {caseItem.name}
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#64748b', 
                  margin: 0 
                }}>
                  Lead: {caseItem.investigator}
                </p>
              </div>
              <span style={{
                backgroundColor: getStatusColor(caseItem.status),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600'
              }}>
                {caseItem.status}
              </span>
            </div>

            {/* Case Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#1e293b',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {caseItem.evidenceCount}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Evidence Files
                </div>
              </div>
              <div style={{
                backgroundColor: '#1e293b',
                padding: '12px',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                  {caseItem.progress}%
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Complete
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {caseItem.status === 'ACTIVE' && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: '#1e293b',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${caseItem.progress}%`,
                    height: '100%',
                    backgroundColor: '#059669',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            )}

            {/* Case Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <span>Created: {caseItem.created}</span>
              <span>Last: {caseItem.lastActivity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Case Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#334155',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
              ➕ Create New Case
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Case Name
                </label>
                <input
                  type="text"
                  value={newCase.name}
                  onChange={(e) => setNewCase({...newCase, name: e.target.value})}
                  placeholder="Enter case name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
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
                  value={newCase.investigator}
                  onChange={(e) => setNewCase({...newCase, investigator: e.target.value})}
                  placeholder="Enter investigator name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Priority Level
                </label>
                <select
                  value={newCase.priority}
                  onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                  style={{
                    width: '100%',
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Case Description
                </label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                  placeholder="Enter case description..."
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '12px',
                    color: 'white',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              marginTop: '24px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #475569',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCase}
                disabled={!newCase.name || !newCase.investigator}
                style={{
                  backgroundColor: !newCase.name || !newCase.investigator ? '#64748b' : '#059669',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: !newCase.name || !newCase.investigator ? 'not-allowed' : 'pointer'
                }}
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;