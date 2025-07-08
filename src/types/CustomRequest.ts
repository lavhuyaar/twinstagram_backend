import { Request } from 'express';

export type CustomRequest = Request & {
  token?: string;
  userId?: string;
};
