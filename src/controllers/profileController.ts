import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { decode } from 'base64-arraybuffer';
import { CustomRequest } from '../types/CustomRequest';
import supabase from '../supabase/supabase';
import { validateProfile } from '../validators/profileValidator';
import {
  getUserById,
  isUsernameAvailable,
  updateProfileType,
  updateUser,
} from '../db/queries/userQueries';
import { isUserFollowing } from '../db/queries/followQueries';
import { Follow } from '@prisma/client';

export const editProfile = [
  ...validateProfile,
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

    let profilePictureURL: string | null = null;

    const { firstName, lastName, username, profilePicture, profileType } =
      req.body;
    const pfpFile = req.file; //Image

    // If User uploads a profile picture
    if (pfpFile) {
      const fileBase64 = decode(pfpFile.buffer.toString('base64'));

      // Adds or replaces profile image in supabase
      const { data, error } = await supabase.storage
        .from('twinstagram')
        .upload(`Profile ${userId}`, fileBase64, {
          contentType: pfpFile.mimetype,
          upsert: true,
        });

      if (error) {
        console.error(error.message);
        throw error;
      }

      // Gets public URL of uploaded image to store it in DB
      const { data: image } = supabase.storage
        .from('twinstagram')
        .getPublicUrl(data.path);

      profilePictureURL = `${image.publicUrl}?t=${Date.now()}`; // Public URL
    } else if (profilePicture) {
      profilePictureURL = profilePicture;
    } else {
      // If User does not upload image (intentionally removes it)
      const { data } = await supabase.storage
        .from('twinstagram')
        .list(`Profile ${userId}`);

      // If User had a profile picture before
      if (data) {
        // Sending no profile picture removes the previously uploaded pfp from supabase
        await supabase.storage
          .from('twinstagram')
          .remove([`Profile ${userId}`]);
      }
      //Ensures that URL is removed from DB as well
      profilePictureURL = null;
    }
    //Checks if username already exists
    const isUsernameExists = await isUsernameAvailable(username, userId);

    if (isUsernameExists) {
      res.status(409).json({
        error: 'This username already exists!',
      });
      return;
    }

    const updatedProfile = await updateUser(
      userId,
      username,
      firstName,
      lastName,
      profileType,
      profilePictureURL,
    );

    if (!updatedProfile) {
      res.status(401).json({
        error: 'Failed to update Profile!',
      });
      return;
    }

    res.status(200).json({
      user: updatedProfile,
      success: 'Profile updated successfully!',
    });
    return;
  },
];

export const getProfile = async (
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

  const { targetUserId } = req.params;

  const targetUser = await getUserById(targetUserId);

  if (!targetUser) {
    res.status(404).json({
      error: 'Target User not found!',
    });
    return;
  }

  // Eases the authorization of checking followings and followers for Frontend
  if (userId === targetUserId) {
    res.status(200).json({
      profile: targetUser,
      success: 'Profile fetched successfully!',
      type: 'SELF',
      isFollowing: false,
    });
    return;
  }

  const isFollowing = await isUserFollowing(targetUserId, userId);

  if (!isFollowing) {
    if (targetUser.profileType === 'PUBLIC') {
      res.status(200).json({
        profile: targetUser,
        success: 'Profile fetched successfully!',
        type: 'PUBLIC',
        isFollowing: false,
      });
      return;
    } else {
      delete (targetUser as { followers?: Follow[] }).followers;
      delete (targetUser as { followings?: Follow[] }).followings;

      res.status(200).json({
        profile: targetUser,
        success: 'Profile fetched successfully!',
        type: 'PRIVATE',
        isFollowing: false,
      });
      return;
    }
  }
};

export const toggleProfileType = async (
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

  const { profileType } = req.query;

  if (profileType !== 'PUBLIC' && profileType !== 'PRIVATE') {
    res.status(400).json({
      error: 'profileType param not found!',
    });
    return;
  }

  const updatedUser = await updateProfileType(userId, profileType);

  res.status(200).json({
    success:
      updatedUser.profileType === 'PRIVATE'
        ? 'Private Mode enabled successfully!'
        : 'Private Mode disabled successfully!',
    user: updatedUser,
  });
  return;
};
