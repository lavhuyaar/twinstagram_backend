import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import {
  deletePost,
  editPost,
  myPosts,
  newPost,
} from '../controllers/postController';

const uploads = multer();

const postRoutes = Router();
// postRoutes.get('/recommended');

postRoutes.use(verifyToken);
postRoutes.use(verifyUser);

postRoutes.get('/myposts', myPosts);
postRoutes.post('/new', uploads.single('image'), newPost);
postRoutes.put('/:postId', editPost);
postRoutes.delete('/:postId', deletePost);

export default postRoutes;
