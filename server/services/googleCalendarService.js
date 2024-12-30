const { google } = require('googleapis');
const { OAuth2 } = google.auth;

class GoogleCalendarService {
  constructor() {
    // Controleer of alle benodigde omgevingsvariabelen aanwezig zijn
    this.validateEnvironmentVariables();

    this.oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    // Stel credentials in met extra foutafhandeling
    try {
      this.oauth2Client.setCredentials({
        access_token: process.env.GOOGLE_ACCESS_TOKEN,
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      });
    } catch (error) {
      console.error('Fout bij het instellen van Google credentials:', error);
      throw error;
    }

    // Voeg token refresh logging toe
    this.oauth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        console.log('Nieuwe refresh token ontvangen');
        // Hier kun je de nieuwe refresh token veilig opslaan
      }
      console.log('Access token vernieuwd');
    });

    // Maak calendar service aan met extra configuratie
    this.calendar = google.calendar({ 
      version: 'v3', 
      auth: this.oauth2Client 
    });
  }

  // Valideer omgevingsvariabelen voordat ze worden gebruikt
  validateEnvironmentVariables() {
    const requiredEnvVars = [
      'GOOGLE_CLIENT_ID', 
      'GOOGLE_CLIENT_SECRET', 
      'GOOGLE_REDIRECT_URL', 
      'GOOGLE_ACCESS_TOKEN', 
      'GOOGLE_REFRESH_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      throw new Error(`Ontbrekende Google OAuth omgevingsvariabelen: ${missingVars.join(', ')}`);
    }
  }

  // Methode voor het maken van een afspraak
  async createAppointment(appointment) {
    try {
      // Genereer start- en eindtijd met robuuste datum/tijd parsing
      const startDate = new Date(`${appointment.date}T${appointment.time}`);
      
      // Controleer of de datum geldig is
      if (isNaN(startDate.getTime())) {
        throw new Error(`Ongeldige datum of tijd: ${appointment.date} ${appointment.time}`);
      }

      const startDateTime = startDate.toISOString();
      const endDateTime = new Date(startDate.getTime() + 40 * 60000).toISOString();

      // Configureer calendar event met uitgebreide details
      const event = {
        summary: `🪒 Afspraak: ${appointment.service}`,
        description: `
          Klant: ${appointment.name}
          Email: ${appointment.email}
          Telefoon: ${appointment.phone}
          Service: ${appointment.service}
        `.trim(),
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
            { method: 'email', minutes: 24 * 60 },  // 24 uur van tevoren
            { method: 'popup', minutes: 60 },       // 1 uur van tevoren
          ],
        },
        attendees: [{ email: appointment.email }],
      };

      // Voeg extra logging toe voor debugging
      console.log('Aanmaken Google Calendar event met details:', JSON.stringify(event, null, 2));

      // Maak de afspraak aan
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      console.log('Afspraak succesvol aangemaakt:', response.data.htmlLink);
      return response.data;

    } catch (error) {
      // Uitgebreide foutafhandeling en logging
      console.error('Fout bij het aanmaken van Google Calendar event:', error);
      
      // Log gedetailleerde foutinformatie
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      }

      throw error;
    }
  }

  // Methode voor het updaten van een bestaande afspraak
  async updateCalendarEvent(eventId, appointment) {
    try {
      const startDate = new Date(`${appointment.date}T${appointment.time}`);
      
      if (isNaN(startDate.getTime())) {
        throw new Error(`Ongeldige datum of tijd: ${appointment.date} ${appointment.time}`);
      }

      const startDateTime = startDate.toISOString();
      const endDateTime = new Date(startDate.getTime() + 40 * 60000).toISOString();

      const event = {
        summary: `🪒 Afspraak: ${appointment.service}`,
        description: `
          Klant: ${appointment.name}
          Email: ${appointment.email}
          Telefoon: ${appointment.phone}
          Service: ${appointment.service}
        `.trim(),
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

      console.log('Afspraak succesvol bijgewerkt:', response.data.htmlLink);
      return response.data;

    } catch (error) {
      console.error('Fout bij het bijwerken van Google Calendar event:', error);
      throw error;
    }
  }

  // Methode voor het verwijderen van een afspraak
  async deleteCalendarEvent(eventId) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });

      console.log('Afspraak succesvol verwijderd:', eventId);
    } catch (error) {
      console.error('Fout bij het verwijderen van Google Calendar event:', error);
      throw error;
    }
  }
}

module.exports = new GoogleCalendarService();