import sgMail from '@sendgrid/mail';

// Securely load SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Fallback if CLIENT_URL isn't set
const CLIENT_URL =
  (process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith('http'))
    ? process.env.CLIENT_URL.trim()
    : 'https://tctrl.netlify.app';

/**
 * Sends a styled verification email using SendGrid
 * @param {string} to - Email recipient
 * @param {string} subject - Email subject
 * @param {string} token - Unique verification token
 */
const sendEmail = async (to, subject, token) => {
  try {
    const verificationLink = `${CLIENT_URL}/verify?token=${encodeURIComponent(token)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; color: #111;">
        <div style="text-align: center;">
          <img src="https://res.cloudinary.com/dj3r6un9z/image/upload/v1746557604/tctrl/logo.png" alt="TCTRL Logo" style="width: 80px; margin-bottom: 20px;" />
        </div>
        <h2 style="font-size: 22px; margin-bottom: 10px;">Welcome, ${to.split('@')[0]}!</h2>
        <p style="font-size: 16px; line-height: 1.6;">
          Thanks for joining <strong>TCTRL</strong> – the ultimate fashion experience.
          <br/><br/>
          To complete your registration, please verify your email below:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        <p style="font-size: 14px; color: #555;">
          This link will expire in 24 hours.<br/>
          If you didn’t request this, you can safely ignore it.
        </p>
        <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; ${new Date().getFullYear()} TCTRL Fashion</p>
      </div>
    `;

    const msg = {
      to,
      from: 'tctrl.fashion.ac@outlook.com', // ✅ Must match verified sender
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`✅ Verification email sent to ${to}`);
  } catch (error) {
    const detail = error?.response?.body?.errors || error.message || error;
    console.error('❌ SendGrid Error:', detail);
    throw new Error('Failed to send verification email');
  }
};

export default sendEmail;
