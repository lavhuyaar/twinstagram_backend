import { NextFunction, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import {
  acceptPendingRequest,
  createNewRequest,
  deleteRequestById,
  getFollowersByUserId,
  getFollowingsByUserId,
  getNotFollowingByUserId,
  getPendingFollowings,
  getPendingFollowRequests,
  getRequestById,
  getRequestByTargetUserId,
  getRequestToBeAccepted,
} from '../db/queries/followQueries';
import { getProtectedUserById, getUserById } from '../db/queries/userQueries';

// Creates new follow request
export const newFollowRequest = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { targetUserId } = req.params;

  // If User tries to send follow request to himself
  if (userId === targetUserId) {
    res.status(409).json({
      error: 'Cannot send follow request to self!',
    });
    return;
  }

  // Checks if targetUserId is valid
  const existingTargetUser = await getUserById(targetUserId);

  
  if (!existingTargetUser) {
    res.status(404).json({
      error: 'Failed to send follow request as target user is not found!',
    });
    return;
  }
  
  // Checks if there already exists a follow request from User to targetUser
  const isExistingRequest = await getRequestByTargetUserId(
    userId,
    targetUserId,
  );
  
  if (isExistingRequest) {
    res.status(409).json({
      error: 'This follow request already exists!',
    });
    return;
  }
  
  const request = await createNewRequest(
    userId,
    targetUserId,
    existingTargetUser.profileType,
  );

  res.status(201).json({
    request,
    success: 'Follow request sent successfully!',
  });
  return;
};

export const acceptRequest = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { requestId } = req.params;

  const followRequest = await getRequestToBeAccepted(requestId, userId);

  if (!followRequest) {
    res.status(404).json({
      error: 'Cannot find follow request!',
    });
    return;
  }

  // If follow request has already been accepted
  if (followRequest.isFollowing === 'TRUE') {
    res.status(409).json({
      error: 'Follow request has already been accepted!',
    });
    return;
  }

  const acceptedRequest = await acceptPendingRequest(requestId, userId);

  if (!acceptRequest) {
    res.status(500).json({
      error: 'An error occured in accepting follow request!',
    });
    return;
  }

  res.status(200).json({
    request: acceptedRequest,
    success: 'Follow request accepted!',
  });
};

export const deleteRequest = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { requestId } = req.params;

  //Ensures that pending Request is valid
  const existingRequest = await getRequestById(requestId);

  //This ensures that only the users between whom this request exists can delete it (be it pending or accepted)
  if (
    !existingRequest ||
    (existingRequest.requestByUserId !== userId &&
      existingRequest.requestToUserId !== userId)
  ) {
    res.status(404).json({
      error: 'Cannot find follow request!',
    });
    return;
  }

  await deleteRequestById(requestId);

  const successMessage: string =
    existingRequest.isFollowing === 'PENDING'
      ? existingRequest.requestByUserId === userId
        ? 'Follow request deleted successfully!'
        : 'Follow request rejected successfully!'
      : existingRequest.requestByUserId === userId
        ? 'User unfollowed successfully!'
        : 'User removed from following successfully!';

  res.status(200).json({
    success: successMessage,
  });
  return;
};

export const getFollowings = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { targetUserId } = req.params;

  // Checks if targetUserId is valid
  const existingTargetUser = await getProtectedUserById(targetUserId, userId);

  if (!existingTargetUser) {
    res.status(404).json({
      error: 'Failed to fetch followings!',
    });
    return;
  }

  const followings = await getFollowingsByUserId(targetUserId, userId);

  res.status(200).json({
    followings,
    success: 'Followings fetched successfully!',
  });
  return;
};

export const getFollowers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }
  const { targetUserId } = req.params;

  // Checks if targetUserId is valid
  const existingTargetUser = await getProtectedUserById(targetUserId, userId);

  if (!existingTargetUser) {
    res.status(404).json({
      error: 'Failed to fetch followers!',
    });
    return;
  }

  const followers = await getFollowersByUserId(targetUserId, userId);

  res.status(200).json({
    followers,
    success: 'Followers fetched successfully!',
  });
  return;
};

// List of people not following the User
export const notFollowing = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const usersNotFollowing = await getNotFollowingByUserId(userId);

  res.status(200).json({
    usersNotFollowing,
    success: 'Users not following fetched successfully!',
  });
  return;
};

export const pendingFollowRequests = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const allPendingFollowRequests = await getPendingFollowRequests(userId);

  if (!allPendingFollowRequests) {
    res.status(500).json({
      error: 'Failed to fetch received pending follow requests!',
    });
    return;
  }

  res.status(200).json({
    pendingFollowRequests: allPendingFollowRequests,
    success: 'Received follow requests (pending) fetched successfully!',
  });
  return;
};

export const pendingFollowingRequests = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const allPendingFollowings = await getPendingFollowings(userId);

  if (!allPendingFollowings) {
    res.status(500).json({
      error: 'Failed to fetch sent follow requests!',
    });
    return;
  }

  res.status(200).json({
    pendingFollowings: allPendingFollowings,
    success: 'Sent follow requests (pending) fetched successfully!',
  });
  return;
};
