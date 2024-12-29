// server/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
});

const sendAppointmentEmail = async (appointment, type = 'confirmation') => {
  const subject = type === 'confirmation' 
    ? 'Bevestiging van je afspraak' 
    : 'Herinnering: Je afspraak morgen';

  const mailOptions = {
    from: `"Kapper" <${process.env.EMAIL_USER}>`,
    to: appointment.email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hallo ${appointment.name},</h2>
        <p>${type === 'confirmation' ? 'Bedankt voor je boeking!' : 'Herinnering voor je afspraak morgen.'}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Afspraakdetails:</h3>
          <p><strong>Datum:</strong> ${appointment.date}</p>
          <p><strong>Tijd:</strong> ${appointment.time}</p>
          <p><strong>Service:</strong> ${appointment.service}</p>
        </div>

        <p>Tot ziens!</p>
        <p>Met vriendelijke groet,<br>Je kapper</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendRescheduleEmail = async (appointment, oldDate, oldTime) => {
  const mailOptions = {
    from: `"Kapper" <${process.env.EMAIL_USER}>`,
    to: appointment.email,
    subject: 'Je afspraak is verzet',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Beste ${appointment.name},</h2>
        <p>Je afspraak is verzet naar een nieuwe datum en tijd.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #666;">Oude afspraak:</h3>
          <p><strong>Datum:</strong> ${oldDate}</p>
          <p><strong>Tijd:</strong> ${oldTime}</p>
          
          <h3 style="margin-top: 20px; color: #666;">Nieuwe afspraak:</h3>
          <p><strong>Datum:</strong> ${appointment.date}</p>
          <p><strong>Tijd:</strong> ${appointment.time}</p>
          <p><strong>Service:</strong> ${appointment.service}</p>
        </div>

        <p>Tot ziens!</p>
        <p>Met vriendelijke groet,<br>Je kapper</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendCancellationEmail = async (appointment) => {
  const mailOptions = {
    from: `"Kapper" <${process.env.EMAIL_USER}>`,
    to: appointment.email,
    subject: 'Je afspraak is geannuleerd',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Beste ${appointment.name},</h2>
        <p>Je afspraak is geannuleerd.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Geannuleerde afspraak:</h3>
          <p><strong>Datum:</strong> ${appointment.date}</p>
          <p><strong>Tijd:</strong> ${appointment.time}</p>
          <p><strong>Service:</strong> ${appointment.service}</p>
        </div>

        <p>Als je een nieuwe afspraak wilt maken, kun je dat doen via onze website.</p>
        <p>Met vriendelijke groet,<br>Je kapper</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { 
  sendAppointmentEmail, 
  sendRescheduleEmail,
  sendCancellationEmail 
};