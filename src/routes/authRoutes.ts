import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/authController';

const authRoutes = Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);

export default authRoutes;
