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
  const followRequest = await db.follow.create({
    data: {
      requestByUserId: userId,
      requestToUserId: targetUserId,
      isFollowing: targetUserProfileType === 'PRIVATE' ? 'PENDING' : 'TRUE',
    },
  });

  return followRequest;
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

export const getFollowingsByUserId = async (
  targetUserId: string,
  userId: string,
) => {
  const followings = await db.follow.findMany({
    where: {
      AND: [
        { requestByUserId: targetUserId },
        { isFollowing: 'TRUE' },
        {
          OR: [
            {
              requestBy: {
                followers: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
            {
              requestBy: {
                profileType: 'PUBLIC',
              },
            },
            {
              requestBy: {
                id: userId,
              },
            },
          ],
        },
      ],
    },
    include: {
      requestTo: {
        select: {
          followers: {
            where: {
              requestByUserId: userId,
            },
          },
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          profileType: true,
          username: true,
        },
      },
    },
  });

  return followings;
};

export const getFollowersByUserId = async (
  targetUserId: string,
  userId: string,
) => {
  const followers = await db.follow.findMany({
    where: {
      AND: [
        { requestToUserId: targetUserId },
        { isFollowing: 'TRUE' },
        {
          OR: [
            {
              requestTo: {
                followers: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
            {
              requestTo: {
                profileType: 'PUBLIC',
              },
            },
            {
              requestTo: {
                id: userId,
              },
            },
          ],
        },
      ],
    },
    include: {
      requestBy: {
        select: {
          followers: {
            where: {
              requestByUserId: userId,
            },
          },
          id: true,
          firstName: true,
          lastName: true,
          profilePicture: true,
          profileType: true,
          username: true,
        },
      },
    },
  });

  return followers;
};

export const getNotFollowingByUserId = async (userId: string) => {
  const notFollowing = await db.user.findMany({
    where: {
      AND: [
        {
          NOT: {
            followers: {
              some: {
                id: userId,
              },
            },
          },
        },
        {
          NOT: {
            id: userId,
          },
        },
      ],
    },
    omit: {
      password: true,
    },
  });

  return notFollowing;
};

export const getPendingFollowRequests = async (userId: string) => {
  const pendingFollowRequests = await db.follow.findMany({
    where: {
      requestToUserId: userId,
      isFollowing: 'PENDING',
    },
    include: {
      requestBy: {
        omit: {
          password: true,
        },
      },
    },
  });

  return pendingFollowRequests;
};

export const getPendingFollowings = async (userId: string) => {
  const pendingFollowings = await db.follow.findMany({
    where: {
      requestByUserId: userId,
      isFollowing: 'PENDING',
    },
    include: {
      requestTo: {
        omit: {
          password: true,
        },
      },
    },
  });

  return pendingFollowings;
};

export const isRequestSent = async (targetUserId: string, userId: string) => {
  const isRequestCreated = await db.follow.findFirst({
    where: {
      requestByUserId: userId,
      requestToUserId: targetUserId,
    },
  });

  return isRequestCreated;
};
