import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import {
  deleteComment,
  deleteSubComment,
  editComment,
  editSubComment,
  getComments,
  getSubComments,
  newComment,
} from '../controllers/commentController';

const commentRoutes = Router();

commentRoutes.use(verifyToken);
commentRoutes.use(verifyUser);

commentRoutes.post('/', newComment);
commentRoutes.put('/:commentId', editComment);
commentRoutes.put('/sub/:commentId', editSubComment);
commentRoutes.delete('/:commentId', deleteComment);
commentRoutes.delete('/sub/:commentId', deleteSubComment);
commentRoutes.get('/post/:postId', getComments);
commentRoutes.get('/comment/:commentId', getSubComments);

export default commentRoutes;
