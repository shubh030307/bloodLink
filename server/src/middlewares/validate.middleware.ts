import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const validate = (schema: any) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            path: err.path,
            message: err.message,
          })),
        });
        return;
      }

      res.status(400).json({
        error: 'Validation failed',
      });
    }
  };
};