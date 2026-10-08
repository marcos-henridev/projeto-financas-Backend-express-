import { type Request, type Response } from 'express';
import { authService } from './auth.service';

class AuthController {
  register = async (req: Request, res: Response) => {
    try {
      const { name, email, passaword } = await req.body;
      const userCreate = await authService.register({
        name,
        email,
        passaword,
      });
      return res.status(201).json(userCreate);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        mensagem: 'Error interno do servidor',
      });
    }
  };

  updateUserUnique = async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      const NewUpdate = await authService.update({
        name,
        email,
        userId: req.userId,
      });
      res.status(200).json(NewUpdate);
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(401).json({ erro: 'Erro ao atualizar usuario' });
    }
  };

  enterLogin = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email) return res.status(404).json({ mensagem: 'insira um email' });

      const result = await authService.login({ email, password });
      res.status(200).json(result);
    } catch (erro) {
      console.error(`Error: ${erro}`);
      return res.status(401).json({ erro: 'Erro ao fazer Log-in' });
    }
  };
}
export const authController = new AuthController();
