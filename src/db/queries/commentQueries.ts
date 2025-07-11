import db from '../db';

export const createNewComment = async (
  content: string,
  userId: string,
  postId: string,
  repliedToCommentId?: string,
) => {
  const comment = await db.comment.create({
    data: {
      content,
      userId,
      postId,
      repliedToCommentId,
    },
  });

  return comment;
};

export const getMyCommentById = async (commentId: string, userId: string) => {
  const comment = await db.comment.findUnique({
    where: {
      id: commentId,
      userId,
    },
  });

  return comment;
};

export const updateComment = async (id: string, content: string) => {
  const comment = await db.comment.update({
    where: {
      id,
    },
    data: {
      content,
    },
  });

  return comment;
};

export const getCommentById = async (id: string, userId: string) => {
  const comment = await db.comment.findFirst({
    where: {
      AND: [
        { id },
        {
          OR: [
            {
              userId,
            },
            {
              post: {
                userId,
              },
            },
          ],
        },
      ],
    },
  });

  return comment;
};

export const removeComment = async (id: string) => {
  // Deletes all the replied comments along with the main comment
  await db.comment.deleteMany({
    where: {
      repliedToCommentId: id,
    },
  });

  await db.comment.deleteMany({
    where: {
      id,
    },
  });
};

export const getMainComment = async (id: string, userId: string) => {
  const comment = db.comment.findFirst({
    where: {
      AND: [
        { id },
        { repliedToCommentId: null },
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

  return comment;
};

export const getSubCommentsByCommentId = async (commentId: string) => {
  const comments = await db.comment.findMany({
    where: {
      repliedToCommentId: commentId,
    },
  });

  return comments;
};
