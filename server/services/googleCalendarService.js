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

      if (process.env.GOOGLE_ACCESS_TOKEN && process.env.GOOGLE_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          access_token: process.env.GOOGLE_ACCESS_TOKEN,
          refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });
      }

      this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
    } catch (error) {
      console.error('Error initializing Google Calendar service:', error);
      throw error;
    }
  }

  async createAppointment(appointment) {
    try {
      const startDateTime = `${appointment.date}T${appointment.time}:00`;
      const endDateTime = new Date(new Date(startDateTime).getTime() + 40 * 60000)
        .toISOString()
        .split('.')[0];
  
      const event = {
        summary: `🪒 ${appointment.name} - ${appointment.service}`,
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
            { method: 'popup', minutes: 60 }
          ],
        }
      };
  
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'none',
        sendNotifications: false
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
            { method: 'popup', minutes: 60 }
          ],
        }
      };

      const response = await this.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
        sendUpdates: 'none',
        sendNotifications: false
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
        sendUpdates: 'none',
        sendNotifications: false
      });
      console.log('Event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();