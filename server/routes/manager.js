// routes/manager.js
const express = require('express');
const router = express.Router();
const Manager = require('../models/Manager');
const Appointment = require('../models/Appointment');
const { Op } = require('sequelize');

// Register nieuwe manager
router.post('/register', async (req, res) => {
    try {
        console.log('Register request received:', req.body); // Debug logging
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Gebruikersnaam en wachtwoord zijn verplicht'
            });
        }

        // Check of deze username al bestaat
        const existingManager = await Manager.findOne({ 
            where: { username } 
        });

        if (existingManager) {
            return res.status(400).json({ 
                success: false,
                message: 'Deze gebruikersnaam bestaat al' 
            });
        }

        // Maak nieuwe manager aan
        const manager = await Manager.create({
            username,
            password
        });

        console.log('Manager created:', manager); // Debug logging

        res.status(201).json({
            success: true,
            message: 'Manager account aangemaakt',
            manager: {
                id: manager.id,
                username: manager.username
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Er ging iets mis bij het aanmaken van het account',
            error: error.message
        });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Zoek de manager in de database
        const manager = await Manager.findOne({ 
            where: { username } 
        });
        
        if (manager && manager.password === password) {
            return res.json({ 
                success: true,
                message: 'Login succesvol'
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: 'Ongeldige inloggegevens'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error'
        });
    }
});

// Get statistics
router.get('/statistics', async (req, res) => {
    try {
        // Huidige datum
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Begin van de week (maandag)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));

        // Begin van de maand
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Haal alle afspraken op voor verschillende periodes
        const [dailyAppointments, weeklyAppointments, monthlyAppointments] = await Promise.all([
            // Dagelijkse afspraken
            Appointment.findAll({
                where: {
                    date: today.toISOString().split('T')[0]
                }
            }),
            // Wekelijkse afspraken
            Appointment.findAll({
                where: {
                    date: {
                        [Op.gte]: startOfWeek.toISOString().split('T')[0],
                        [Op.lte]: today.toISOString().split('T')[0]
                    }
                }
            }),
            // Maandelijkse afspraken
            Appointment.findAll({
                where: {
                    date: {
                        [Op.gte]: startOfMonth.toISOString().split('T')[0],
                        [Op.lte]: today.toISOString().split('T')[0]
                    }
                }
            })
        ]);

        // Bereken inkomsten (als je die wilt tonen)
        const calculateRevenue = (appointments) => {
            return appointments.reduce((total, apt) => {
                // Prijzen per service
                const prices = {
                    'Knippen': 30,
                    'Knippen en baard': 45
                };
                return total + (prices[apt.service] || 0);
            }, 0);
        };

        res.json({
            daily: {
                count: dailyAppointments.length,
                revenue: calculateRevenue(dailyAppointments)
            },
            weekly: {
                count: weeklyAppointments.length,
                revenue: calculateRevenue(weeklyAppointments)
            },
            monthly: {
                count: monthlyAppointments.length,
                revenue: calculateRevenue(monthlyAppointments)
            }
        });
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ 
            message: error.message 
        });
    }
});

module.exports = router;