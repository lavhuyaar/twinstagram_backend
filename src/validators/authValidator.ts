import { body } from 'express-validator';

export const validateRegisterUser = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('First name must be between 2 and 30 characters.')
    .isAlpha()
    .withMessage('First name must contain only alphabets.'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Last name must be between 2 and 30 characters.')
    .isAlpha()
    .withMessage('Last name must contain only alphabets.'),
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Username must be between 2 and 30 characters.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];

export const validateLoginUser = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Username must be between 2 and 30 characters.'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.'),
];
