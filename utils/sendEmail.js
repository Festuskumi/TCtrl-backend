import sgMail from '@sendgrid/mail';

// Load API key from environment
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email using SendGrid
 * @param {string} to - Recipient email address
 * @param {string} subject - Subject of the email
 * @param {string} html - HTML content of the email
 */
const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      to,
      from: 'tctrl.fashion.ac@outlook.com', // ✅ Verified sender in SendGrid
      subject,
      html
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error('❌ SendGrid Error:', error?.response?.body || error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
