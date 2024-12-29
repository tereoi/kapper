// routes/appointments.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const WorkingHours = require('../models/WorkingHours');
const { Op } = require('sequelize');
const googleCalendarService = require('../services/googleCalendarService');
const emailService = require('../services/emailService');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new appointment
router.post('/', async (req, res) => {
  try {
    // Check if timeslot is available
    const existingAppointment = await Appointment.findOne({
      where: { date: req.body.date, time: req.body.time }
    });

    if (existingAppointment) {
      return res.status(400).json({ 
        message: 'Dit tijdslot is al geboekt' 
      });
    }

    // Save appointment to database
    const appointment = await Appointment.create(req.body);

    try {
      // Create Google Calendar event
      const calendarEvent = await googleCalendarService.createAppointment({
        ...req.body,
        id: appointment.id
      });

      // Update appointment with Calendar event ID
      await appointment.update({ 
        calendarEventId: calendarEvent.id
      });

      // Send confirmation email
      await emailService.sendConfirmation(appointment);

      res.status(201).json({
        appointment,
        calendarEvent
      });
    } catch (error) {
      console.error('Error:', error);
      // If Google Calendar sync fails, still try to send confirmation email
      try {
        await emailService.sendConfirmation(appointment);
      } catch (emailError) {
        console.error('Email error:', emailError);
      }
      
      res.status(201).json({
        appointment,
        error: 'Afspraak is gemaakt maar er waren problemen met de synchronisatie'
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Afspraak niet gevonden' });
    }

    // Delete from Google Calendar if event ID exists
    if (appointment.calendarEventId) {
      try {
        await googleCalendarService.deleteCalendarEvent(appointment.calendarEventId);
      } catch (calendarError) {
        console.error('Error deleting calendar event:', calendarError);
      }
    }

    // Send cancellation email
    try {
      await emailService.sendCancellation(appointment);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    await appointment.destroy();
    res.json({ message: 'Afspraak verwijderd' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get available times for a specific date
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

    // Get all appointments for this date
    const bookedTimes = await Appointment.findAll({
      where: { date: req.params.date },
      attributes: ['time']
    });

    // Calculate break times
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
      available: availableSlots.length > 0,
      times: availableSlots
    });
  } catch (error) {
    console.error('Error in available-times:', error);
    res.status(500).json({ 
      message: error.message,
      available: false,
      times: []
    });
  }
});

// Get appointments within date range
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

// Update appointment
router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Afspraak niet gevonden' });
    }

    // Save old details for email
    const oldDate = appointment.date;
    const oldTime = appointment.time;

    // Update appointment
    await appointment.update(req.body);

    // Update Google Calendar if event ID exists
    if (appointment.calendarEventId) {
      try {
        await googleCalendarService.updateCalendarEvent(
          appointment.calendarEventId,
          appointment
        );
      } catch (calendarError) {
        console.error('Calendar update error:', calendarError);
      }
    }

    // Send update email
    try {
      await emailService.sendUpdate(appointment, oldDate, oldTime);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check timeslot availability
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

// Reschedule appointment
router.put('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;

    // Check if new time is available
    const existingAppointment = await Appointment.findOne({
      where: {
        date,
        time,
        id: { [Op.ne]: id }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: 'Dit tijdslot is al bezet'
      });
    }

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({
        message: 'Afspraak niet gevonden'
      });
    }

    // Save old details for email
    const oldDate = appointment.date;
    const oldTime = appointment.time;

    // Update appointment
    await appointment.update({ date, time });

    // Update Google Calendar if event ID exists
    if (appointment.calendarEventId) {
      try {
        await googleCalendarService.updateCalendarEvent(
          appointment.calendarEventId,
          appointment
        );
      } catch (calendarError) {
        console.error('Calendar update error:', calendarError);
      }
    }

    // Send update email
    try {
      await emailService.sendUpdate(appointment, oldDate, oldTime);
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

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

module.exports = router;