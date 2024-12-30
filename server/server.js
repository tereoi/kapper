// server/server.js
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
    ? 'https://yourdomain.com' 
    : 'http://localhost:5173',
  credentials: true
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
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Setup security middleware
setupMiddleware(app);

// Setup monitoring
setupMonitoring(app);

// Cache frequently accessed routes
app.use('/api/appointments', cacheMiddleware(300), appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/manager', managerRoutes); 

// Error handling
app.use(errorHandler);

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
    console.log('Checking environment...');
    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    await sequelize.authenticate();
    console.log('Database connection successful');
    
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error);
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