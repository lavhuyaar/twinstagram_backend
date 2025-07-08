import { Router } from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/authController';
import { verifyToken } from '../middlewares/verifyToken';

const authRoutes = Router();

authRoutes.post('/register', registerUser);
authRoutes.post('/login', loginUser);
authRoutes.get('/logout', verifyToken, logoutUser)

export default authRoutes;
