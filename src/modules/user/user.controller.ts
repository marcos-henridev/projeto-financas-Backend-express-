import { type Response, type Request } from 'express';
import userService from './user.service';
import userRepository from './user.repository';

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
      return res.status(400).json({ erro: 'Error retrieving data' });
    }
  };
  softDelete = async (req: Request, res: Response) => {
    try {
      const user = await userRepository.findUserId({ id: req.userId });
      if (!user) throw new Error('Usuario não encontrado');

      await userService.deleteId(req.userId);
      res.status(204).send();
    } catch (erro) {
      console.error(`Erro ${erro} in try exclusion user `);
      res.status(404).json({ erro: 'user notfound' });
    }
  };
}

const userController = new UserController();
export default userController;
