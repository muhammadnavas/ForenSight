import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const UserManagement = () => {
  const { users, user: currentUser, updateUser, createUser, deleteUser, getUserStats, isAdmin } = useAuth();
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user is logged in first
  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔐</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
          Authentication Required
        </h2>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '400px' }}>
          Please log in to access user management features.
        </p>
      </div>
    );
  }

  // Check if current user has admin permissions
  if (!isAdmin()) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        flexDirection: 'column',
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
          Access Denied
        </h2>
        <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '400px' }}>
          User management requires administrator privileges. Contact your system administrator.
        </p>
      </div>
    );
  }

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.badgeNumber?.includes(searchTerm)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    setError('');

    try {
      await deleteUser(userToDelete.id);
      setSuccess(`User ${userToDelete.firstName} ${userToDelete.lastName} has been deleted successfully.`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stats = getUserStats();

  const getRoleColor = (role) => {
    const colors = {
      'admin': '#dc2626',
      'supervisor': '#f59e0b',
      'investigator': '#0ea5e9',
      'analyst': '#059669'
    };
    return colors[role] || '#64748b';
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#059669' : '#dc2626';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
              👥 User Management
            </h1>
            <p style={{ fontSize: '16px', color: '#64748b', margin: 0 }}>
              Manage user accounts, roles, and permissions for ForenSight
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
          >
            ➕ Add User
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div style={{
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#15803d',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✅</span>
            {success}
          </div>
        )}
        
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            {error}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0ea5e9', marginBottom: '4px' }}>
            {stats.totalUsers}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Total Users
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669', marginBottom: '4px' }}>
            {stats.activeUsers}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Active Users
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed', marginBottom: '4px' }}>
            {stats.recentLogins}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Recent Logins (24h)
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '4px' }}>
            {Object.keys(stats.roles).length}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
            Different Roles
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Search Users
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, department, badge..."
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Filter by Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator</option>
              <option value="supervisor">Supervisor</option>
              <option value="investigator">Investigator</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '14px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
            style={{
              padding: '12px 20px',
              fontSize: '14px',
              backgroundColor: '#64748b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#475569'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#64748b'}
          >
            🔄 Clear Filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: 0
          }}>
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  User
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Role & Department
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Contact
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Status
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Last Login
                </th>
                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id}
                  style={{
                    borderBottom: index < filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: getRoleColor(user.role),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600'
                      }}>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                          {user.firstName} {user.lastName}
                          {user.id === currentUser?.id && (
                            <span style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              backgroundColor: '#0ea5e9',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '10px'
                            }}>
                              You
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <div>
                      <span style={{
                        backgroundColor: getRoleColor(user.role),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        marginBottom: '4px',
                        display: 'inline-block'
                      }}>
                        {user.role}
                      </span>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>
                        {user.department}
                      </div>
                      {user.badgeNumber && (
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Badge: {user.badgeNumber}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {user.phone || 'No phone'}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{
                      backgroundColor: getStatusColor(user.status),
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}>
                      {user.status}
                    </span>
                  </td>
                  
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      {formatDate(user.lastLogin)}
                    </div>
                  </td>
                  
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEditUser(user)}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          backgroundColor: '#0ea5e9',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0284c7'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#0ea5e9'}
                      >
                        ✏️ Edit
                      </button>
                      
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#b91c1c'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#dc2626'}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              color: '#64748b'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>No users found</p>
              <p style={{ fontSize: '14px' }}>
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                Delete User Account
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>? 
                This action cannot be undone and will permanently remove all user data.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setUserToDelete(null);
                }}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  backgroundColor: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  backgroundColor: loading ? '#fca5a5' : '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit User Modals would go here - simplified for this example */}
      {/* In a full implementation, you'd have UserCreateModal and UserEditModal components */}
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;