require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');

// Import models
const Appointment = require('./models/Appointment');
const Admin = require('./models/Admin');
const WorkingHours = require('./models/WorkingHours');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Sync database
sequelize.sync({ alter: true }).then(() => {
    console.log('Database synchronized');
}).catch(err => {
    console.error('Error syncing database:', err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});