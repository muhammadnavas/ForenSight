const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// MongoDB configuration from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forensight';
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'forensight';
const CONNECT_TIMEOUT = parseInt(process.env.MONGODB_CONNECT_TIMEOUT) || 30000;
const SERVER_SELECTION_TIMEOUT = parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT) || 30000;

let client;
let db;
let isConnecting = false;

// Initialize MongoDB connection
async function connectToMongoDB() {
  try {
    if (db) {
      return db;
    }
    
    if (isConnecting) {
      // Wait for existing connection attempt
      while (isConnecting) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return db;
    }
    
    isConnecting = true;
    console.log('🔌 Connecting to MongoDB...');
    console.log(`📍 Database: ${DATABASE_NAME}`);
    
    client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: CONNECT_TIMEOUT,
      serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT,
      retryWrites: true,
      w: 'majority'
    });
    
    await client.connect();
    
    // Test the connection
    await client.db(DATABASE_NAME).admin().ping();
    console.log('✅ Successfully connected to MongoDB');
    
    db = client.db(DATABASE_NAME);
    isConnecting = false;
    
    return db;
  } catch (error) {
    isConnecting = false;
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Case Management API Functions
class CaseAPI {
  static async createCase(caseData) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      // Generate case ID using environment configuration
      const caseIdPrefix = process.env.CASE_ID_PREFIX || 'FS';
      const caseIdLength = parseInt(process.env.CASE_ID_LENGTH) || 8;
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 2 + caseIdLength);
      const caseId = `${caseIdPrefix}-${timestamp}-${randomSuffix}`;

      const newCase = {
        ...caseData,
        caseId: caseId,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active',
        filesUploaded: [],
        totalFiles: 0,
        totalSizeBytes: 0,
        lastActivity: new Date(),
        investigators: [caseData.investigator],
        tags: [],
        evidence: [],
        suspects: [],
        victims: [],
        locations: [],
        timeline: [],
        notes: []
      };

      const result = await cases.insertOne(newCase);
      return { success: true, caseId: result.insertedId, case: newCase };
    } catch (error) {
      console.error('Error creating case:', error);
      return { success: false, error: error.message };
    }
  }

  static async getAllCases(userId = null) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = userId ? { investigators: userId } : {};
      const casesList = await cases.find(query).sort({ createdAt: -1 }).toArray();
      
      return { success: true, cases: casesList };
    } catch (error) {
      console.error('Error fetching cases:', error);
      return { success: false, error: error.message };
    }
  }

  static async getCaseById(caseId) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = ObjectId.isValid(caseId) 
        ? { _id: new ObjectId(caseId) }
        : { caseId: caseId };
        
      const caseData = await cases.findOne(query);
      
      if (!caseData) {
        return { success: false, error: 'Case not found' };
      }
      
      return { success: true, case: caseData };
    } catch (error) {
      console.error('Error fetching case:', error);
      return { success: false, error: error.message };
    }
  }

  static async updateCase(caseId, updateData) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = ObjectId.isValid(caseId) 
        ? { _id: new ObjectId(caseId) }
        : { caseId: caseId };
        
      const update = {
        $set: {
          ...updateData,
          updatedAt: new Date(),
          lastActivity: new Date()
        }
      };
      
      const result = await cases.updateOne(query, update);
      
      if (result.matchedCount === 0) {
        return { success: false, error: 'Case not found' };
      }
      
      return { success: true, modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error updating case:', error);
      return { success: false, error: error.message };
    }
  }

  static async addFileToCase(caseId, fileData) {
    try {
      console.log('📁 Adding file to case:', caseId);
      console.log('📄 File data:', fileData);
      
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = ObjectId.isValid(caseId) 
        ? { _id: new ObjectId(caseId) }
        : { caseId: caseId };
        
      console.log('🔍 Query:', query);
      
      // Check if case exists first
      const existingCase = await cases.findOne(query);
      if (!existingCase) {
        console.log('❌ Case not found with query:', query);
        return { success: false, error: 'Case not found' };
      }
      
      console.log('✅ Case found:', existingCase.name || existingCase.caseId);
      
      const fileEntry = {
        fileId: new ObjectId(),
        ...fileData,
        uploadedAt: new Date()
      };
      
      // Handle both 'size' and 'sizeBytes' properties
      const fileSize = fileData.sizeBytes || fileData.size || 0;
      
      const update = {
        $push: { filesUploaded: fileEntry },
        $inc: { 
          totalFiles: 1,
          totalSizeBytes: fileSize
        },
        $set: {
          updatedAt: new Date(),
          lastActivity: new Date()
        }
      };
      
      console.log('🔄 Updating case with file entry...');
      const result = await cases.updateOne(query, update);
      
      console.log('📊 Update result:', result);
      
      if (result.matchedCount === 0) {
        return { success: false, error: 'Case not found during update' };
      }
      
      console.log('✅ File added successfully with ID:', fileEntry.fileId);
      return { success: true, fileId: fileEntry.fileId };
    } catch (error) {
      console.error('❌ Error adding file to case:', error);
      console.error('Stack trace:', error.stack);
      return { success: false, error: error.message };
    }
  }

  static async getCaseFiles(caseId) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = ObjectId.isValid(caseId) 
        ? { _id: new ObjectId(caseId) }
        : { caseId: caseId };
        
      const caseData = await cases.findOne(query, { 
        projection: { filesUploaded: 1, caseId: 1, name: 1 } 
      });
      
      if (!caseData) {
        return { success: false, error: 'Case not found' };
      }
      
      return { success: true, files: caseData.filesUploaded || [] };
    } catch (error) {
      console.error('Error fetching case files:', error);
      return { success: false, error: error.message };
    }
  }

  static async deleteCase(caseId) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = ObjectId.isValid(caseId) 
        ? { _id: new ObjectId(caseId) }
        : { caseId: caseId };
        
      const result = await cases.deleteOne(query);
      
      if (result.deletedCount === 0) {
        return { success: false, error: 'Case not found' };
      }
      
      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error deleting case:', error);
      return { success: false, error: error.message };
    }
  }

  static async addEvidence(caseId, evidenceData) {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const query = ObjectId.isValid(caseId) 
        ? { _id: new ObjectId(caseId) }
        : { caseId: caseId };
        
      const evidence = {
        evidenceId: new ObjectId(),
        ...evidenceData,
        addedAt: new Date()
      };
      
      const update = {
        $push: { evidence: evidence },
        $set: {
          updatedAt: new Date(),
          lastActivity: new Date()
        }
      };
      
      const result = await cases.updateOne(query, update);
      
      if (result.matchedCount === 0) {
        return { success: false, error: 'Case not found' };
      }
      
      return { success: true, evidenceId: evidence.evidenceId };
    } catch (error) {
      console.error('Error adding evidence:', error);
      return { success: false, error: error.message };
    }
  }

  static async getCaseStatistics() {
    try {
      const database = await connectToMongoDB();
      const cases = database.collection('cases');
      
      const stats = await cases.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalFiles: { $sum: '$totalFiles' },
            totalSize: { $sum: '$totalSizeBytes' }
          }
        }
      ]).toArray();
      
      const totalCases = await cases.countDocuments();
      
      return { 
        success: true, 
        statistics: {
          totalCases,
          byStatus: stats,
          lastUpdated: new Date()
        }
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = {
  CaseAPI,
  connectToMongoDB
};