import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';

const commentRoutes = Router();

commentRoutes.use(verifyToken);
commentRoutes.use(verifyUser);

export default commentRoutes;
