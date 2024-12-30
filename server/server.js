// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const cacheMiddleware = require('./middleware/cache');
const setupMiddleware = require('./middleware/security');
const { protectAdminRoute } = require('./middleware/auth');

// Import routes and database
const sequelize = require('./db');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/manager');

// Import monitoring
const { setupMonitoring } = require('./monitoring/performance');

const app = express();

// Basic middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://ezcuts.nl', 'https://www.ezcuts.nl']
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}));

// Setup security middleware
setupMiddleware(app);

// Setup monitoring
setupMonitoring(app);

// Protected routes
app.use('/api/appointments', cacheMiddleware(300), appointmentRoutes);
app.use('/api/admin', protectAdminRoute, adminRoutes);
app.use('/api/admin/login', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/manager', managerRoutes);

// Health check
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Error handling
app.use(errorHandler);

// Keep-alive mechanism
const keepAlive = async () => {
  try {
    await sequelize.authenticate();
    console.log('Keep-alive check successful');
  } catch (error) {
    console.error('Keep-alive failed:', error);
  }
};

setInterval(keepAlive, 5 * 60 * 1000);

// Start server
const startServer = async () => {
  try {
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Database URL configured:', !!process.env.DATABASE_URL);
    
    await sequelize.authenticate();
    console.log('Database connection verified');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    // Create initial admin if it doesn't exist
    const Admin = require('./models/Admin');
    const existingAdmin = await Admin.findOne({ where: { username: 'admin' } });
    
    if (!existingAdmin) {
      await Admin.create({
        username: 'admin',
        password: process.env.ADMIN_PASSWORD || 'admin123'
      });
      console.log('Initial admin account created');
    }

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

// Error handling for unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

module.exports = app;