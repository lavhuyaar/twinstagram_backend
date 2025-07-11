import { body } from 'express-validator';

export const validateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Comment must be between 1 and 200 characters.'),
];
