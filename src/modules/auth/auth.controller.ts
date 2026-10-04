import { type Request, type Response } from "express";
import { authService } from "./auth.service";

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
        mensagem: "Error interno do servidor",
      });
    }
  };
}
export const authController = new AuthController();
