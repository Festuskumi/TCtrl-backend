import usersModels from "../Models/userModels.js";
import jwt from 'jsonwebtoken';
import validator from "validator";
import bcrypt from 'bcryptjs';
import sendEmail from "../utils/sendEmail.js";

const logoUrl = 'https://res.cloudinary.com/dj3r6un9z/image/upload/v1746557604/tctrl/logo.png';
const CreateToken = (id) => jwt.sign({ id }, process.env.JWT_CODE, { expiresIn: '7d' });

// ----------------------
// User Login
// ----------------------
const Userlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await usersModels.findOne({ email });
    if (!user) return res.json({ success: false, message: "Account does not exist with this email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.json({ success: false, message: 'Invalid login details' });

    const token = CreateToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ----------------------
// User Registration
// ----------------------
const UserRegistration = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!validator.isEmail(email)) return res.json({ success: false, message: "Please provide a valid email" });

    const exist = await usersModels.findOne({ email });
    if (exist) return res.json({ success: false, message: "Account already exists with this email" });

    if (password.length < 8 || !/[!@#$%^&*(),.?":{}|<>]/.test(password) || !/\d/.test(password)) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long and include a special character and a number",
      });
    }

    const salt = await bcrypt.genSalt(11);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = new usersModels({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      verificationCode,
      verificationCodeExpires: Date.now() + 10 * 60 * 1000,
    });

    const user = await newUser.save();
    const token = CreateToken(user._id);

    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #fff;">
        <img src="${logoUrl}" alt="TCTRL Logo" style="max-width: 140px; margin-bottom: 20px;" />
        <h2 style="color: #111;">Welcome, ${user.name}!</h2>
        <p style="color: #333;">Your <strong>TCTRL</strong> verification code is:</p>
        <h1 style="font-size: 36px; letter-spacing: 6px; background: #111; color: #fff; padding: 10px; border-radius: 6px; display: inline-block;">${verificationCode}</h1>
        <p style="color: #555; margin-top: 20px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
      </div>
    `;

    await sendEmail(user.email, 'Your TCTRL Verification Code', html);

    res.json({
      success: true,
      token,
      message: 'Registration successful! A verification code has been sent to your email.',
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ----------------------
// Verify Email by Code
// ----------------------
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  try {
    const user = await usersModels.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVerified) {
      const token = CreateToken(user._id);
      return res.status(200).json({ message: 'Already verified', token });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return res.status(400).json({ message: 'Incorrect verification code' });
    }

    if (Date.now() > user.verificationCodeExpires) {
      return res.status(400).json({ message: 'Verification code expired' });
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    await user.save();

    const token = CreateToken(user._id);
    res.status(200).json({ message: 'Email verified successfully!', token });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  res.json({ success: false, message: 'Invalid admin credentials' });
};

// ----------------------
// Send Reset Code
// ----------------------
const sendResetCode = async (req, res) => {
  const { email } = req.body;
  const user = await usersModels.findOne({ email });

  if (!user) return res.json({ success: false, message: "No account with this email" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  user.resetCode = { code, expires };
  await user.save();

  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #fff;">
      <img src="${logoUrl}" alt="TCTRL Logo" style="max-width: 120px; margin-bottom: 20px;" />
      <h2 style="color: #111;">Password Reset Request</h2>
      <p style="color: #333;">Your 6-digit verification code is:</p>
      <h1 style="font-size: 36px; letter-spacing: 6px; background: #111; color: #fff; padding: 10px; border-radius: 6px; display: inline-block;">${code}</h1>
      <p style="color: #555; margin-top: 20px;">This code expires in 10 minutes. Please do not share it with anyone.</p>
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
  resetPasswordWithCode,
};
