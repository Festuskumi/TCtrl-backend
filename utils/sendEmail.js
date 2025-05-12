import sgMail from '@sendgrid/mail';

// Load API key securely from .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Adjust this to match your live frontend
const CLIENT_URL = process.env.CLIENT_URL || 'https://tctrl.netlify.app';

/**
 * Sends an email using SendGrid with a verification link
 * @param {string} to - Email recipient
 * @param {string} subject - Email subject
 * @param {string} token - JWT or unique token
 */
const sendEmail = async (to, subject, token) => {
  try {
    const link = `${CLIENT_URL}/verify?token=${token}`;
    const html = `
      <div style="font-family:Arial,sans-serif; padding:20px;">
        <h2 style="color:#222;">Verify Your TCTRL Account</h2>
        <p>Thank you for signing up. Please click the button below to verify your email:</p>
        <a href="${link}" style="display:inline-block;margin:20px 0;padding:10px 20px;background-color:#000;color:#fff;text-decoration:none;border-radius:4px;">
          Verify Now
        </a>
        <p>If you didn’t request this, you can safely ignore it.</p>
        <p style="font-size:12px;color:#888;">© TCTRL Fashion</p>
      </div>
    `;

    const msg = {
      to,
      from: 'tctrl.fashion.ac@outlook.com', // ✅ verified sender in SendGrid
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${to}`);
  } catch (error) {
    console.error('❌ SendGrid Error:', error?.response?.body || error);
    throw new Error('Failed to send verification email');
  }
};

export default sendEmail;
