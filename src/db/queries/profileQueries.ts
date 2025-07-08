import db from '../db';

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
    },
  });

  return user;
};
