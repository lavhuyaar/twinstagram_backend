import { body } from 'express-validator';

export const validateProfile = [
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
  body('profileType')
    .trim()
    .isIn(['PUBLIC', 'PRIVATE'])
    .withMessage('Profile type must be either public or private.'),

  body('profilePicture')
    .optional()
    .custom((_, { req }) => {
      const file = req.file;
      const isStringInput = typeof req.body.profilePicture === 'string';

      // Allow string input (e.g., existing image URL or base64)
      if (isStringInput) {
        return true;
      }

      // No file uploaded
      if (!file) {
        return true;
      }

      const allowedMimeTypes = [
        'image/png',
        'image/jpg',
        'image/jpeg',
        'image/webp',
        'image/avif',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new Error(
          'Invalid file type. Only JPG, JPEG, PNG, AVIF, and WEBP are allowed.',
        );
      }

      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Profile picture cannot be more than 2MB!');
      }

      return true;
    }),
];
