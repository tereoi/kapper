// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const Admin = require('./models/Admin');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/manager');

const app = express();

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://ezcuts.nl'
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/manager', managerRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    
    const admin = await Admin.findOne({ where: { username: 'admin' } });
    if (!admin) {
      await Admin.create({
        username: 'admin',
        password: 'admin123'
      });
      console.log('Admin account created');
    }

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
};

startServer();