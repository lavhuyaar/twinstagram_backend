import { Router } from 'express';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import postRoutes from './postRoutes';
import commentRoutes from './commentRoutes';
import followRoutes from './followRoutes';

const routes = Router();

routes.use('/v1/auth', authRoutes);
routes.use('/v1/profile', profileRoutes);
routes.use('/v1/posts', postRoutes);
routes.use('/v1/comments', commentRoutes);
routes.use('/v1/follow', followRoutes);

export default routes;
