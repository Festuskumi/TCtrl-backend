import sgMail from '@sendgrid/mail';

// Load API key securely from .env
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Set fallback frontend URL
const CLIENT_URL = process.env.CLIENT_URL?.trim() || 'https://tctrl.netlify.app';

/**
 * Sends a verification email via SendGrid.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} token - Unique verification token
 */
const sendEmail = async (to, subject, token) => {
  try {
    const verificationLink = `${CLIENT_URL}/verify?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family:Arial,sans-serif; max-width:600px; margin:auto; padding:20px; background:#f9f9f9; border-radius:8px;">
        <h2 style="color:#000;">Welcome to <span style="color:#e60023;">TCTRL</span>!</h2>
        <p style="font-size:16px; color:#333;">Click the button below to verify your email and activate your account:</p>
        <a href="${verificationLink}" style="display:inline-block; margin:20px 0; padding:12px 24px; background-color:#000; color:#fff; text-decoration:none; border-radius:5px; font-weight:bold;">
          Verify Email
        </a>
        <p style="font-size:14px; color:#666;">If you didn’t request this email, you can safely ignore it.</p>
        <p style="font-size:12px; color:#aaa;">&copy; ${new Date().getFullYear()} TCTRL Fashion</p>
      </div>
    `;

    const msg = {
      to,
      from: 'tctrl.fashion.ac@outlook.com', // ✅ Must be verified in SendGrid
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    const errDetail = error?.response?.body?.errors || error.message;
    console.error('❌ SendGrid Error:', errDetail);
    throw new Error('Failed to send verification email');
  }
};

export default sendEmail;
