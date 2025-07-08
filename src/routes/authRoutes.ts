import { Router } from 'express';
import { registerUser } from '../controllers/authController';

const authRoutes = Router();

authRoutes.post('/register', registerUser);

export default authRoutes;
