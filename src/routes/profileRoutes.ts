import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import {
  editProfile,
  getProfile,
  toggleProfileType,
} from '../controllers/profileController';

const upload = multer();

const profileRoutes = Router();

profileRoutes.use(verifyToken);
profileRoutes.use(verifyUser);
profileRoutes.put('/', upload.single('profilePicture'), editProfile);
profileRoutes.get('/:targetUserId', getProfile);
profileRoutes.put('/type/toggle', toggleProfileType);

export default profileRoutes;
