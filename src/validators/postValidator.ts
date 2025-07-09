import { body } from 'express-validator';

export const validatePost = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Content must be between 1 and 2000 characters.'),

  body('image')
    .optional()
    .custom((_, { req }) => {
      const file = req.file;
      const isStringInput = typeof req.body.image === 'string';

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
        throw new Error('Image cannot be more than 2MB!');
      }

      return true;
    }),
];
