import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import { deleteComment, editComment, getComments, getSubComments, newComment } from '../controllers/commentController';

const commentRoutes = Router();

commentRoutes.use(verifyToken);
commentRoutes.use(verifyUser);

commentRoutes.post('/', newComment);
commentRoutes.put('/:commentId', editComment);
commentRoutes.delete('/:commentId', deleteComment);
commentRoutes.get('/post/:postId', getComments);
commentRoutes.get('/comment/:commentId', getSubComments);

export default commentRoutes;
