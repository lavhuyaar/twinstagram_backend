import { NextFunction, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';
import { validateComment } from '../validators/commentValidator';
import { validationResult } from 'express-validator';
import {
  createNewComment,
  getCommentById,
  getMainComment,
  getMyCommentById,
  getSubCommentsByCommentId,
  removeComment,
  updateComment,
} from '../db/queries/commentQueries';
import {
  getCommentsByPostId,
  getProtectedPostById,
} from '../db/queries/postQueries';

export const newComment = [
  ...validateComment,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId) {
      res.status(403).json({
        error: 'Unauthorized Action!',
      });
      return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }

    const { content, postId, repliedToCommentId } = req.body;

    if (!postId) {
      res.status(400).json({
        error: 'Post Id is missing. It cannot be empty!',
      });
      return;
    }

    const comment = await createNewComment(
      content,
      userId,
      postId,
      repliedToCommentId,
    );

    if (!comment) {
      res.status(401).json({
        error: 'Failed to create comment!',
      });
      return;
    }

    res.status(201).json({
      comment,
      success: 'Comment created successfully!',
    });
    return;
  },
];

export const editComment = [
  ...validateComment,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId) {
      res.status(403).json({
        error: 'Unauthorized Action!',
      });
      return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }

    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await getMyCommentById(commentId, userId);

    if (!comment) {
      res.status(404).json({
        error: 'Failed to edit comment as it does not exist!',
      });

      return;
    }

    const editedComment = await updateComment(commentId, content);

    if (!editedComment) {
      res.status(401).json({
        error: 'Failed to edit comment!',
      });
      return;
    }

    res.status(200).json({
      comment: editedComment,
      success: 'Comment edited successfully!',
    });
    return;
  },
];

export const deleteComment = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { commentId } = req.params;

  const validComment = await getCommentById(commentId, userId);

  if (!validComment) {
    res.status(404).json({
      error: 'Failed to delete comment as it does not exist!',
    });

    return;
  }

  await removeComment(commentId);

  res.status(200).json({
    success: 'Comment deleted successfully!',
  });
  return;
};

export const getComments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { postId } = req.params;

  const post = await getProtectedPostById(postId, userId);

  if (!post) {
    res.status(404).json({
      error: 'Failed to get comments as Post id is invalid!',
    });
    return;
  }

  const comments = await getCommentsByPostId(postId);

  res.status(200).json({
    comments,
    success: 'Comments fetched successfully!',
  });
  return;
};

export const getSubComments = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const { userId } = req;

  if (!userId) {
    res.status(403).json({
      error: 'Unauthorized Action!',
    });
    return;
  }

  const { commentId } = req.params;

  const mainComment = await getMainComment(commentId, userId);

  if (!mainComment) {
    res.status(404).json({
      error: 'Failed to get comments as Comment id is invalid!',
    });
    return;
  }

  const subComments = await getSubCommentsByCommentId(commentId);

  res.status(200).json({
    subComments,
    success: 'Sub-comments fetched successfully!',
  });
  return;
};
