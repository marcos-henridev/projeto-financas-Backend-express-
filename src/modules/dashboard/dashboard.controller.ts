import totalService from './dashboard.service';
import { type NextFunction, type Response, type Request } from 'express';

class TotalController {
  total = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await totalService.allAccounts({
        user_id: req.userId,
      });
      res.status(200).json(result);
    } catch (erro) {
      next(erro);
    }
  };
}
const totalController = new TotalController();
export default totalController;
