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

export const getPostById = async (id: string, userId: string) => {
  const post = await db.post.findUnique({
    where: {
      id,
      userId,
    },
  });

  return post;
};

export const updatePost = async (
  id: string,
  userId: string,
  content: string,
) => {
  const post = await db.post.update({
    where: {
      id,
      userId,
    },
    data: {
      content,
    },
  });

  return post;
};

export const removePost = async (id: string, userId: string) => {
  await db.post.delete({
    where: {
      id,
      userId,
    },
  });
};

export const getAllPostsByUserId = async (userId: string) => {
  const posts = await db.post.findMany({
    where: {
      userId,
    },
  });

  return posts;
};
