import express from 'express';
import {
  UserRegistration,
  Userlogin,
  adminLogin,
  verifyEmail,
  sendResetCode,
  verifyResetCode,
  resetPasswordWithCode, 
  getAllUsers
} from '../controllers/usersController.js';
import adminVerify from '../middleware/adminverify.js';

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
// 👥 Admin - Customer Management
// ===========================
usersRouter.get('/admin/customers', adminVerify, getAllUsers);  // Get all customers (Admin only)

// ===========================
// 🔁 Password Reset Workflow
// ===========================
usersRouter.post('/send-reset-code', sendResetCode);       // Send reset code
usersRouter.post('/verify-reset-code', verifyResetCode);   // Verify reset code
usersRouter.post('/reset-password-code', resetPasswordWithCode); // Reset password

export default usersRouter;