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
app.use('/api/admin', adminRoutes);

// Sync database and create admin account
sequelize.sync({ alter: true }).then(async () => {
    console.log('Database synchronized');
    
    // Create admin account if it doesn't exist
    try {
        const admin = await Admin.findOne({ where: { username: 'admin' } });
        if (!admin) {
            await Admin.create({
                username: 'admin',
                password: 'admin123'
            });
            console.log('Admin account created');
        }
    } catch (error) {
        console.error('Error creating admin account:', error);
    }
}).catch(err => {
    console.error('Error syncing database:', err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});