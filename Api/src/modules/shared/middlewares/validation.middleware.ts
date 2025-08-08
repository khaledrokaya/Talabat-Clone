import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { Helpers } from '../utils/helpers';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.type === 'field' ? (error as any).path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? (error as any).value : undefined,
    }));

    res.status(400).json(
      Helpers.formatResponse(false, 'Validation failed', {
        errors: errorMessages,
      }),
    );
    return;
  }

  next();
};

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        break;
      }
    }

    // Check for validation errors
    validateRequest(req, res, next);
  };
};

// Common validation patterns
export const commonValidations = {
  email: {
    isEmail: {
      errorMessage: 'Please provide a valid email address',
    },
    normalizeEmail: true,
    toLowerCase: true,
  },

  password: {
    isLength: {
      options: { min: 6, max: 128 },
      errorMessage: 'Password must be between 6 and 128 characters',
    },
    matches: {
      options: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
      errorMessage:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  },

  name: {
    isLength: {
      options: { min: 2, max: 50 },
      errorMessage: 'Name must be between 2 and 50 characters',
    },
    matches: {
      options: /^[a-zA-Z\s]+$/,
      errorMessage: 'Name can only contain letters and spaces',
    },
    trim: true,
  },

  phone: {
    matches: {
      options: /^\+?[\d\s-()]+$/,
      errorMessage: 'Please provide a valid phone number',
    },
    isLength: {
      options: { min: 10, max: 15 },
      errorMessage: 'Phone number must be between 10 and 15 digits',
    },
  },

  mongoId: {
    isMongoId: {
      errorMessage: 'Please provide a valid ID',
    },
  },

  positiveNumber: {
    isFloat: {
      options: { min: 0 },
      errorMessage: 'Value must be a positive number',
    },
  },

  boolean: {
    isBoolean: {
      errorMessage: 'Value must be true or false',
    },
  },

  url: {
    isURL: {
      errorMessage: 'Please provide a valid URL',
    },
  },
};
