import db from '../db';

export const createNewPost = async (
  userId: string,
  content: string,
  image: string | null,
  imageId: string | null,
) => {
  const post = await db.post.create({
    data: {
      userId,
      content,
      image,
      imageId,
    },
  });

  return post;
};
