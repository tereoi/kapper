// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    type: 'login', // Expliciet LOGIN authenticatietype
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const formatDate = (dateString) => {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
  const months = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
  const date = new Date(dateString);
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const emailService = {
  async sendConfirmation(appointment) {
    try {
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Bevestiging van je afspraak',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Hallo ${appointment.name},</h2>
            <p>Je afspraak is bevestigd! Hier zijn de details:</p>
            <p><strong>Datum:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Tijd:</strong> ${appointment.time}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to:', appointment.email);
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      throw error;
    }
  },

  async sendUpdate(appointment, oldDate, oldTime) {
    try {
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Je afspraak is gewijzigd',
        html: `
          <div>
            <h2>Hallo ${appointment.name},</h2>
            <p>Je afspraak is gewijzigd naar:</p>
            <p><strong>Datum:</strong> ${formatDate(appointment.date)}</p>
            <p><strong>Tijd:</strong> ${appointment.time}</p>
            <p><strong>Service:</strong> ${appointment.service}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Update email sent to:', appointment.email);
    } catch (error) {
      console.error('Error sending update email:', error);
      throw error;
    }
  },

  async sendCancellation(appointment) {
    try {
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Je afspraak is geannuleerd',
        html: `
          <div>
            <h2>Hallo ${appointment.name},</h2>
            <p>Je afspraak is geannuleerd.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Cancellation email sent to:', appointment.email);
    } catch (error) {
      console.error('Error sending cancellation email:', error);
      throw error;
    }
  },
};

module.exports = emailService;
