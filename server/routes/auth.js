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
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  });
  console.log('Redirecting to:', url);
  res.redirect(url);
});

// Callback route met verbeterde error handling en logging
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
    
    console.log('Tokens received:', {
      access_token: tokens.access_token ? 'Present' : 'Missing',
      refresh_token: tokens.refresh_token ? 'Present' : 'Missing',
      expiry_date: tokens.expiry_date
    });

    res.send(`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .token { word-break: break-all; }
          </style>
        </head>
        <body>
          <h1>Authenticatie succesvol! ✅</h1>
          <p>Gebruik deze tokens in je Render environment variables:</p>
          <div class="token">
            <h3>Access Token:</h3>
            <pre>${tokens.access_token}</pre>
          </div>
          <div class="token">
            <h3>Refresh Token:</h3>
            <pre>${tokens.refresh_token}</pre>
          </div>
          <p><strong>Vergeet niet:</strong></p>
          <ol>
            <li>Kopieer deze tokens</li>
            <li>Ga naar je Render dashboard</li>
            <li>Voeg ze toe als environment variables:
              <ul>
                <li>GOOGLE_ACCESS_TOKEN</li>
                <li>GOOGLE_REFRESH_TOKEN</li>
              </ul>
            </li>
            <li>Deploy je applicatie opnieuw</li>
          </ol>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).send(`
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .error { color: #dc3545; }
          </style>
        </head>
        <body>
          <h1 class="error">Er is een fout opgetreden ❌</h1>
          <p>Details: ${error.message}</p>
          <pre>${error.stack}</pre>
        </body>
      </html>
    `);
  }
});

module.exports = router;