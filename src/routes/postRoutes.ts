import { Router } from 'express';
import multer from 'multer';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import {
  deletePost,
  editPost,
  getPost,
  myPosts,
  newPost,
  postsOnFeed,
  toggleLikeOnPost,
} from '../controllers/postController';

const uploads = multer();

const postRoutes = Router();

postRoutes.use(verifyToken);
postRoutes.use(verifyUser);

postRoutes.get('/myposts', myPosts);
postRoutes.post('/new', uploads.single('image'), newPost);
postRoutes.put('/:postId', editPost);
postRoutes.delete('/:postId', deletePost);
postRoutes.post('/like/:postId', toggleLikeOnPost);
postRoutes.get('/feed', postsOnFeed);
postRoutes.get('/post/:postId', getPost);

export default postRoutes;
