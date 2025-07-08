import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { CustomRequest } from '../types/CustomRequest';
const JWT_SECRET_KEY: string | undefined = process.env.JWT_SECRET_KEY; //Secret JWT Key

export const verifyUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.token) {
    res.status(403).json({
      message: 'Unauthorized Action: Auth token not found!',
    });
    return;
  }

  if (!JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY not found!');
  }

  //Verifies token
  jwt.verify(req.token, JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      res.status(403).json({
        error: err.message,
      });
      return;
    }
    //If userData is valid
    if (typeof decoded === 'object') {
      req.userId = decoded?.user?.id;
      next();
    } else {
      res.status(403).json({
        error: 'Unauthorized Action!',
      });
      return;
    }
  });
};
