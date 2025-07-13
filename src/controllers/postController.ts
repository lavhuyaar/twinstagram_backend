import { NextFunction, Response } from 'express';
import { decode } from 'base64-arraybuffer';
import { v4 as uuidv4 } from 'uuid';
import { CustomRequest } from '../types/CustomRequest';
import { validatePost } from '../validators/postValidator';
import { validationResult } from 'express-validator';
import supabase from '../supabase/supabase';
import {
  createNewPost,
  getAllPostsByUserId,
  getPostById,
  getPostsOnFeed,
  getProtectedPostById,
  removePost,
  updatePost,
} from '../db/queries/postQueries';

export const newPost = [
  ...validatePost,
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

    let imageURL: string | null = null;
    let imageId: string | null = null;

    const { content } = req.body;
    const imageFile = req.file; //Image

    // If User uploads an image with post
    if (imageFile) {
      const fileBase64 = decode(imageFile.buffer.toString('base64'));

      imageId = uuidv4(); //Unique imageId, would help in deleting the image from supabase when User deletes the post

      // Adds post image in supabase
      const { data, error } = await supabase.storage
        .from('twinstagram')
        .upload(`Post ${imageId}`, fileBase64, {
          contentType: imageFile.mimetype,
        });

      if (error) {
        console.error(error.message);
        throw error;
      }

      // Gets public URL of uploaded image to store it in DB
      const { data: image } = supabase.storage
        .from('twinstagram')
        .getPublicUrl(data.path);

      imageURL = image.publicUrl; // Public URL
    }

    const post = await createNewPost(userId, content, imageURL, imageId);

    if (!post) {
      res.status(401).json({
        error: 'Failed to create post!',
      });
      return;
    }

    res.status(201).json({
      post,
      success: 'Post created successfully!',
    });
    return;
  },
];

export const editPost = [
  ...validatePost,
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { userId } = req;

    if (!userId) {
      res.status(403).json({
        error: 'Unauthorized Action!',
      });
      return;
    }

    const { postId } = req.params;

    if (!postId) {
      res.status(400).json({
        error: 'Failed to edit post as postId is missing!',
      });
      return;
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(409).json({
        errors: errors.array(),
      });
      return;
    }

    const { content } = req.body;

    const post = await getPostById(postId, userId);

    if (!post) {
      res.status(404).json({
        error: 'Failed to edit post as it does not exist!',
      });
      return;
    }

    const editedPost = await updatePost(postId, userId, content);

    res.status(200).json({
      post: editedPost,
      success: 'Post edited successfully!',
    });
    return;
  },
];

export const deletePost = async (
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

  if (!postId) {
    res.status(400).json({
      error: 'Failed to edit post as postId is missing!',
    });
    return;
  }

  const post = await getPostById(postId, userId);

  if (!post) {
    res.status(404).json({
      error: 'Failed to delete post as it does not exist!',
    });
    return;
  }

  // If post had an image with it
  if (post.image && post.imageId) {
    const { data } = await supabase.storage
      .from('twinstagram')
      .list(`Post ${post.imageId}`);

    // Removes post from supabase
    if (data) {
      await supabase.storage
        .from('twinstagram')
        .remove([`Post ${post.imageId}`]);
    }
  }

  await removePost(postId, userId);

  res.status(200).json({
    success: 'Post deleted successfully!',
  });
  return;
};

export const myPosts = async (
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

  const posts = await getAllPostsByUserId(userId);

  res.status(200).json({
    posts,
    success: 'Posts fetched successfully!',
  });
  return;
};

export const postsOnFeed = async (
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

  const { page, limit } = req.query;

  const safePage: number = !isNaN(Number(page)) ? Number(page) : 1;
  const safeLimit: number = !isNaN(Number(limit)) ? Number(limit) : 20;

  const { totalCount, posts } = await getPostsOnFeed(
    userId,
    safePage,
    safeLimit,
  );

  res.status(200).json({
    posts,
    totalCount,
    success: 'Feed posts fetched successfully!',
  });
  return;
};

export const getPost = async (
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

  const validPost = await getProtectedPostById(postId, userId);

  if (!validPost) {
    res.status(404).json({
      error: 'Post not found!',
    });
    return;
  }

  res.status(200).json({
    post: validPost,
    success: 'Post fetched successfully!',
  });
};
