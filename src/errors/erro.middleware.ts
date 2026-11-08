import { Response, Request, NextFunction } from 'express';
import { AppError } from './AppError';

export function erroMiddleware(erro: Error, req: Request, res: Response, next: NextFunction) {
  if (erro instanceof AppError) {
    return res.status(erro.statusCode).json({
      status: 'erro',
      message: erro.message,
    });
  }
  console.error(erro);

  return res.status(500).json({
    status: 'erro',
    message: 'erro interno do servidor',
  });
}
