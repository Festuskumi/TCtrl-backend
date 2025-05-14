import sgMail from '@sendgrid/mail';

// Securely load SendGrid API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends a styled verification email using a 6-digit code
 * @param {string} to - Email recipient
 * @param {string} subject - Email subject
 * @param {string} code - 6-digit verification code
 */
const sendEmail = async (to, subject, code) => {
  try {
    const html = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; color: #111;">
   
    <p style="font-size: 16px; line-height: 1.6;">
      Thanks for joining <strong>TCTRL</strong> – the ultimate fashion experience.
    </p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="display: inline-block; padding: 12px 24px; font-size: 24px; font-weight: bold; background-color: #000; color: #fff; border-radius: 6px; letter-spacing: 4px;">
        ${code}
      </div>
    </div>
   
    <p style="font-size: 12px; text-align: center; color: #aaa;">&copy; ${new Date().getFullYear()} TCTRL Fashion</p>
  </div>
`;


    const msg = {
      to,
      from: 'tctrl.fashion.ac@outlook.com', // ✅ Must match verified SendGrid sender
      subject,
      html,
    };

    await sgMail.send(msg);
    console.log(`✅ Verification code email sent to ${to}`);
  } catch (error) {
    const detail = error?.response?.body?.errors || error.message || error;
    console.error('❌ SendGrid Error:', detail);
    throw new Error('Failed to send verification email');
  }
};

export default sendEmail;
