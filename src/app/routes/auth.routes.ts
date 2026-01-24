import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, telegramLogin, verifyEmail } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.post('/telegram', telegramLogin);
router.post('/telegram/register', require('../controllers/auth.controller').completeTelegramRegistration);
router.post('/telegram/reset-request', require('../controllers/auth.controller').telegramResetPasswordRequest);
router.post('/verify-email', verifyEmail);

export default router;
