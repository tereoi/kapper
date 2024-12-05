const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const WorkingHours = require('../models/WorkingHours');

// Create admin account
router.post('/register', async (req, res) => {
    try {
        const admin = await Admin.create(req.body);
        res.status(201).json({ 
            success: true, 
            message: 'Admin account created successfully' 
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ where: { username } });
        
        if (admin && admin.password === password) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Werktijden instellen
router.post('/working-hours', async (req, res) => {
    try {
        const workingHours = await WorkingHours.create(req.body);
        res.status(201).json(workingHours);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Krijg alle werktijden
router.get('/working-hours', async (req, res) => {
    try {
        const workingHours = await WorkingHours.findAll();
        res.json(workingHours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Werktijd verwijderen
router.delete('/working-hours/:date', async (req, res) => {
    try {
        const workingHours = await WorkingHours.findOne({
            where: { date: req.params.date }
        });
        if (!workingHours) {
            return res.status(404).json({ message: 'Werktijden niet gevonden' });
        }
        await workingHours.destroy();
        res.json({ message: 'Werktijden verwijderd' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put('/working-hours/:date', async (req, res) => {
    try {
        const workingHours = await WorkingHours.findOne({
            where: { date: req.params.date }
        });

        if (workingHours) {
            await workingHours.update(req.body);
            res.json(workingHours);
        } else {
            res.status(404).json({ message: 'Werktijden niet gevonden' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/verify-password', async (req, res) => {
    try {
      const { password } = req.body;
      const admin = await Admin.findOne({ where: { username: 'admin' } });
      
      if (admin && admin.password === password) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;