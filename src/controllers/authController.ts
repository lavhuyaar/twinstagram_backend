import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  validateLoginUser,
  validateRegisterUser,
} from '../validators/authValidator';
import { validationResult } from 'express-validator';
import { createNewUser, getUserByUsername } from '../db/queries/authQueries';

const JWT_SECRET_KEY: string | undefined = process.env.JWT_SECRET_KEY;

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

export const loginUser = [
  ...validateLoginUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        errors: errors.array(),
      });
      return;
    }

    const { username, password } = req.body;

    const user = await getUserByUsername(username);

    // If user with this username does not exist
    if (!user) {
      res.status(409).json({ error: 'This username does not exist!' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password.trim());

    if (!isMatch) {
      res.status(409).json({
        error: 'Incorrect password!',
      });
      return;
    }

    if (!JWT_SECRET_KEY) {
      throw new Error('JWT_SECRET_KEY not found!');
    }

    delete (user as { password?: string }).password;

    //JWT Token
    const token: string = jwt.sign({ user }, JWT_SECRET_KEY, {
      expiresIn: '7 days', //Valid for 7 days
    });

    res
      .status(200)
      .cookie('token', token, {
        // sameSite: 'strict', //Only to be un-commented after the FE is deployed
        // secure: true,
        httpOnly: true,
        maxAge: 6 * 24 * 60 * 60 * 1000,
      }) //Http only cookie
      .json({
        user,
        success: 'User logged in successfully!',
      });
  },
];

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res
    .status(200)
    .clearCookie('token', {
      httpOnly: true,
    })
    .json({ success: 'User logged out successfully!' });

  return;
};
