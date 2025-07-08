import { NextFunction, Response } from 'express';
import { CustomRequest } from '../types/CustomRequest';

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized Action: Auth token is missing!',
    });
    return;
  }

  req.token = token;
  next();
};
