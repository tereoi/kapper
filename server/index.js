// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Import models
const Appointment = require('./models/Appointment');
const Admin = require('./models/Admin');
const WorkingHours = require('./models/WorkingHours');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Je React app draait op deze port met Vite
  credentials: true
}));
app.use(express.json());

// Session middleware voor OAuth
const session = require('express-session');
app.use(session({
  secret: 'jouw_random_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // In productie op true zetten
    maxAge: 24 * 60 * 60 * 1000 // 24 uur
  }
}));

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Er is iets misgegaan!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database synchronization and server startup
const startServer = async () => {
  try {
    // Sync database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    // Create admin account if it doesn't exist
    try {
      const admin = await Admin.findOne({ where: { username: 'admin' } });
      if (!admin) {
        await Admin.create({
          username: 'admin',
          password: 'admin123' // In productie een veilig wachtwoord gebruiken!
        });
        console.log('Admin account created');
      }
    } catch (error) {
      console.error('Error creating admin account:', error);
    }

    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Google OAuth callback URL: ${process.env.GOOGLE_REDIRECT_URL}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});