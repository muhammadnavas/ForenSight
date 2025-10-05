const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

// Import routes
const caseRoutes = require('./routes/cases');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseId = req.params.caseId || 'temp';
    const caseDir = path.join(uploadsDir, caseId);
    
    if (!fs.existsSync(caseDir)) {
      fs.mkdirSync(caseDir, { recursive: true });
    }
    
    cb(null, caseDir);
  },
  filename: (req, file, cb) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    cb(null, `${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common forensic file types
    const allowedTypes = [
      'application/octet-stream',
      'application/x-forensic',
      'application/json',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(dd|e01|ufdr|json|csv|txt|zip)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only forensic files are allowed.'), false);
    }
  }
});

// Routes
app.use('/api/cases', caseRoutes);

// File upload endpoint
app.post('/api/cases/:caseId/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { caseId } = req.params;
    const fileData = {
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadedAt: new Date(),
      status: 'uploaded'
    };

    // Add file to case using the case service
    const { CaseAPI } = require('./services/caseService');
    const result = await CaseAPI.addFileToCase(caseId, fileData);

    if (result.success) {
      res.json({
        success: true,
        message: 'File uploaded successfully',
        fileId: result.fileId,
        file: fileData
      });
    } else {
      // Clean up uploaded file if case update failed
      fs.unlinkSync(req.file.path);
      res.status(404).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'File upload failed: ' + error.message
    });
  }
});

// File download endpoint
app.get('/api/cases/:caseId/files/:fileId/download', async (req, res) => {
  try {
    const { caseId, fileId } = req.params;
    
    // Get case files
    const { CaseAPI } = require('./services/caseService');
    const result = await CaseAPI.getCaseFiles(caseId);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
    
    const file = result.files.find(f => f._id.toString() === fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const filePath = file.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
    }
    
    res.download(filePath, file.originalName);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Download failed: ' + error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ForenSight API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 100MB.'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`ForenSight API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;