// services/googleCalendarService.js
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

class GoogleCalendarService {
  constructor() {
    try {
      this.oauth2Client = new OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URL
      );

      this.oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });

      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    } catch (error) {
      console.error('Fout bij initialiseren Google Calendar service:', error);
      throw error;
    }
  }

  async createAppointment(appointment) {
    try {
      const startDateTime = `${appointment.date}T${appointment.time}:00`;
      const endDateTime = new Date(new Date(startDateTime).getTime() + 40 * 60000)
        .toISOString()
        .split('.')[0]; // Verwijder milliseconds en Z timezone marker

      const event = {
        summary: `🪒 Afspraak: ${appointment.service}`,
        description: `
          Klant: ${appointment.name}
          Email: ${appointment.email}
          Telefoon: ${appointment.phone}
          Service: ${appointment.service}
        `,
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Amsterdam',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
        attendees: [{ email: appointment.email }],
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      console.log('Event created:', response.data.htmlLink);
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  async updateCalendarEvent(eventId, appointment) {
    try {
      const startDateTime = `${appointment.date}T${appointment.time}:00`;
      const endDateTime = new Date(new Date(startDateTime).getTime() + 40 * 60000)
        .toISOString()
        .split('.')[0];

      const event = {
        summary: `🪒 Afspraak: ${appointment.service}`,
        description: `
          Klant: ${appointment.name}
          Email: ${appointment.email}
          Telefoon: ${appointment.phone}
          Service: ${appointment.service}
        `,
        start: {
          dateTime: startDateTime,
          timeZone: 'Europe/Amsterdam',
        },
        end: {
          dateTime: endDateTime,
          timeZone: 'Europe/Amsterdam',
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 60 },
          ],
        },
        attendees: [{ email: appointment.email }],
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return response.data;
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  async deleteCalendarEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      console.log('Event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Helper methode voor het ophalen van beschikbare tijden
  async getAvailableSlots(date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching calendar slots:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();