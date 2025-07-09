import { NextFunction, Response } from 'express';
import { validationResult } from 'express-validator';
import { decode } from 'base64-arraybuffer';
import { CustomRequest } from '../types/CustomRequest';
import supabase from '../supabase/supabase';
import { validateProfile } from '../validators/profileValidator';
import { isUsernameAvailable, updateUser } from '../db/queries/profileQueries';

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
