import { body, validationResult } from 'express-validator';

const validateScanUrl = [
  body('url')
    .trim()
    .isURL({ protocols: ['http', 'https'] })
    .withMessage('Please provide a valid URL'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

export { validateScanUrl };