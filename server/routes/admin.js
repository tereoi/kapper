// server/routes/admin.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const WorkingHours = require('../models/WorkingHours');



function generateTimeSlots(start, end) {
    const slots = [];
    let current = start;
    
    while (current <= end) {
        slots.push(current);
        const [hours, minutes] = current.split(':').map(Number);
        let totalMinutes = hours * 60 + minutes + 40; // Aangepast naar 40 minuten
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        if (current > end) break;
    }
    return slots;
}

// Create admin account
router.post('/working-hours', async (req, res) => {
    try {
        const timeSlots = generateTimeSlots(req.body.startTime, req.body.endTime);
        const workingHours = await WorkingHours.create({
            ...req.body,
            availableTimeSlots: timeSlots
        });
        res.status(201).json(workingHours);
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
        const timeSlots = generateTimeSlots(req.body.startTime, req.body.endTime);
        const workingHours = await WorkingHours.create({
            ...req.body,
            availableTimeSlots: timeSlots
        });
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

router.put('/appointments/:id/reschedule', async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time } = req.body;

        // Controleer eerst of de nieuwe tijd beschikbaar is
        const existingAppointment = await Appointment.findOne({
            where: {
                date,
                time,
                id: { [Op.ne]: id } // Exclude huidige afspraak
            }
        });

        if (existingAppointment) {
            return res.status(400).json({
                message: 'Dit tijdslot is al bezet'
            });
        }

        // Update de afspraak
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({
                message: 'Afspraak niet gevonden'
            });
        }

        await appointment.update({ date, time });

        res.json({
            success: true,
            appointment
        });
    } catch (error) {
        console.error('Reschedule error:', error);
        res.status(500).json({
            message: 'Er ging iets mis bij het verzetten van de afspraak'
        });
    }
});

router.put('/working-hours/:date', async (req, res) => {
    try {
        const workingHours = await WorkingHours.findOne({
            where: { date: req.params.date }
        });

        if (workingHours) {
            const availableTimeSlots = generateTimeSlots(req.body.startTime, req.body.endTime);
            
            // Filter breaks
            if (req.body.breaks && req.body.breaks.length > 0) {
                const breakTimes = req.body.breaks.flatMap(breakTime => 
                    generateTimeSlots(breakTime.startTime, breakTime.endTime)
                );
                req.body.availableTimeSlots = availableTimeSlots.filter(
                    time => !breakTimes.includes(time)
                );
            } else {
                req.body.availableTimeSlots = availableTimeSlots;
            }
            
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