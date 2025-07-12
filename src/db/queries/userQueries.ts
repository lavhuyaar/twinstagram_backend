import db from '../db';

export const getUserById = async (id: string) => {
  const user = await db.user.findFirst({
    where: {
      id,
    },
    omit: {
      password: true,
    },
  });

  return user;
};
