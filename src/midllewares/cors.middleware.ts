import dotenv from 'dotenv';
dotenv.config();
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

const allowOrigin = (process.env.CORS_ORIGINS_ALLOW ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

export default function corsMiddleware(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  //se o header estiver vazio est liberado
  if (!origin) {
    return next();
  }
  //caso nao contenha o o oringin dentro do array  de origin liberadas cai no erro
  if (!allowOrigin.includes(origin)) {
    return next(new AppError('Origem nao permitida pelo cors', 403));
  }

  //origem permitida
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');

  //   resposta caso seja enviado o metodo OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '600');

    return res.sendStatus(204);
  }
  next();
}
