const { CaseAPI } = require('./services/caseService');

async function testRoutes() {
  console.log('🧪 Testing ForenSight Backend Routes...\n');
  
  try {
    // Test 1: Create a test case
    console.log('1️⃣ Testing case creation...');
    const createResult = await CaseAPI.createCase({
      name: 'Test Case for API',
      description: 'Test case to verify API functionality',
      investigator: 'Test Investigator'
    });
    
    if (createResult.success) {
      console.log('✅ Case created successfully:', createResult.caseId);
      const testCaseId = createResult.caseId;
      
      // Test 2: Get all cases
      console.log('\n2️⃣ Testing get all cases...');
      const getAllResult = await CaseAPI.getAllCases();
      if (getAllResult.success) {
        console.log('✅ Retrieved cases:', getAllResult.cases.length);
      } else {
        console.log('❌ Failed to get cases:', getAllResult.error);
      }
      
      // Test 3: Get case by ID
      console.log('\n3️⃣ Testing get case by ID...');
      const getCaseResult = await CaseAPI.getCaseById(testCaseId);
      if (getCaseResult.success) {
        console.log('✅ Retrieved case:', getCaseResult.case.name);
      } else {
        console.log('❌ Failed to get case:', getCaseResult.error);
      }
      
      // Test 4: Add file to case
      console.log('\n4️⃣ Testing add file to case...');
      const fileData = {
        originalName: 'test-file.txt',
        filename: 'test-file-12345.txt',
        path: '/uploads/test-file-12345.txt',
        size: 1024,
        sizeBytes: 1024,
        mimetype: 'text/plain'
      };
      
      const addFileResult = await CaseAPI.addFileToCase(testCaseId, fileData);
      if (addFileResult.success) {
        console.log('✅ File added successfully:', addFileResult.fileId);
      } else {
        console.log('❌ Failed to add file:', addFileResult.error);
      }
      
      // Test 5: Get case files
      console.log('\n5️⃣ Testing get case files...');
      const getFilesResult = await CaseAPI.getCaseFiles(testCaseId);
      if (getFilesResult.success) {
        console.log('✅ Retrieved files:', getFilesResult.files.length);
        console.log('📄 Files:', getFilesResult.files.map(f => f.originalName));
      } else {
        console.log('❌ Failed to get files:', getFilesResult.error);
      }
      
      // Clean up: Delete test case
      console.log('\n🧹 Cleaning up test case...');
      const deleteResult = await CaseAPI.deleteCase(testCaseId);
      if (deleteResult.success) {
        console.log('✅ Test case deleted successfully');
      } else {
        console.log('⚠️ Could not delete test case:', deleteResult.error);
      }
      
    } else {
      console.log('❌ Failed to create test case:', createResult.error);
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
  }
  
  console.log('\n🏁 Test completed!');
  process.exit(0);
}

// Run the test
testRoutes();