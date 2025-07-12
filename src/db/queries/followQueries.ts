import db from '../db';

export const getRequestByTargetUserId = async (
  userId: string,
  targetUserId: string,
) => {
  const followRequest = await db.follow.findFirst({
    where: {
      requestByUserId: userId,
      requestToUserId: targetUserId,
    },
  });

  return followRequest;
};

export const createNewRequest = async (
  userId: string,
  targetUserId: string,
  targetUserProfileType: 'PRIVATE' | 'PUBLIC',
) => {
  const request = await db.follow.create({
    data: {
      requestByUserId: userId,
      requestToUserId: targetUserId,
      isFollowing: targetUserProfileType === 'PRIVATE' ? 'PENDING' : 'TRUE',
    },
  });

  return request;
};

export const getRequestToBeAccepted = async (id: string, userId: string) => {
  const followRequest = await db.follow.findFirst({
    where: {
      id,
      requestToUserId: userId,
    },
  });

  return followRequest;
};

export const acceptPendingRequest = async (id: string, userId: string) => {
  const followRequest = await db.follow.update({
    where: {
      id,
      requestToUserId: userId,
    },
    data: {
      isFollowing: 'TRUE',
    },
  });

  return followRequest;
};

export const getRequestById = async (id: string) => {
  const followRequest = await db.follow.findFirst({
    where: {
      id,
      NOT: {
        isFollowing: 'FALSE',
      },
    },
  });

  return followRequest;
};

export const deleteRequestById = async (id: string) => {
  await db.follow.delete({
    where: {
      id,
    },
  });
};
