import db from '../db';

export const getUserByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  return user;
};

export const createNewUser = async (
  username: string,
  firstName: string,
  lastName: string,
  password: string,
) => {
  const user = await db.user.create({
    data: {
      username,
      firstName,
      lastName,
      password,
    },
  });

  return user;
};

export const isUsernameAvailable = async (username: string, id: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
      NOT: {
        id,
      },
    },
  });

  return user;
};

export const updateUser = async (
  id: string,
  username: string,
  firstName: string,
  lastName: string,
  profileType: 'PUBLIC' | 'PRIVATE',
  profilePicture?: string | null,
) => {
  const user = await db.user.update({
    where: {
      id,
    },
    data: {
      username,
      firstName,
      lastName,
      profilePicture,
      profileType,
    },
  });

  return user;
};

export const getUserById = async (id: string) => {
  const user = await db.user.findFirst({
    where: {
      id,
    },
    include: {
      followers: {
        where: {
          isFollowing: 'TRUE',
        },
      },
      following: {
        where: {
          isFollowing: 'TRUE',
        },
      },
      _count: {
        select: {
          posts: true,
          followers: {
            where: {
              isFollowing: 'TRUE',
            },
          },
          following: {
            where: {
              isFollowing: 'TRUE',
            },
          },
        },
      },
    },
    omit: {
      password: true,
    },
  });

  return user;
};

export const getProtectedUserById = async (
  targetUserId: string,
  userId: string,
) => {
  const user = await db.user.findFirst({
    where: {
      AND: [
        { id: targetUserId },
        {
          OR: [
            {
              followers: {
                some: {
                  id: userId,
                },
              },
            },
            {
              id: userId,
            },
            {
              profileType: 'PUBLIC',
            },
          ],
        },
      ],
    },
  });

  return user;
};

export const updateProfileType = async (
  userId: string,
  profileType: 'PUBLIC' | 'PRIVATE',
) => {
  const user = await db.user.update({
    where: {
      id: userId,
    },
    data: {
      profileType,
    },
  });

  // Ensures all the follow requests sent to user (private before) are automatically approved
  if (profileType === 'PUBLIC') {
    await db.follow.updateMany({
      where: {
        requestToUserId: userId,
      },
      data: {
        isFollowing: 'TRUE',
      },
    });
  }

  return user;
};

export const getAllUsers = async (userId: string, search = '') => {
  const users = await db.user.findMany({
    where: {
      AND: [
        {
          NOT: {
            id: userId,
          },
        },
        {
          OR: [
            {
              username: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      ],
    },
    include: {
      followers: {
        where: {
          requestByUserId: userId,
        },
      },
    },
    omit: {
      password: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
};
