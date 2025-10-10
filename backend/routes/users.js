const express = require('express');
const router = express.Router();
const { UserAPI } = require('../services/userService');

// Get all users
router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    
    let result;
    if (role) {
      result = await UserAPI.getUsersByRole(role);
    } else {
      result = await UserAPI.getAllUsers();
    }
    
    if (result.success) {
      res.json({
        success: true,
        users: result.users,
        total: result.users.length
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserAPI.getUserById(id);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    
    // Validation
    if (!userData.name || !userData.username || !userData.email || !userData.password || !userData.role) {
      return res.status(400).json({
        success: false,
        error: 'Name, username, email, password, and role are required'
      });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }
    
    // Password strength validation
    if (userData.password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    const result = await UserAPI.createUser(userData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        userId: result.userId,
        user: result.user
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.createdAt;
    delete updateData._id;
    
    // If email is being updated, validate it
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format'
        });
      }
    }
    
    // If password is being updated, validate it
    if (updateData.password && updateData.password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }
    
    const result = await UserAPI.updateUser(id, updateData);
    
    if (result.success) {
      res.json({
        success: true,
        modifiedCount: result.modifiedCount
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await UserAPI.deleteUser(id);
    
    if (result.success) {
      res.json({
        success: true,
        deletedCount: result.deletedCount
      });
    } else {
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Authenticate user (login)
router.post('/authenticate', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }
    
    const result = await UserAPI.authenticateUser(username, password);
    
    if (result.success) {
      res.json({
        success: true,
        user: result.user,
        message: 'Authentication successful'
      });
    } else {
      res.status(401).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const result = await UserAPI.getUserStatistics();
    
    if (result.success) {
      res.json({
        success: true,
        statistics: result.statistics
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;