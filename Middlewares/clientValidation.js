// middleware/clientValidation.js
import { body, validationResult } from 'express-validator';

export const validateClient = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/).withMessage('Please enter a valid phone number'),
  
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'lead', 'converted']).withMessage('Invalid status'),
  
  body('eventType')
    .optional()
    .isIn(['wedding', 'corporate', 'birthday', 'concert', 'conference', 'other'])
    .withMessage('Invalid event type'),
  
  body('source')
    .optional()
    .isIn(['website', 'referral', 'social', 'event', 'other'])
    .withMessage('Invalid source'),
  
  body('budget')
    .optional()
    .isFloat({ min: 0 }).withMessage('Budget must be a positive number'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];