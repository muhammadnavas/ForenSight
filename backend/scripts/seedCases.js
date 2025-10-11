const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/forensight';
const DATABASE_NAME = process.env.MONGODB_DB_NAME || 'forensight';

async function seedCases() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DATABASE_NAME);
    const cases = db.collection('cases');
    
    // Read the cyber crime case JSON file
    const cyberCrimeFilePath = path.join(__dirname, '../../frontend/public/cyber-crime-case-001.json');
    console.log('📄 Reading case file:', cyberCrimeFilePath);
    
    if (!fs.existsSync(cyberCrimeFilePath)) {
      throw new Error(`Case file not found: ${cyberCrimeFilePath}`);
    }
    
    const cyberCrimeData = JSON.parse(fs.readFileSync(cyberCrimeFilePath, 'utf8'));
    
    // Check if case already exists
    const existingCase = await cases.findOne({ caseId: cyberCrimeData.caseId });
    if (existingCase) {
      console.log('✅ Case already exists:', cyberCrimeData.caseId);
      console.log('   MongoDB _id:', existingCase._id);
      return existingCase;
    }
    
    // Prepare case data for MongoDB
    const caseDocument = {
      ...cyberCrimeData,
      createdAt: new Date(cyberCrimeData.createdAt),
      updatedAt: new Date(cyberCrimeData.updatedAt),
      lastActivity: new Date(cyberCrimeData.lastActivity),
      estimatedCompletionDate: new Date(cyberCrimeData.estimatedCompletionDate),
      filesUploaded: [],
      totalFiles: 0,
      totalSizeBytes: 0,
      investigators: [cyberCrimeData.assignedInvestigator],
      tags: [],
      notes: []
    };
    
    // Insert the case
    console.log('💾 Inserting case into database...');
    const result = await cases.insertOne(caseDocument);
    
    console.log('✅ Case inserted successfully!');
    console.log('   Case ID:', cyberCrimeData.caseId);
    console.log('   MongoDB _id:', result.insertedId);
    console.log('   Case Name:', cyberCrimeData.caseName);
    
    // Fetch and return the inserted case
    const insertedCase = await cases.findOne({ _id: result.insertedId });
    return insertedCase;
    
  } catch (error) {
    console.error('❌ Error seeding cases:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the seed function if called directly
if (require.main === module) {
  seedCases()
    .then((insertedCase) => {
      console.log('\n🎉 Case seeding completed successfully!');
      console.log('   You can now upload files to case:', insertedCase.caseId);
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Case seeding failed:', error.message);
      process.exit(1);
    });
}

module.exports = { seedCases };