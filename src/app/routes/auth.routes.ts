import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, telegramLogin } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.post('/telegram', telegramLogin);
router.post('/telegram/register', require('../controllers/auth.controller').completeTelegramRegistration);

export default router;
