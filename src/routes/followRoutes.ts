import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import {
  acceptRequest,
  deleteRequest,
  getFollowers,
  getFollowings,
  newFollowRequest,
  notFollowing,
  pendingFollowingRequests,
  pendingFollowRequests,
} from '../controllers/followController';

const followRoutes = Router();

followRoutes.use(verifyToken);
followRoutes.use(verifyUser);

followRoutes.post('/new/:targetUserId', newFollowRequest);
followRoutes.put('/request/:requestId/accept', acceptRequest);
followRoutes.delete('/:requestId', deleteRequest);
followRoutes.get('/followings/:targetUserId', getFollowings);
followRoutes.get('/followers/:targetUserId', getFollowers);
followRoutes.get('/notFollowing', notFollowing);
followRoutes.get('/pending/followRequests', pendingFollowRequests);
followRoutes.get('/pending/followingRequests', pendingFollowingRequests);

export default followRoutes;
