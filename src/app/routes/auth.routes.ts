import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, telegramLogin } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.post('/telegram', telegramLogin);

export default router;
