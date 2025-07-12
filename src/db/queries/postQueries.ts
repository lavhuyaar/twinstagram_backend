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

export const getProtectedPostById = async (id: string, userId: string) => {
  const post = await db.post.findFirst({
    where: {
      AND: [
        { id },
        {
          OR: [
            {
              userId,
            },
            {
              user: {
                profileType: 'PUBLIC',
              },
            },
            {
              user: {
                followers: {
                  some: {
                    requestByUserId: userId,
                    isFollowing: 'TRUE',
                  },
                },
              },
            },
          ],
        },
      ],
    },
  });

  return post;
};

export const getCommentsByPostId = async (postId: string) => {
  const comments = await db.comment.findMany({
    where: {
      postId,
      repliedToCommentId: null,
    },
  });

  return comments;
};

export const toggleLike = async (id: string, userId: string) => {
  const isPostAlreadyLiked = await db.post.findFirst({
    where: {
      AND: [
        { id },
        {
          likes: {
            some: {
              id: userId,
            },
          },
        },
      ],
    },
  });

  const connectUser = {
    connect: {
      id: userId,
    },
  };

  const disconnectUser = {
    disconnect: {
      id: userId,
    },
  };

  const post = await db.post.update({
    where: {
      id,
    },
    data: {
      likes: isPostAlreadyLiked ? disconnectUser : connectUser,
    },
    include: {
      likes: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  });

  return post;
};
