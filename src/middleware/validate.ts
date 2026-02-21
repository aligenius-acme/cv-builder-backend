import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';

/**
 * Validation Middleware
 * Validates request body, query params, or URL params against Zod schemas
 */

interface ValidationError {
  field: string;
  message: string;
}

/**
 * Formats Zod errors into a more user-friendly structure
 */
const formatZodErrors = (error: ZodError): ValidationError[] => {
  return error.issues.map((err: ZodIssue) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Validates request body against a Zod schema
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(error),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
        });
      }
    }
  };
};

/**
 * Validates query parameters against a Zod schema
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: formatZodErrors(error),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
        });
      }
    }
  };
};

/**
 * Validates URL parameters against a Zod schema
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Invalid URL parameters',
          details: formatZodErrors(error),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid URL parameters',
        });
      }
    }
  };
};

/**
 * Generic validation function that can be used for custom validation logic
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[source];
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formatZodErrors(error),
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
        });
      }
    }
  };
};
