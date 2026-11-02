import { type NextFunction, type Response, type Request } from 'express';
import userService from './user.service';
import userRepository from './user.repository';
import { AppError } from '../../errors/AppError';

class UserController {
  updateUniqueUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body;
      const result = await userService.updateUser({
        userId: req.userId,
        name: name,
        email: email,
      });
      res.status(200).json(result);
      return;
    } catch (erro) {
      next(erro);
    }
  };
  getMeId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getMe(req.userId);
      return res.status(200).json(user);
    } catch (erro) {
      next(erro);
    }
  };
  softDelete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await userRepository.findUserId({ id: req.userId });
      if (!user) throw new AppError('User not found', 404);

      await userService.deleteId(req.userId);
      res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  };
}

const userController = new UserController();
export default userController;
