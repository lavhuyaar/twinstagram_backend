import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import { newPost } from '../controllers/postController';

const uploads = multer();

const postRoutes = Router();
// postRoutes.get('/recommended');

postRoutes.use(verifyToken);
postRoutes.use(verifyUser);

// postRoutes.get('/myposts');
postRoutes.post('/new', uploads.single('image'), newPost);
// postRoutes.put('/post/:postId');
// postRoutes.delete('/post/:postId');

export default postRoutes;
