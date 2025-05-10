import express from 'express';
import { Userlogin, UserRegistration, adminLogin, verifyEmail, sendResetCode, verifyResetCode, resetPasswordWithCode } from '../controllers/usersController.js';

const usersRouter = express.Router();

usersRouter.post('/register', UserRegistration)
usersRouter.post('/login', Userlogin)
usersRouter.post('/admin', adminLogin)
usersRouter.get('/verify', verifyEmail);
usersRouter.post('/send-reset-code', sendResetCode);
usersRouter.post('/verify-reset-code', verifyResetCode);
usersRouter.post('/reset-password-code', resetPasswordWithCode);


export default usersRouter;