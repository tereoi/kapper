const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const WorkingHours = require('../models/WorkingHours');

// Helper functie voor tijdsloten
function generateTimeSlots(start, end) {
  const slots = [];
  let currentTime = start;
  
  while (currentTime < end) {
    slots.push(currentTime);
    const [hours, minutes] = currentTime.split(':').map(Number);
    let newMinutes = minutes + 15;
    let newHours = hours;
    
    if (newMinutes >= 60) {
      newMinutes = 0;
      newHours += 1;
    }
    
    currentTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  }
  
  return slots;
}

// Krijg alle afspraken
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Maak nieuwe afspraak
router.post('/', async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verwijder afspraak
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Afspraak niet gevonden' });
    }
    await appointment.destroy();
    res.json({ message: 'Afspraak verwijderd' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available times
router.get('/available-times/:date', async (req, res) => {
  try {
    const workingHours = await WorkingHours.findOne({
      where: { date: req.params.date }
    });

    if (!workingHours) {
      return res.json({ 
        available: false, 
        message: 'Geen werktijden beschikbaar voor deze datum',
        times: [] 
      });
    }

    const bookedTimes = await Appointment.findAll({
      where: { date: req.params.date },
      attributes: ['time']
    });

    const bookedTimesList = bookedTimes.map(booking => booking.time);
    const availableSlots = generateTimeSlots(workingHours.startTime, workingHours.endTime)
      .filter(time => !bookedTimesList.includes(time));

    res.json({
      available: true,
      times: availableSlots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;