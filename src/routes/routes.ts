import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';

const routes = Router();

routes.use('/v1/auth', authRoutes);
routes.use('/v1/profile', profileRoutes);

export default routes;
