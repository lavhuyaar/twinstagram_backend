import db from '../db';

export const getUserByUsername = async (username: string) => {
  const user = await db.user.findUnique({
    where: {
      username,
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
