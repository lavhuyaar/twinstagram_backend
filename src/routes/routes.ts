import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import postRoutes from './postRoutes';
import commentRoutes from './commentRoutes';

const routes = Router();

routes.use('/v1/auth', authRoutes);
routes.use('/v1/profile', profileRoutes);
routes.use('/v1/posts', postRoutes);
routes.use('/v1/comments', commentRoutes);

export default routes;
