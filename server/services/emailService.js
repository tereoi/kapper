// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const formatDate = (dateString) => {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const date = new Date(dateString);
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const emailService = {
  // Bevestigingsmail voor nieuwe afspraak
  sendConfirmation: async (appointment) => {
    try {
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Bevestiging van je afspraak',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Hallo ${appointment.name},</h2>
            <p>Je afspraak is bevestigd! Hieronder vind je de details:</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Datum:</strong> ${formatDate(appointment.date)}</p>
              <p style="margin: 5px 0;"><strong>Tijd:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${appointment.service}</p>
            </div>

            <p style="color: #666;">
              De afspraak duurt 40 minuten. Kom op tijd, dan kunnen we op tijd beginnen.
            </p>

            <p style="color: #666; margin-top: 30px;">
              Wil je de afspraak verzetten of annuleren? Neem dan contact met mij op.
            </p>

            <p style="margin-top: 30px;">
              Tot ziens!<br>
              Issie
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to:', appointment.email);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  },

  // Mail voor gewijzigde afspraak
  sendUpdate: async (appointment, oldDate, oldTime) => {
    try {
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Je afspraak is gewijzigd',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Hallo ${appointment.name},</h2>
            <p>Je afspraak is gewijzigd. Hieronder vind je de nieuwe details:</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #666;">Oude afspraak:</h3>
              <p style="margin: 5px 0;"><strong>Datum:</strong> ${formatDate(oldDate)}</p>
              <p style="margin: 5px 0;"><strong>Tijd:</strong> ${oldTime}</p>

              <h3 style="margin-top: 20px; color: #666;">Nieuwe afspraak:</h3>
              <p style="margin: 5px 0;"><strong>Datum:</strong> ${formatDate(appointment.date)}</p>
              <p style="margin: 5px 0;"><strong>Tijd:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${appointment.service}</p>
            </div>

            <p style="color: #666;">
              Past deze nieuwe tijd toch niet? Neem dan contact met mij op.
            </p>

            <p style="margin-top: 30px;">
              Tot ziens!<br>
              Issie
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Update email sent to:', appointment.email);
    } catch (error) {
      console.error('Error sending update email:', error);
      throw error;
    }
  },

  // Mail voor geannuleerde afspraak
  sendCancellation: async (appointment) => {
    try {
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Je afspraak is geannuleerd',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Hallo ${appointment.name},</h2>
            <p>Je afspraak is geannuleerd. Het ging om de volgende afspraak:</p>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Datum:</strong> ${formatDate(appointment.date)}</p>
              <p style="margin: 5px 0;"><strong>Tijd:</strong> ${appointment.time}</p>
              <p style="margin: 5px 0;"><strong>Service:</strong> ${appointment.service}</p>
            </div>

            <p>
              Wil je een nieuwe afspraak maken? Dat kan via onze website.
            </p>

            <p style="margin-top: 30px;">
              Met vriendelijke groet,<br>
              Issie
            </p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Cancellation email sent to:', appointment.email);
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  }
};

module.exports = emailService;