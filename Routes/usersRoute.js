import express from 'express';
import {
  UserRegistration,
  Userlogin,
  adminLogin,
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPasswordWithCode
} from '../controllers/usersController.js';

const usersRouter = express.Router();

// ===========================
// 📦 Public User Auth Routes
// ===========================
usersRouter.post('/register', UserRegistration);           // Register user
usersRouter.post('/login', Userlogin);                     // Login user
usersRouter.post('/verify-code', verifyEmail);             // Verify email via code

// ===========================
// 🔐 Admin Authentication
// ===========================
usersRouter.post('/admin', adminLogin);                    // Admin login

// ===========================
// 🔁 Password Reset Workflow
// ===========================
usersRouter.post('/send-reset-code', sendResetCode);       // Send reset code
usersRouter.post('/verify-reset-code', verifyResetCode);   // Verify reset code
usersRouter.post('/reset-password-code', resetPasswordWithCode); // Reset password

export default usersRouter;
