import usersModels from "../Models/userModels.js";
import jwt from 'jsonwebtoken';
import validator from "validator";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";

const logoUrl = 'https://res.cloudinary.com/dj3r6un9z/image/upload/v1746557604/tctrl/logo.png';

const CreateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_CODE);
};

// ----------------------
// User Login
// ----------------------
const Userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usersModels.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "Account does not exist with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = CreateToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: 'Invalid login details' });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------
// User Registration
// ----------------------
const UserRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await usersModels.findOne({ email });
    if (exist) return res.json({ success: false, message: "Account already exists with this email" });

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please provide a valid email" });
    }

    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || !/\d/.test(password)) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long and include a special character and a number",
      });
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new usersModels({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const user = await newUser.save();
    const token = CreateToken(user._id);

    const verifyToken = jwt.sign({ email: user.email }, process.env.JWT_CODE, { expiresIn: '1d' });
    const verifyLink = `${process.env.CLIENT_URL}/verify?token=${verifyToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <img src="${logoUrl}" alt="TCTRL Logo" style="max-width: 140px; margin-bottom: 20px;" />
        <h2>Welcome, ${user.name}!</h2>
        <p>Thanks for joining <strong>TCTRL</strong> – the ultimate fashion experience.</p>
        <p>To complete your registration, please verify your email below:</p>
        <a href="${verifyLink}" style="display: inline-block; margin-top: 15px; background-color: #000; color: #fff; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Verify Email
        </a>
        <p style="margin-top: 15px;">This link will expire in 24 hours.</p>
      </div>
    `;

    await sendEmail(user.email, 'Welcome to TCTRL – Verify Your Email', html);

    res.json({
      success: true,
      token,
      message: 'Registration successful! Please check your email to verify your account.',
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ----------------------
// Admin Login
// ----------------------
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_MAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ email, role: 'admin' }, process.env.JWT_CODE, { expiresIn: '1d' });
    return res.json({ success: true, token });
  }

  return res.json({ success: false, message: 'Invalid admin credentials' });
};

// ----------------------
// Email Verification
// ----------------------
const verifyEmail = async (req, res) => {
  const token = req.query.token;

  try {
    const decoded = jwt.verify(token, process.env.JWT_CODE);
    const user = await usersModels.findOne({ email: decoded.email });

    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// ----------------------
// Send Reset Code
// ----------------------
const sendResetCode = async (req, res) => {
  const { email } = req.body;
  const user = await usersModels.findOne({ email });

  if (!user) return res.json({ success: false, message: "No account with this email" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  user.resetCode = { code, expires };
  await user.save();

  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
      <img src="${logoUrl}" alt="TCTRL Logo" style="max-width: 120px; margin-bottom: 20px;" />
      <h2>Password Reset Request</h2>
      <p>Your 6-digit verification code is:</p>
      <h1 style="font-size: 36px; letter-spacing: 6px; color: #000;">${code}</h1>
      <p>This code expires in 10 minutes. Please do not share it with anyone.</p>
    </div>
  `;

  await sendEmail(email, "Your TCTRL Reset Code", html);
  res.json({ success: true, message: "Verification code sent to your email" });
};

// ----------------------
// Verify Reset Code
// ----------------------
const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  const user = await usersModels.findOne({ email });
  if (!user || !user.resetCode) return res.json({ success: false, message: "Invalid request" });

  const { code: storedCode, expires } = user.resetCode;

  if (storedCode !== code) return res.json({ success: false, message: "Code does not match" });
  if (Date.now() > new Date(expires)) return res.json({ success: false, message: "Code expired" });

  res.json({ success: true, message: "Code verified" });
};

// ----------------------
// Reset Password
// ----------------------
const resetPasswordWithCode = async (req, res) => {
  const { email, newPassword } = req.body;

  const user = await usersModels.findOne({ email });
  if (!user) return res.json({ success: false, message: "User not found" });

  const salt = await bcrypt.genSalt(11);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetCode = undefined;

  await user.save();

  res.json({ success: true, message: "Password has been reset successfully" });
};

export {
  Userlogin,
  UserRegistration,
  adminLogin,
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPasswordWithCode
};
