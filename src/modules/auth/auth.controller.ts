import { type NextFunction, type Request, type Response } from 'express';
import { authService } from './auth.service';
import { AppError } from '../../errors/AppError';

class AuthController {
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, passaword } = await req.body;
      const userCreate = await authService.register({
        name,
        email,
        passaword,
      });
      return res.status(201).json(userCreate);
    } catch (erro) {
      next(erro);
    }
  };

  enterLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, passaword } = req.body;

      if (!email) throw new AppError('Email is required', 400);

      const result = await authService.login({ email, passaword });
      res.status(200).json(result);
    } catch (erro) {
      next(erro);
    }
  };
}
export const authController = new AuthController();
