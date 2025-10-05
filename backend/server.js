const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

// Import routes
const caseRoutes = require('./routes/cases');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: process.env.CORS_CREDENTIALS === 'true' || true
}));

// Body parsing middleware with configurable limits
const maxFileSize = process.env.MAX_FILE_SIZE || '50mb';
app.use(express.json({ limit: maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: maxFileSize }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create logs directory if logging is enabled
if (process.env.LOG_FILE) {
  const logsDir = path.dirname(process.env.LOG_FILE);
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
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
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // Configurable limit
    files: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 10
  },
  fileFilter: (req, file, cb) => {
    if (process.env.ENABLE_FILE_VALIDATION === 'false') {
      cb(null, true);
      return;
    }

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
    
    // Get allowed extensions from environment or use defaults
    const allowedExtensions = process.env.ALLOWED_FILE_TYPES 
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['.dd', '.e01', '.ufdr', '.json', '.csv', '.txt', '.zip', '.db', '.sqlite', '.xml', '.rar', '.7z', '.log', '.img'];
    
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`), false);
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
    version: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    features: {
      aiAnalysis: process.env.ENABLE_AI_ANALYSIS === 'true',
      networkAnalysis: process.env.ENABLE_NETWORK_ANALYSIS === 'true',
      realTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true',
      fileValidation: process.env.ENABLE_FILE_VALIDATION !== 'false'
    }
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
app.listen(PORT, HOST, () => {
  console.log(`🚀 ForenSight API server running on http://${HOST}:${PORT}`);
  console.log(`📊 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔧 API Version: ${process.env.API_VERSION || 'v1'}`);
  
  if (process.env.DEBUG_MODE === 'true') {
    console.log(`🐛 Debug mode enabled`);
    console.log(`📁 Upload directory: ${uploadsDir}`);
    console.log(`💾 Max file size: ${(parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024) / (1024 * 1024)}MB`);
  }
});

module.exports = app;