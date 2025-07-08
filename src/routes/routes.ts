import { Router } from 'express';
import authRoutes from './authRoutes';

const routes = Router();

routes.use('/v1/auth', authRoutes);

export default routes;
