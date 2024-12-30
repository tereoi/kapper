// server/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');

// Import middleware
// const errorHandler = require('./middleware/errorHandler');
// const cacheMiddleware = require('./middleware/cache');
// const setupMiddleware = require('./middleware/security');

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
// setupMiddleware(app);

// Setup monitoring
// setupMonitoring(app);

// Cache frequently accessed routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
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
    // Probeer verbinding te maken met database met retry mechanisme
    const db = await connectWithRetry();
    
    // Sync database
    await db.sync({ alter: true });
    console.log('Database synchronized');

    // Health check endpoint
    app.get('/health', async (req, res) => {
      try {
        await db.authenticate();
        res.json({ 
          status: 'healthy',
          database: 'connected',
          environment: process.env.NODE_ENV,
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

    const PORT = process.env.PORT || 3001;
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV);
    });

    // Graceful shutdown
    const shutdown = async () => {
      console.log('Shutting down gracefully...');
      server.close(async () => {
        try {
          await db.close();
          console.log('Database connection closed.');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

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