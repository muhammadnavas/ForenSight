# ForenSight - Digital Forensics Case Management Platform

ForenSight is a comprehensive digital forensics platform with MongoDB-based case management, real-time map visualization, and AI-powered analysis capabilities.

## 🚀 Features

- **Case Management**: MongoDB-based case creation and organization
- **File Upload**: Secure file uploads associated with specific cases
- **Network Analysis**: Real-time map visualization with React Leaflet
- **Database Search**: Advanced forensic data search and filtering
- **Evidence Management**: Comprehensive evidence tracking and analysis
- **Professional UI**: Clean, professional interface for forensic investigators

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Modern web browser

## 🛠️ Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🗄️ Database Configuration

The application is configured to connect to MongoDB Atlas using the connection string:
```
mongodb+srv://navasns0409:rx4Fvt8un1dCovaz@cluster0.lz452k4.mongodb.net/
```

### Database Collections

- **cases**: Stores case information, files, and metadata
- **files**: File storage references and analysis results
- **evidence**: Evidence items linked to cases

## 🔧 API Endpoints

### Case Management
- `GET /api/cases` - Get all cases
- `POST /api/cases` - Create new case
- `GET /api/cases/:id` - Get case by ID
- `PUT /api/cases/:id` - Update case
- `DELETE /api/cases/:id` - Delete case

### File Management
- `POST /api/cases/:caseId/upload` - Upload file to case
- `GET /api/cases/:id/files` - Get case files
- `POST /api/cases/:id/files` - Add file metadata to case

### System
- `GET /api/health` - Health check endpoint

## 📁 Project Structure

```
ForenSight/
├── backend/
│   ├── server.js              # Express server
│   ├── package.json           # Backend dependencies
│   ├── routes/
│   │   └── cases.js          # Case management routes
│   ├── services/
│   │   └── caseService.js    # MongoDB case operations
│   └── uploads/              # File upload directory
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CaseManagement.jsx
│   │   │   ├── NetworkAnalysis.jsx
│   │   │   ├── UploadUFDR.jsx
│   │   │   └── DatabaseSearch.jsx
│   │   ├── contexts/
│   │   │   ├── CaseContext.jsx      # Case management context
│   │   │   └── CaseDataContext.jsx  # Data context
│   │   └── main.jsx
│   └── package.json          # Frontend dependencies
└── start-backend.bat         # Windows backend starter script
```

## 🔄 Workflow

1. **Create Case**: Use Case Management to create a new forensic case
2. **Upload Files**: Files can only be uploaded after selecting an active case
3. **Analysis**: Uploaded files are processed and made available for analysis
4. **Investigation**: Use Network Analysis, Database Search, and Evidence Viewer
5. **Reporting**: Generate reports and manage case progress

## 🔐 Security Features

- File type validation for forensic formats
- Case-based access control
- Secure file upload with size limits
- MongoDB connection security

## 📊 Supported File Formats

- SQLite databases (.db, .sqlite)
- XML data files (.xml)
- Compressed archives (.zip, .rar, .7z)
- Text logs (.txt, .log)
- JSON data (.json)
- Disk images (.img, .dd)

## 🗺️ Map Integration

The Network Analysis component uses React Leaflet with OpenStreetMap tiles for real-world geographic visualization of forensic data.

## 🚨 Case-First Workflow

**Important**: Files can only be uploaded after creating and selecting an active case. This ensures proper data organization and case management compliance.

## 🛡️ Error Handling

- Comprehensive error handling for API operations
- User-friendly error messages
- Automatic retry mechanisms for failed uploads
- Connection status monitoring

## 📝 Development

### Starting Development Environment

1. Start Backend:
```bash
cd backend && npm run dev
```

2. Start Frontend:
```bash
cd frontend && npm run dev
```

### Environment Variables

Create a `.env` file in the backend directory for custom configuration:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
MAX_FILE_SIZE=104857600
```

## 📞 Support

For technical support or questions about ForenSight, please refer to the project documentation or contact the development team.

---

**ForenSight** - Professional Digital Forensics Platform