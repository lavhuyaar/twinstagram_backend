import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import postRoutes from './postRoutes';

const routes = Router();

routes.use('/v1/auth', authRoutes);
routes.use('/v1/profile', profileRoutes);
routes.use('/v1/posts', postRoutes);

export default routes;
