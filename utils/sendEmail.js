import sgMail from '@sendgrid/mail';

// Set the API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.ADMIN_MAIL, // must be a verified sender in SendGrid
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error('❌ SendGrid Error:', error.response?.body || error.message);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
