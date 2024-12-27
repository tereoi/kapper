// server/routes/auth.js
const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URL
);

// Route om het authenticatie proces te starten
router.get('/google', (req, res) => {
  console.log('Starting OAuth flow...');
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  });
  console.log('Redirecting to:', url);
  res.redirect(url);
});

// Callback route met extra logging
router.get('/google/callback', async (req, res) => {
    console.log('Received callback request');
    console.log('Query params:', req.query);
    
    try {
      const { code } = req.query;
      if (!code) {
        console.error('No code received in callback');
        return res.status(400).send('No authorization code received');
      }
  
      console.log('Getting tokens with code...');
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('Received tokens:', tokens); // Voeg deze regel toe om de tokenwaarden te loggen
      
      console.log('Received tokens:', {
        access_token: tokens.access_token ? 'Present' : 'Missing',
        refresh_token: tokens.refresh_token ? 'Present' : 'Missing',
        expiry_date: tokens.expiry_date
      });
  
      // Sla de tokens op
      process.env.GOOGLE_ACCESS_TOKEN = tokens.access_token;
      process.env.GOOGLE_REFRESH_TOKEN = tokens.refresh_token;

    res.send(`
      <html>
        <body>
          <h1>Authenticatie succesvol!</h1>
          <p>Tokens zijn ontvangen. Je kunt dit venster nu sluiten.</p>
          <pre style="background: #f5f5f5; padding: 10px;">
            Access Token: ${tokens.access_token ? 'Ontvangen' : 'Ontbreekt'}
            Refresh Token: ${tokens.refresh_token ? 'Ontvangen' : 'Ontbreekt'}
          </pre>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).send(`
      <html>
        <body>
          <h1>Er is een fout opgetreden</h1>
          <p>Details: ${error.message}</p>
          <pre style="background: #f5f5f5; padding: 10px;">
            ${error.stack}
          </pre>
        </body>
      </html>
    `);
  }
});

module.exports = router;