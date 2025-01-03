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

const isWithin24Hours = (appointmentDateTime) => {
  const now = new Date();
  const appointment = new Date(appointmentDateTime);
  const diffInHours = (appointment - now) / (1000 * 60 * 60);
  return diffInHours <= 24 && diffInHours > 0;
};

const emailService = {
  async sendConfirmation(appointment) {
    try {
      // Bevestigingsmail voor de klant
      const mailOptions = {
        from: `"Kapper" <${process.env.EMAIL_USER}>`,
        to: appointment.email,
        subject: 'Bevestiging van je afspraak',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Afspraak Bevestigd!</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Beste ${appointment.name},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">
                Bij deze bevestigen wij je afspraak. Hieronder vind je de details:
              </p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <div style="margin-bottom: 15px;">
                <strong style="color: #555;">Datum:</strong>
                <p style="color: #333; margin: 5px 0;">${formatDate(appointment.date)}</p>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #555;">Tijd:</strong>
                <p style="color: #333; margin: 5px 0;">${appointment.time}</p>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #555;">Service:</strong>
                <p style="color: #333; margin: 5px 0;">${appointment.service}</p>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>Tot snel!</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log('Confirmation email sent to:', appointment.email);

      // Check voor afspraak binnen 24 uur en stuur mail naar kapper indien nodig
      const appointmentDateTime = `${appointment.date}T${appointment.time}:00`;
      if (isWithin24Hours(appointmentDateTime)) {
        const hairdresserMailOptions = {
          from: `"Afspraken Systeem" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          subject: `⚠️ Nieuwe afspraak vandaag om ${appointment.time} - ${appointment.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin-bottom: 10px;">Nieuwe Afspraak Binnen 24 Uur</h1>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #333; font-size: 16px; line-height: 1.5;">
                  Er is een nieuwe afspraak ingepland die binnen 24 uur plaatsvindt:
                </p>
              </div>

              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Klant:</strong>
                  <p style="color: #333; margin: 5px 0;">${appointment.name}</p>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Datum:</strong>
                  <p style="color: #333; margin: 5px 0;">${formatDate(appointment.date)}</p>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Tijd:</strong>
                  <p style="color: #333; margin: 5px 0;">${appointment.time}</p>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Service:</strong>
                  <p style="color: #333; margin: 5px 0;">${appointment.service}</p>
                </div>
                <div style="margin-bottom: 15px;">
                  <strong style="color: #555;">Contact:</strong>
                  <p style="color: #333; margin: 5px 0;">
                    Email: ${appointment.email}<br>
                    Telefoon: ${appointment.phone}
                  </p>
                </div>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(hairdresserMailOptions);
        console.log('Urgent notification email sent to hairdresser');
      }
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Afspraak Gewijzigd</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Beste ${appointment.name},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">
                Je afspraak is succesvol gewijzigd. Hieronder vind je de nieuwe details:
              </p>
            </div>

            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <div style="margin-bottom: 15px;">
                <strong style="color: #555;">Nieuwe datum:</strong>
                <p style="color: #333; margin: 5px 0;">${formatDate(appointment.date)}</p>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #555;">Nieuwe tijd:</strong>
                <p style="color: #333; margin: 5px 0;">${appointment.time}</p>
              </div>
              <div style="margin-bottom: 15px;">
                <strong style="color: #555;">Service:</strong>
                <p style="color: #333; margin: 5px 0;">${appointment.service}</p>
              </div>
            </div>

            <div style="margin-top: 30px; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>Tot snel!</p>
            </div>
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
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin-bottom: 10px;">Afspraak Geannuleerd</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">
                Beste ${appointment.name},
              </p>
              <p style="color: #333; font-size: 16px; line-height: 1.5;">
                Je afspraak voor ${formatDate(appointment.date)} om ${appointment.time} is geannuleerd.
              </p>
            </div>

            <div style="margin-top: 30px; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p>We hopen je snel weer te zien!</p>
            </div>
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