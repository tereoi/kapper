const { google } = require('googleapis');
const readline = require('readline');

const CLIENT_ID = '1027193192776-8rv127kknnb689t40qhgmtc8hudm5ude.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://api.ezcuts.nl/auth/google/callback';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

// Genereer de URL voor Google OAuth
const scopes = [
  'https://www.googleapis.com/auth/calendar', 
  'https://www.googleapis.com/auth/calendar.events'
];

const url = oauth2Client.generateAuthUrl({
  access_type: 'offline', 
  scope: scopes
});

console.log('Volg deze stappen voor PRODUCTIE tokens:');
console.log('1. Open deze URL in je browser:');
console.log(url);
console.log('\n2. Nadat je inlogt en toestemming geeft, wordt je doorgestuurd naar een pagina met een code in de URL');
console.log('3. Kopieer ALLEEN de code (tussen code= en & in de URL)');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('\nPlak hier de code die je hebt gekregen: ', (code) => {
  rl.close();
  
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('Fout bij ophalen token:', err);
      return;
    }
    
    console.log('\n--- KOPIEER DEZE TOKENS NAAR JE .ENV BESTAND VOOR PRODUCTIE ---');
    console.log('GOOGLE_ACCESS_TOKEN=' + token.access_token);
    console.log('GOOGLE_REFRESH_TOKEN=' + token.refresh_token);
    console.log('--- EINDE VAN DE TOKENS ---');
  });
});