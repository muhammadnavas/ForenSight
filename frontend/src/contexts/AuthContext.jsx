import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user database - in a real app, this would be handled by your backend
const MOCK_USERS = [
  {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Investigator',
    email: 'investigator@forensight.com',
    password: 'forensic123', // In real app, this would be hashed
    department: 'Digital Forensics Unit',
    role: 'investigator',
    badgeNumber: '12345',
    phone: '+1 (555) 123-4567',
    avatar: null,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-15T10:30:00Z',
    permissions: ['view_cases', 'create_cases', 'analyze_evidence', 'view_reports']
  },
  {
    id: 'user-2',
    firstName: 'Jane',
    lastName: 'Admin',
    email: 'admin@forensight.com',
    password: 'admin123',
    department: 'IT Security',
    role: 'admin',
    badgeNumber: '54321',
    phone: '+1 (555) 987-6543',
    avatar: null,
    status: 'active',
    lastLogin: new Date().toISOString(),
    createdAt: '2024-01-10T08:15:00Z',
    permissions: ['*'] // Admin has all permissions
  },
  {
    id: 'user-3',
    firstName: 'Mike',
    lastName: 'Analyst',
    email: 'analyst@forensight.com',
    password: 'analyst123',
    department: 'Cyber Crime Unit',
    role: 'analyst',
    badgeNumber: '67890',
    phone: '+1 (555) 456-7890',
    avatar: null,
    status: 'active',
    lastLogin: '2024-10-08T15:22:00Z',
    createdAt: '2024-02-20T14:45:00Z',
    permissions: ['view_cases', 'analyze_evidence', 'create_reports']
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = () => {
      try {
        const savedUser = localStorage.getItem('forensight_user');
        const savedToken = localStorage.getItem('forensight_token');
        
        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          // Verify user still exists in our mock database
          const existingUser = users.find(u => u.id === parsedUser.id);
          if (existingUser && existingUser.status === 'active') {
            setUser(parsedUser);
          } else {
            // Clear invalid session
            localStorage.removeItem('forensight_user');
            localStorage.removeItem('forensight_token');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('forensight_user');
        localStorage.removeItem('forensight_token');
      } finally {
        setLoading(false);
      }
    };

    // Simulate a small delay for realistic loading
    setTimeout(checkExistingSession, 500);
  }, []);

  const login = async (credentials) => {
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user by email
      const foundUser = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
      
      if (!foundUser) {
        throw new Error('No account found with this email address');
      }
      
      if (foundUser.password !== credentials.password) {
        throw new Error('Invalid password');
      }
      
      if (foundUser.status !== 'active') {
        throw new Error('Account is not active. Please contact your administrator');
      }
      
      // Update last login time
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      
      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u)
      );
      
      // Create session
      const { password, ...userWithoutPassword } = updatedUser;
      const sessionToken = `token_${updatedUser.id}_${Date.now()}`;
      
      // Save to localStorage
      localStorage.setItem('forensight_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('forensight_token', sessionToken);
      
      setUser(userWithoutPassword);
      
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      const errorMessage = error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if email already exists
      const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
      if (existingUser) {
        throw new Error('An account with this email already exists');
      }
      
      // Check if badge number already exists (if provided)
      if (userData.badgeNumber) {
        const existingBadge = users.find(u => u.badgeNumber === userData.badgeNumber);
        if (existingBadge) {
          throw new Error('This badge number is already registered');
        }
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        avatar: null,
        status: 'active', // In real app, might need admin approval
        lastLogin: null,
        createdAt: new Date().toISOString(),
        permissions: getDefaultPermissions(userData.role)
      };
      
      // Add to users list
      setUsers(prevUsers => [...prevUsers, newUser]);
      
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