import { Router } from 'express';
import { verifyToken } from '../middlewares/verifyToken';
import { verifyUser } from '../middlewares/verifyUser';
import {
  acceptRequest,
  deleteRequest,
  newFollowRequest,
} from '../controllers/followController';

const followRoutes = Router();

followRoutes.use(verifyToken);
followRoutes.use(verifyUser);

followRoutes.post('/new/:targetUserId', newFollowRequest); //Create new follow request
followRoutes.put('/request/:requestId/accept', acceptRequest); //Accept follow request
followRoutes.delete('/:requestId', deleteRequest); //Delete follow requests (pending or accepted)
// followRoutes.get('/followings/:targetUserId'); //Followings of a user
// followRoutes.get('/followers/:targetUserId'); //Followers of a user
// followRoutes.get('/notFollowing'); //List of users not followed by the User
// followRoutes.get('/pending/followRequests'); //Pending requests received by User
// followRoutes.get('/pending/followingRequests'); //Pending requests sent to User

export default followRoutes;
