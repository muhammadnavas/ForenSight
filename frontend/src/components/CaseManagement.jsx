import { useEffect, useState } from 'react';
import { useCaseContext } from '../contexts/CaseContext';

const CaseManagement = () => {
  const { 
    cases, 
    loading, 
    error, 
    createCase,
    updateCase,
    deleteCase,
    loadCases,
    setSelectedCase,
    selectedCase,
    getActiveCases, 
    getCompletedCases, 
    getArchivedCases,
    clearError 
  } = useCaseContext();
  
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [newCase, setNewCase] = useState({
    name: '',
    investigator: '',
    priority: 'medium',
    description: ''
  });

  // Auto-refresh cases every 30 seconds for dynamic updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadCases();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadCases]);

  const containerStyle = {
    padding: '24px',
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    width: '100%',
    color: '#1e293b'
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

  // Filter cases based on search term and priority
  const filterCases = (casesList) => {
    return casesList.filter(caseItem => {
      const matchesSearch = searchTerm === '' || 
        caseItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.caseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.investigator?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = filterPriority === 'all' || caseItem.priority === filterPriority;
      
      return matchesSearch && matchesPriority;
    });
  };

  // Organize cases by status with filtering
  const organizedCases = {
    active: filterCases(getActiveCases()),
    completed: filterCases(getCompletedCases()),
    archived: filterCases(getArchivedCases())
  };

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
      const createdCase = await createCase(newCase);
      setShowCreateModal(false);
      setNewCase({ name: '', investigator: '', priority: 'medium', description: '' });
      // Automatically select the newly created case
      setSelectedCase(createdCase);
    } catch (error) {
      console.error('Failed to create case:', error);
      // Error is already handled in the context
    }
  };

  const handleEditCase = async () => {
    try {
      await updateCase(editingCase._id || editingCase.caseId, editingCase);
      setShowEditModal(false);
      setEditingCase(null);
    } catch (error) {
      console.error('Failed to update case:', error);
    }
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      try {
        await deleteCase(caseId);
      } catch (error) {
        console.error('Failed to delete case:', error);
      }
    }
  };

  const handleStatusChange = async (caseId, newStatus) => {
    try {
      await updateCase(caseId, { status: newStatus });
    } catch (error) {
      console.error('Failed to update case status:', error);
    }
  };

  const handleSelectCase = (caseItem) => {
    setSelectedCase(caseItem);
  };

  const openEditModal = (caseItem) => {
    setEditingCase({ ...caseItem });
    setShowEditModal(true);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={titleStyle}>
              Case Management
            </h1>
            <p style={subtitleStyle}>
              Manage and organize your forensic investigation cases with comprehensive tracking and collaboration tools.
            </p>
            {error && (
              <div style={{
                backgroundColor: '#dc2626',
                color: '#1e293b',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
                <button
                  onClick={clearError}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#1e293b',
                    border: 'none',
                    float: 'right',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#64748b' : '#0ea5e9',
              color: '#1e293b',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            + New Case
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search cases by name, ID, or investigator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              color: '#1e293b',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '12px',
            color: '#1e293b',
            fontSize: '14px',
            minWidth: '150px'
          }}
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <button
          onClick={() => loadCases()}
          disabled={loading}
          style={{
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '32px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {[
          { key: 'active', label: 'Active Cases', count: organizedCases.active.length },
          { key: 'completed', label: 'Completed', count: organizedCases.completed.length },
          { key: 'archived', label: 'Archived', count: organizedCases.archived.length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              backgroundColor: activeTab === tab.key ? '#0ea5e9' : 'transparent',
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
              backgroundColor: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              color: activeTab === tab.key ? 'white' : '#64748b',
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
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          fontSize: '16px',
          color: '#64748b'
        }}>
          Loading cases...
        </div>
      ) : organizedCases[activeTab].length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#64748b',
          fontSize: '16px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <p>No {activeTab} cases found</p>
          <p style={{ fontSize: '14px', marginTop: '8px' }}>
            {activeTab === 'active' ? 'Create your first case to get started!' : `No ${activeTab} cases yet.`}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '24px'
        }}>
          {organizedCases[activeTab].map((caseItem) => (
            <div
              key={caseItem._id || caseItem.caseId}
              style={{
                backgroundColor: selectedCase?._id === caseItem._id || selectedCase?.caseId === caseItem.caseId ? '#e0f2fe' : '#f8fafc',
                borderRadius: '16px',
                padding: '24px',
                border: selectedCase?._id === caseItem._id || selectedCase?.caseId === caseItem.caseId ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={() => handleSelectCase(caseItem)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -3px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Action Buttons */}
              <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px',
                opacity: 0.7,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditModal(caseItem);
                  }}
                  style={{
                    backgroundColor: '#0ea5e9',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Edit Case"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCase(caseItem._id || caseItem.caseId);
                  }}
                  style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete Case"
                >
                  🗑️
                </button>
              </div>

              {/* Case Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
                paddingRight: '80px' // Make room for action buttons
              }}>
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      {caseItem.caseId}
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
                    color: '#1e293b' 
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
                <select
                  value={caseItem.status}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleStatusChange(caseItem._id || caseItem.caseId, e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: getStatusColor(caseItem.status),
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    cursor: 'pointer'
                  }}
                >
                  <option value="active">ACTIVE</option>
                  <option value="completed">COMPLETED</option>
                  <option value="archived">ARCHIVED</option>
                </select>
              </div>

              {/* Case Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {caseItem.files?.length || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Evidence Files
                  </div>
                </div>
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {Math.round(((caseItem.files?.length || 0) / Math.max(1, (caseItem.files?.length || 1))) * 100)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Progress
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {caseItem.status === 'active' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#ffffff',
                    borderRadius: '3px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${Math.round(((caseItem.files?.length || 0) / Math.max(1, (caseItem.files?.length || 1))) * 100)}%`,
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
                <span>Created: {new Date(caseItem.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(caseItem.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

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
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
              ➕ Create New Case
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Case Name
                </label>
                <input
                  type="text"
                  value={newCase.name}
                  onChange={(e) => setNewCase({...newCase, name: e.target.value})}
                  placeholder="Enter case name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Lead Investigator
                </label>
                <input
                  type="text"
                  value={newCase.investigator}
                  onChange={(e) => setNewCase({...newCase, investigator: e.target.value})}
                  placeholder="Enter investigator name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Priority Level
                </label>
                <select
                  value={newCase.priority}
                  onChange={(e) => setNewCase({...newCase, priority: e.target.value})}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Case Description
                </label>
                <textarea
                  value={newCase.description}
                  onChange={(e) => setNewCase({...newCase, description: e.target.value})}
                  placeholder="Enter case description..."
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
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
                  border: '1px solid #e2e8f0',
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

      {/* Edit Case Modal */}
      {showEditModal && editingCase && (
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
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw',
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#1e293b' }}>
              ✏️ Edit Case
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Case Name
                </label>
                <input
                  type="text"
                  value={editingCase.name || ''}
                  onChange={(e) => setEditingCase({...editingCase, name: e.target.value})}
                  placeholder="Enter case name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Lead Investigator
                </label>
                <input
                  type="text"
                  value={editingCase.investigator || ''}
                  onChange={(e) => setEditingCase({...editingCase, investigator: e.target.value})}
                  placeholder="Enter investigator name..."
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Priority Level
                </label>
                <select
                  value={editingCase.priority || 'medium'}
                  onChange={(e) => setEditingCase({...editingCase, priority: e.target.value})}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Case Status
                </label>
                <select
                  value={editingCase.status || 'active'}
                  onChange={(e) => setEditingCase({...editingCase, status: e.target.value})}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1e293b' }}>
                  Case Description
                </label>
                <textarea
                  value={editingCase.description || ''}
                  onChange={(e) => setEditingCase({...editingCase, description: e.target.value})}
                  placeholder="Enter case description..."
                  rows={3}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#1e293b',
                    fontSize: '14px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
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
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCase(null);
                }}
                style={{
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleEditCase}
                disabled={!editingCase.name || !editingCase.investigator}
                style={{
                  backgroundColor: !editingCase.name || !editingCase.investigator ? '#64748b' : '#0ea5e9',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: !editingCase.name || !editingCase.investigator ? 'not-allowed' : 'pointer'
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
