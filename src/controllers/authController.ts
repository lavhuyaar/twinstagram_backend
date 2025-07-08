import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';

import { validateRegisterUser } from '../validators/authValidator';
import { validationResult } from 'express-validator';
import { createNewUser, getUserByUsername } from '../db/queries/authQueries';

export const registerUser = [
  ...validateRegisterUser,
  async (req: Request, res: Response, next: NextFunction) => {
    // Validates req.body
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }

    const { username, firstName, lastName, password } = req.body;

    const existingUser = await getUserByUsername(username);

    if (existingUser) {
      res.status(409).json({
        error: 'This username already exists!',
      });
      return;
    }

    const hashedPassword: string = await bcrypt.hash(password, 10); //Hashed password

    const user = await createNewUser(
      username,
      firstName,
      lastName,
      hashedPassword,
    );

    if (!user) {
      res.status(500).json({
        error: 'Failed to register user!',
      });
      return;
    }

    res.status(201).json({
      user,
      success: 'User registered successfully!',
    });
    return;
  },
];
