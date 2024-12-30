require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const session = require('express-session');
const sequelize = require('./db');
const Admin = require('./models/Admin');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const managerRoutes = require('./routes/manager');

const app = express();

app.use(cors({
 origin: process.env.NODE_ENV === 'production'
   ? ['https://ezcuts.nl', 'http://ezcuts.nl'] 
   : 'http://localhost:5173',
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE'],
 allowedHeaders: ['Content-Type']
}));

app.use(compression());
app.use(helmet());
app.use(express.json());

app.use(session({
 secret: process.env.SESSION_SECRET || 'your-secret-key',
 resave: false,
 saveUninitialized: false,
 cookie: {
   secure: process.env.NODE_ENV === 'production',
   maxAge: 24 * 60 * 60 * 1000
 }
}));

app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/auth', authRoutes);
app.use('/api/manager', managerRoutes);

app.get('/health', async (req, res) => {
 try {
   await sequelize.authenticate();
   res.json({ status: 'healthy' });
 } catch (error) {
   res.status(503).json({ status: 'unhealthy', error: error.message });
 }
});

const startServer = async () => {
 try {
   await sequelize.authenticate();
   console.log('Database connected');
   console.log('Environment:', process.env.NODE_ENV);
   console.log('Database URL configured:', !!process.env.DATABASE_URL);

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

process.on('unhandledRejection', (error) => {
 console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
 console.error('Uncaught exception:', error);
 process.exit(1);
});

startServer();

module.exports = app;