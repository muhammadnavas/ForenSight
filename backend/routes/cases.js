const express = require('express');
const router = express.Router();
const { CaseAPI } = require('../services/caseService');

// Get all cases
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const result = await CaseAPI.getAllCases(userId);
    
    if (result.success) {
      res.json({
        success: true,
        cases: result.cases,
        total: result.cases.length
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

// Get case by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CaseAPI.getCaseById(id);
    
    if (result.success) {
      res.json({
        success: true,
        case: result.case
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

// Create new case
router.post('/', async (req, res) => {
  try {
    const caseData = req.body;
    
    // Validation
    if (!caseData.name || !caseData.investigator) {
      return res.status(400).json({
        success: false,
        error: 'Case name and investigator are required'
      });
    }
    
    const result = await CaseAPI.createCase(caseData);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        caseId: result.caseId,
        case: result.case
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

// Update case
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const result = await CaseAPI.updateCase(id, updateData);
    
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

// Delete case
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CaseAPI.deleteCase(id);
    
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

// Add file to case
router.post('/:id/files', async (req, res) => {
  try {
    console.log('📥 POST /:id/files - Adding file to case');
    console.log('🆔 Case ID:', req.params.id);
    console.log('📄 Request body keys:', Object.keys(req.body));
    console.log('📋 Headers:', req.headers);
    console.log('📎 Files:', req.files ? Object.keys(req.files) : 'No files');
    
    const { id } = req.params;
    
    // Check if file was uploaded via multipart form
    if (req.files && req.files.file) {
      const uploadedFile = req.files.file;
      console.log('📁 Processing uploaded file:', uploadedFile.name);
      
      const fileData = {
        name: uploadedFile.name,
        originalName: uploadedFile.name,
        mimeType: uploadedFile.mimetype,
        sizeBytes: uploadedFile.size,
        uploadPath: uploadedFile.tempFilePath || 'temp',
        fileType: getFileTypeFromName(uploadedFile.name),
        uploadedAt: new Date().toISOString(),
        checksum: uploadedFile.md5 || null
      };
      
      const result = await CaseAPI.addFileToCase(id, fileData);
      console.log('🔄 CaseAPI result:', result);
      
      if (result.success) {
        console.log('✅ File added successfully');
        res.json({
          success: true,
          fileId: result.fileId,
          file: fileData
        });
      } else {
        console.log('❌ Failed to add file:', result.error);
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } else if (req.body && Object.keys(req.body).length > 0) {
      // Handle JSON file data
      const fileData = req.body;
      
      const result = await CaseAPI.addFileToCase(id, fileData);
      console.log('🔄 CaseAPI result:', result);
      
      if (result.success) {
        console.log('✅ File metadata added successfully');
        res.json({
          success: true,
          fileId: result.fileId
        });
      } else {
        console.log('❌ Failed to add file:', result.error);
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } else {
      console.log('❌ No file data provided');
      return res.status(400).json({
        success: false,
        error: 'No file data or file upload provided'
      });
    }
  } catch (error) {
    console.error('💥 Error in POST /:id/files route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
});

// Helper function to determine file type from filename
function getFileTypeFromName(fileName) {
  const extension = fileName.split('.').pop().toLowerCase();
  if (['db', 'sqlite'].includes(extension)) return 'database';
  if (['xml', 'json'].includes(extension)) return 'data';
  if (['zip', 'rar', '7z'].includes(extension)) return 'archive';
  if (['txt', 'log'].includes(extension)) return 'text';
  if (['img', 'dd'].includes(extension)) return 'image';
  return 'unknown';
}

// Get case files
router.get('/:id/files', async (req, res) => {
  try {
    console.log('📤 GET /:id/files - Getting case files');
    console.log('🆔 Case ID:', req.params.id);
    
    const { id } = req.params;
    const result = await CaseAPI.getCaseFiles(id);
    console.log('🔄 CaseAPI result:', result);
    
    if (result.success) {
      console.log('✅ Files retrieved successfully:', result.files?.length || 0, 'files');
      res.json({
        success: true,
        files: result.files
      });
    } else {
      console.log('❌ Failed to get files:', result.error);
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('💥 Error in GET /:id/files route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
});

// Add evidence to case
router.post('/:id/evidence', async (req, res) => {
  try {
    const { id } = req.params;
    const evidenceData = req.body;
    
    const result = await CaseAPI.addEvidence(id, evidenceData);
    
    if (result.success) {
      res.json({
        success: true,
        evidenceId: result.evidenceId
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

// Get case statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const result = await CaseAPI.getCaseStatistics();
    
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