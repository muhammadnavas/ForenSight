import { createContext, useContext, useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const savedUser = localStorage.getItem('forensight_user');
        const savedToken = localStorage.getItem('forensight_token');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          // Since we have real API authentication now, trust the saved session
          // In a production app, you'd validate the token with the server
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('forensight_user');
        localStorage.removeItem('forensight_token');
      } finally {
        setLoading(false);
      }
    };

    // Check session on mount
    checkExistingSession();
  }, []);

  // Load users from API
  const loadUsers = async () => {
    try {
      setError('');
      
      const response = await fetch(API_ENDPOINTS.users, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is HTML (likely a 404 page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('API endpoint not found - received HTML instead of JSON');
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch users`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.users)) {
        setUsers(data.users);
        return data.users;
      } else {
        throw new Error(data.error || 'Invalid users data received');
      }
    } catch (error) {
      console.warn('Failed to load users from API:', error.message);
      
      // For development/demo purposes, don't set error state if API is not available
      // This allows the app to still work without a backend
      if (error.message.includes('fetch')) {
        console.warn('Backend API not available - using empty user list');
        setUsers([]);
        setError('');
      } else {
        setError('Failed to load users. Please check your connection.');
      }
      
      return [];
    }
  };

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  const login = async (credentials) => {
    setError('');
    
    try {
      const response = await fetch(API_ENDPOINTS.authenticate, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.email, // API expects username, but we can send email
          password: credentials.password
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Authentication failed`);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.user) {
        throw new Error(data.error || 'Invalid response from server');
      }
      
      const { user: authenticatedUser } = data;
      
      // Create session token
      const sessionToken = `token_${authenticatedUser._id}_${Date.now()}`;
      
      // Save to localStorage
      localStorage.setItem('forensight_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('forensight_token', sessionToken);
      
      setUser(authenticatedUser);
      
      // Refresh users list after login
      await loadUsers();
      
      return { success: true, user: authenticatedUser };
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    setError('');
    
    try {
      const response = await fetch(API_ENDPOINTS.users, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: userData.name,
          username: userData.username || userData.name.toLowerCase().replace(/\s+/g, '_'),
          email: userData.email,
          password: userData.password,
          role: userData.role,
          badgeNumber: userData.badgeNumber,
          department: userData.department,
          profileImage: userData.avatar || null
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Registration failed`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }
      
      // Refresh users list after registration
      await loadUsers();
      
      return { success: true, message: 'Account created successfully! You can now sign in.' };
    } catch (error) {
      const errorMessage = error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
    localStorage.removeItem('forensight_user');
    localStorage.removeItem('forensight_token');
  };

  const updateUser = async (userId, updates) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, ...updates } : u
      );
      
      setUsers(updatedUsers);
      
      // If updating current user, update the state
      if (user && user.id === userId) {
        const updatedCurrentUser = { ...user, ...updates };
        setUser(updatedCurrentUser);
        localStorage.setItem('forensight_user', JSON.stringify(updatedCurrentUser));
      }
      
      return { success: true };
    } catch (error) {
      throw new Error('Failed to update user');
    }
  };

  const createUser = async (userData) => {
    try {
      // Check if email already exists
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        avatar: null,
        status: 'active',
        lastLogin: null,
        createdAt: new Date().toISOString(),
        permissions: getDefaultPermissions(userData.role)
      };
      
      setUsers(prevUsers => [...prevUsers, newUser]);
      return { success: true, user: newUser };
    } catch (error) {
      throw new Error(error.message || 'Failed to create user');
    }
  };

  const deleteUser = async (userId) => {
    try {
      if (user && user.id === userId) {
        throw new Error('Cannot delete your own account');
      }
      
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      return { success: true };
    } catch (error) {
      throw new Error(error.message || 'Failed to delete user');
    }
  };

  const getDefaultPermissions = (role) => {
    const permissionMap = {
      'investigator': ['view_cases', 'create_cases', 'analyze_evidence', 'view_reports'],
      'analyst': ['view_cases', 'analyze_evidence', 'create_reports'],
      'supervisor': ['view_cases', 'create_cases', 'analyze_evidence', 'view_reports', 'manage_team', 'approve_cases'],
      'admin': ['*'] // All permissions
    };
    
    return permissionMap[role] || ['view_cases'];
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  const isAdmin = () => {
    return user && (user.role === 'admin' || user.permissions?.includes('*'));
  };

  const isSupervisor = () => {
    return user && (user.role === 'supervisor' || user.role === 'admin');
  };

  // Get user statistics
  const getUserStats = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'active').length;
    const roles = users.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {});
    
    const recentLogins = users.filter(u => {
      if (!u.lastLogin) return false;
      const loginDate = new Date(u.lastLogin);
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return loginDate > dayAgo;
    }).length;

    return {
      totalUsers,
      activeUsers,
      roles,
      recentLogins
    };
  };

  const value = {
    // State
    user,
    users: users.map(({ password, ...userWithoutPassword }) => userWithoutPassword), // Never expose passwords
    loading,
    error,
    
    // Actions
    login,
    register,
    logout,
    updateUser,
    createUser,
    deleteUser,
    loadUsers,
    
    // Utilities
    hasPermission,
    isAdmin,
    isSupervisor,
    getUserStats,
    
    // Clear error
    clearError: () => setError('')
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;