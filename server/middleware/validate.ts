import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.issues.map((i) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        });
      }
      return res.status(400).json({ error: 'Invalid request body' });
    }
  };
}

export const LoginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const CollectBinsSchema = z.object({
  binIds: z.array(z.string().min(1, 'Invalid bin identifier')).min(1, 'At least one bin ID must be specified'),
});

export const CreateBinSchema = z.object({
  bin_name: z.string().min(2, 'Bin name must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  coord_x: z.number().min(0).max(100),
  coord_y: z.number().min(0).max(100),
});
