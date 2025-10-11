const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();

// Import routes
const caseRoutes = require('./routes/cases');

const app = express();
// Render/hosting note:
// Always bind to 0.0.0.0 so the platform can expose the port.
// If HOST env was set to 'localhost', external port scans will fail.
const PORT = process.env.PORT || 5000;
let HOST = process.env.HOST || '0.0.0.0';
if (HOST === 'localhost' || HOST === '127.0.0.1') {
  console.log('[Startup] Overriding HOST', HOST, '→ 0.0.0.0 for container accessibility');
  HOST = '0.0.0.0';
}

// Middleware
// Enhanced CORS handling: supports multiple origins via CORS_ORIGINS or fallback to CORS_ORIGIN.
// Accept comma or whitespace separated list. Trailing slashes trimmed for comparisons.
function buildAllowedOrigins() {
  const raw = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || '';
  let list = raw
    .split(/[,\n\s]+/)
    .map(o => o.trim())
    .filter(Boolean)
    .map(o => o.replace(/\/$/, '')); // trim trailing /

  // Always include localhost dev defaults
  const devDefaults = [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'http://localhost:5174', 
    'http://127.0.0.1:5174'
  ];
  devDefaults.forEach(d => { if (!list.includes(d)) list.push(d); });

  // Include deployed frontend domains if not present
  ['https://forensight-frontend.vercel.app', 'https://vercel.app'].forEach(d => {
    if (!list.includes(d)) list.push(d);
  });
  return list;
}

let allowedOrigins = buildAllowedOrigins();
console.log('[CORS] Allowed origins:', allowedOrigins);

app.use((req, res, next) => {
  // Rebuild in debug mode to pick up env changes without restart (optional)
  if (process.env.DEBUG_MODE === 'true') {
    allowedOrigins = buildAllowedOrigins();
  }
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    if (process.env.ALLOW_ALL_ORIGINS === 'true') {
      if (process.env.DEBUG_MODE === 'true') console.warn('[CORS] ALLOW_ALL_ORIGINS enabled. Allowing any origin:', origin);
      return callback(null, true);
    }
    if (!origin) return callback(null, true); // curl / server to server
    const normalized = origin.replace(/\/$/, '');
    const allowed = allowedOrigins.includes(normalized);
    if (allowed || process.env.NODE_ENV === 'development') {
      if (process.env.DEBUG_MODE === 'true') console.log('[CORS] ✅ Allow', origin);
      return callback(null, true);
    } else {
      if (process.env.DEBUG_MODE === 'true') console.warn('[CORS] ❌ Block', origin, 'Allowed:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: (process.env.CORS_CREDENTIALS || '').toLowerCase() === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
}));

// Explicit OPTIONS handler for debugging preflights
app.options('*', (req, res, next) => {
  if (process.env.DEBUG_MODE === 'true') {
    console.log('[CORS][OPTIONS] Preflight for', req.headers.origin, '→', req.method, req.headers['access-control-request-method']);
  }
  res.sendStatus(204);
});

// Body parsing middleware with configurable limits
const maxFileSize = process.env.MAX_FILE_SIZE || '50mb';
app.use(express.json({ limit: maxFileSize }));
app.use(express.urlencoded({ extended: true, limit: maxFileSize }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
  useTempFiles: true,
  tempFileDir: path.join(__dirname, 'temp'),
  createParentPath: true,
  debug: process.env.DEBUG_MODE === 'true'
}));

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
// Root landing page (to avoid 'Cannot GET /' when hitting the base domain)
app.get('/', (req, res) => {
  res.type('html').send(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8" />
  <title>ForenSight API</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;line-height:1.5;color:#222;}code{background:#f4f4f4;padding:2px 6px;border-radius:4px;font-size:90%;}a{color:#0b62d6;text-decoration:none;}a:hover{text-decoration:underline;}h1{margin-top:0;}ul{padding-left:20px;}footer{margin-top:40px;font-size:12px;color:#666;} .badge{display:inline-block;padding:2px 8px;border-radius:12px;background:#eef;font-size:11px;margin-left:6px;}</style>
  </head><body>
  <h1>ForenSight API</h1>
  <p>Backend service is running. Use the endpoints below. For a quick status JSON, hit <code>/api/health</code>.</p>
  <ul>
    <li><a href="/api/health">/api/health</a> <span class="badge">GET</span></li>
    <li><code>GET /api/cases</code> – list cases</li>
    <li><code>POST /api/cases</code> – create a case</li>
    <li><code>POST /api/cases/:caseId/upload</code> – upload a file to a case</li>
    <li><code>GET /api/cases/:caseId/files</code> – list case files</li>
    <li><code>POST /api/cases/:caseId/files</code> – add file to case</li>
  </ul>
  <p>If you're seeing this on Render, the server bound correctly to <code>0.0.0.0:${PORT}</code>.</p>
  <footer>ForenSight &middot; ${new Date().getFullYear()}</footer>
  </body></html>`);
});

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

// CORS debug endpoint (no caching) to verify what the server thinks about origins
app.get('/api/cors-debug', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    requestOriginHeader: req.headers.origin || null,
    note: 'If your browser still blocks, ensure this origin appears in allowedOrigins and has no trailing /.',
    allowedOrigins,
    environment: process.env.NODE_ENV,
    debugMode: process.env.DEBUG_MODE === 'true'
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
  console.log(`🚀 ForenSight API server listening (external) on 0.0.0.0:${PORT}`);
  console.log(`🔐 Bound interface (requested HOST env): ${HOST}`);
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