import db from '../db';

export const createNewComment = async (
  content: string,
  userId: string,
  postId: string,
) => {
  const comment = await db.comment.create({
    data: {
      content,
      userId,
      postId,
    },
    include: {
      _count: true,
    },
  });

  return comment;
};

export const createNewSubComment = async (
  content: string,
  userId: string,
  parentCommentId: string,
) => {
  const comment = await db.subComment.create({
    data: {
      content,
      userId,
      parentCommentId,
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

export const getMySubCommentById = async (
  commentId: string,
  userId: string,
) => {
  const comment = await db.subComment.findFirst({
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

export const updateSubComment = async (id: string, content: string) => {
  const comment = await db.subComment.update({
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
  await db.subComment.deleteMany({
    where: {
      parentCommentId: id,
    },
  });

  await db.comment.deleteMany({
    where: {
      id,
    },
  });
};

export const removeSubComment = async (id: string) => {
  await db.subComment.delete({
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
  const comments = await db.subComment.findMany({
    where: {
      parentCommentId: commentId,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return comments;
};

export const getCommentsByPostId = async (postId: string) => {
  const comments = await db.comment.findMany({
    where: {
      postId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
      _count: true,
    },
  });

  return comments;
};
