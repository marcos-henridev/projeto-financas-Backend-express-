import dashbordService from './dashboard.service';
import { type NextFunction, type Response, type Request } from 'express';

interface UrlQuery {
  from: string;
  to: string;
}

class TotalController {
  total = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dashbordService.allAccounts({
        user_id: req.userId,
      });
      res.status(200).json(result);
    } catch (erro) {
      next(erro);
    }
  };

  getFilterQuery = async (
    req: Request<{}, {}, {}, UrlQuery>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { from, to } = req.query;

      const result = await dashbordService.GetQueryFilter({
        user_id: req.userId,
        from,
        to,
      });
      res.status(200).json(result);
    } catch (erro) {
      next(erro);
    }
  };
  pendentesQuery = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await dashbordService.filterPendentes({ user_id: req.userId });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
const totalController = new TotalController();
export default totalController;
