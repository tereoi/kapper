const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const WorkingHours = require('../models/WorkingHours');
const { Op } = require('sequelize');

function generateTimeSlots(start, end) {
  const slots = [];
  let current = start;
  
  while (current <= end) {
    slots.push(current);
    const [hours, minutes] = current.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + 30;
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    current = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    if (current > end) break;
  }
  return slots;
}

router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

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

    const breakTimeSlots = workingHours.breaks?.flatMap(breakTime => {
      return workingHours.availableTimeSlots.filter(slot => {
        const slotParts = slot.split(':').map(Number);
        const slotMinutes = slotParts[0] * 60 + slotParts[1];
        
        const startParts = breakTime.startTime.split(':').map(Number);
        const startMinutes = startParts[0] * 60 + startParts[1];
        
        const endParts = breakTime.endTime.split(':').map(Number);
        const endMinutes = endParts[0] * 60 + endParts[1];
        
        return slotMinutes >= startMinutes && slotMinutes < endMinutes;
      });
    }) || [];

    const bookedTimesList = bookedTimes.map(booking => booking.time);
    const availableSlots = workingHours.availableTimeSlots
      .filter(time => !bookedTimesList.includes(time) && !breakTimeSlots.includes(time))
      .sort((a, b) => {
        const [aHours, aMinutes] = a.split(':').map(Number);
        const [bHours, bMinutes] = b.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
      });

    res.json({
      available: true,
      times: availableSlots
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const appointments = await Appointment.findAll({
      where: {
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['date', 'ASC'], ['time', 'ASC']]
    });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Afspraak niet gevonden' });
    }
    await appointment.update(req.body);
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/check-availability', async (req, res) => {
  try {
    const { date, time } = req.body;
    
    const workingHours = await WorkingHours.findOne({
      where: { date }
    });

    if (!workingHours) {
      return res.json({ 
        available: false, 
        message: 'Deze datum is niet beschikbaar voor afspraken' 
      });
    }

    const isBreakTime = workingHours.breaks?.some(breakTime => {
      const timeParts = time.split(':').map(Number);
      const timeMinutes = timeParts[0] * 60 + timeParts[1];
      
      const startParts = breakTime.startTime.split(':').map(Number);
      const startMinutes = startParts[0] * 60 + startParts[1];
      
      const endParts = breakTime.endTime.split(':').map(Number);
      const endMinutes = endParts[0] * 60 + endParts[1];
      
      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    }) || false;

    if (isBreakTime) {
      return res.json({
        available: false,
        message: 'Dit tijdslot valt binnen een pauze periode'
      });
    }

    const existingAppointment = await Appointment.findOne({
      where: { date, time }
    });

    res.json({
      available: !existingAppointment,
      message: existingAppointment ? 'Dit tijdslot is al geboekt' : 'Tijdslot is beschikbaar'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;