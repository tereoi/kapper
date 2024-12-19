// server/services/googleCalendarService.js
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

class GoogleCalendarService {
  constructor() {
    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    // Credentials instellen
    this.oauth2Client.setCredentials({
      access_token: process.env.GOOGLE_ACCESS_TOKEN,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN
    });

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async createAppointment(appointment) {
    try {
      // Bereken eindtijd (30 min voor knippen, 45 voor knippen en baard)
      const duration = appointment.service === 'Knippen en baard' ? 45 : 30;
      
      const startDateTime = `${appointment.date}T${appointment.time}:00`;
      const endDateTime = new Date(new Date(startDateTime).getTime() + duration * 60000)
        .toISOString();

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
        // Email herinneringen instellen
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 uur van tevoren
            { method: 'popup', minutes: 60 }       // 1 uur van tevoren
          ],
        },
        // Stuur emails naar klant
        attendees: [
          { email: appointment.email }
        ],
        sendUpdates: 'all'  // Stuur emails naar alle deelnemers
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',  // Gebruikt de hoofdagenda
        resource: event,
      });

      console.log('Event created: %s', response.data.htmlLink);
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error.message);
      throw error;
    }
  }

  // Methode om een afspraak te verwijderen
  async deleteCalendarEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId
      });
      console.log('Event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error.message);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();