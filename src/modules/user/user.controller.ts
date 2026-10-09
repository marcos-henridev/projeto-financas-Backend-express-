import { type Response, type Request } from 'express';
import userService from './user.service';

class UserController {
  updateUniqueUser = async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      const result = await userService.updateUser({
        userId: req.userId,
        name: name,
        email: email,
      });
      res.status(200).json(result);
      return;
    } catch (error) {
      console.error(`Error: ${error}`);
      return res.status(401).json({ erro: 'Erro ao atualizar usuario' });
    }
  };
  getMeId = async (req: Request, res: Response) => {
    try {
      const user = await userService.getMe(req.userId);
      return res.status(200).json(user);
    } catch (erro) {
      console.error(`Error: ${erro}`);
      return res.status(400).json({ erro: 'Erro ao mostar os dados' });
    }
  };
}

const userController = new UserController();
export default userController;
