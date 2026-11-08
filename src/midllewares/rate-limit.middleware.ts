import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';

export const loginLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // janela de 15minutos
  limit: 5, // 5 tentativas por ip nessa janela
  standardHeaders: 'draft-7', // envia os headers RateLimit-*
  legacyHeaders: false, // desliga os antigos X-RateLimit-*
  skipSuccessfulRequests: true, // login que deu certo nao conta
  handler: (_req, _res, next) => {
    next(new AppError('Muitas tentativas de login. Tente novamente em alguns minutos', 429));
  },
});

export const registerLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // janela de 1 hora
  limit: 5, // 5 cadastros por ip
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('Muitos cadastros a partir deste IP. Tente novamente mais tarde', 429));
  },
});
