import { Response, Request, NextFunction, response } from 'express';
import { AppError } from './AppError';
import { error } from 'node:console';

export function erroMiddleware(erro: Error, req: Request, res: Response, next: NextFunction) {
  if (erro instanceof AppError) {
    return res.status(erro.statusCode).json({
      status: 'error',
      message: erro.message,
    });
  }
  console.error(erro);

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
}
