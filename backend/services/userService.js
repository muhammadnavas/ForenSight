const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import MongoDB connection from caseService
const { connectToMongoDB } = require('./caseService');

// User Management API Functions
class UserAPI {
  static async createUser(userData) {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      // Check if user already exists
      const existingUser = await users.findOne({
        $or: [
          { email: userData.email },
          { username: userData.username }
        ]
      });
      
      if (existingUser) {
        return { 
          success: false, 
          error: existingUser.email === userData.email 
            ? 'Email already exists' 
            : 'Username already exists'
        };
      }
      
      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const newUser = {
        ...userData,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
        status: 'active',
        profileImage: userData.profileImage || null
      };
      
      // Remove password from userData for response
      delete userData.password;
      
      const result = await users.insertOne(newUser);
      
      return { 
        success: true, 
        userId: result.insertedId, 
        user: { ...newUser, password: undefined }
      };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAllUsers() {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      // Exclude password field from results
      const usersList = await users
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .toArray();
      
      return { success: true, users: usersList };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserById(userId) {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      const query = ObjectId.isValid(userId) 
        ? { _id: new ObjectId(userId) }
        : { $or: [{ username: userId }, { email: userId }] };
        
      const userData = await users.findOne(query, { projection: { password: 0 } });
      
      if (!userData) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateUser(userId, updateData) {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      const query = ObjectId.isValid(userId) 
        ? { _id: new ObjectId(userId) }
        : { username: userId };
      
      // If password is being updated, hash it
      if (updateData.password) {
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        updateData.password = await bcrypt.hash(updateData.password, saltRounds);
      }
        
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date()
        }
      };
      
      const result = await users.updateOne(query, update);
      
      if (result.matchedCount === 0) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteUser(userId) {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      const query = ObjectId.isValid(userId) 
        ? { _id: new ObjectId(userId) }
        : { username: userId };
        
      const result = await users.deleteOne(query);
      
      if (result.deletedCount === 0) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  }

  static async authenticateUser(username, password) {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      // Find user by username or email
      const user = await users.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });
      
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Update last login
      await users.updateOne(
        { _id: user._id },
        { 
          $set: { 
            lastLogin: new Date(),
            updatedAt: new Date()
          }
        }
      );
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      
      return { 
        success: true, 
        user: { 
          ...userWithoutPassword,
          lastLogin: new Date()
        }
      };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUsersByRole(role) {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      const usersList = await users
        .find({ role: role }, { projection: { password: 0 } })
        .sort({ name: 1 })
        .toArray();
      
      return { success: true, users: usersList };
    } catch (error) {
      console.error('Error fetching users by role:', error);
      return { success: false, error: error.message };
    }
  }

  static async getUserStatistics() {
    try {
      const database = await connectToMongoDB();
      const users = database.collection('users');
      
      const stats = await users.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]).toArray();
      
      const totalUsers = await users.countDocuments();
      const activeUsers = await users.countDocuments({ status: 'active' });
      
      return { 
        success: true, 
        statistics: {
          totalUsers,
          activeUsers,
          byRole: stats,
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  UserAPI
};