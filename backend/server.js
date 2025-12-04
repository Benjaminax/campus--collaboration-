const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const activityRoutes = require('./routes/activities');
const teamRoutes = require('./routes/team');
const analyticsRoutes = require('./routes/analytics');

const socketAuth = require('./middleware/socketAuth');
const socketHandlers = require('./socket/socketHandlers');

const DeadlineReminderService = require('./services/deadlineReminder');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
      "https://benjaminax.github.io",
      "https://benjaminax.github.io/campus--collaboration-"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true
  }
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/health'
  }
});

app.use(helmet());
app.use(morgan('combined'));

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:3001",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
      "https://benjaminax.github.io",
      "https://benjaminax.github.io/campus--collaboration-"
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root endpoint - shows backend is working
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <head>
        <title>Campus Collaboration API</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 50px auto; 
            padding: 20px; 
            background-color: #f5f5f5;
          }
          .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
          }
          .success { color: #28a745; font-size: 24px; font-weight: bold; }
          .info { color: #6c757d; margin: 10px 0; }
          .endpoint { 
            background: #f8f9fa; 
            padding: 10px; 
            border-radius: 5px; 
            margin: 10px 0;
            font-family: monospace;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎓 Campus Collaboration API</h1>
          <div class="success">✅ Backend Working Successfully!</div>
          <div class="info">Server is running and ready to handle requests</div>
          <div class="info">Environment: ${process.env.NODE_ENV || 'development'}</div>
          <div class="info">Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}</div>
          <div class="info">Uptime: ${Math.floor(process.uptime())} seconds</div>
          
          <h3>Available Endpoints:</h3>
          <div class="endpoint">GET /health - Health check</div>
          <div class="endpoint">GET /api/debug - Debug information</div>
          <div class="endpoint">POST /api/auth/register - User registration</div>
          <div class="endpoint">POST /api/auth/login - User login</div>
          <div class="endpoint">GET /api/projects - List projects</div>
          <div class="endpoint">GET /api/tasks - List tasks</div>
          
          <div style="margin-top: 20px;">
            <a href="https://benjaminax.github.io/campus--collaboration-/" 
               style="color: #007bff; text-decoration: none;">
              🌐 Visit Frontend Application
            </a>
          </div>
        </div>
      </body>
    </html>
  `);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Status endpoint - JSON response
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend working successfully!",
    status: "online",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      users: "/api/users", 
      projects: "/api/projects",
      tasks: "/api/tasks",
      notifications: "/api/notifications"
    }
  });
});

// Debug endpoint for checking environment
app.get('/api/debug', async (req, res) => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      debug: {
        userCount,
        hasJwtSecret: !!process.env.JWT_SECRET,
        jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
        mongoUri: process.env.MONGODB_URI ? 'SET' : 'NOT SET',
        nodeEnv: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('⚠️  WARNING: JWT_SECRET should be at least 32 characters in production');
  }
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI is required in production');
    process.exit(1);
  }
  console.log('✅ Production environment checks passed');
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/analytics', analyticsRoutes);

io.use(socketAuth);

io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);
  socketHandlers(io, socket);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

console.log('🔍 Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI value:', process.env.MONGODB_URI ? 'Set correctly' : 'NOT SET');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_collaboration_board';
console.log('🔗 Connecting to:', mongoUri.includes('mongodb+srv') ? 'MongoDB Atlas' : 'Local MongoDB');

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
})
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('Database:', mongoose.connection.name);
    
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log('\n🚀 =================================');
      console.log(`🌟 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
      console.log('🚀 =================================\n');
    });
    
    const deadlineReminder = new DeadlineReminderService();
    deadlineReminder.start();
    console.log('📅 Deadline reminder service initialized');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    console.error('💡 Make sure MongoDB is running or check your connection string');
    process.exit(1);
  });

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});