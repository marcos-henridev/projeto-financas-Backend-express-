import { NextFunction, type Request, type Response } from 'express';
import categoriesService from './categories.service';

class CategorieController {
  deleteSoft = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await categoriesService.softDelete(id, req.userId);
      console.log(result);

      res.status(200).json({ data: 'apagado com sucessfully' });
    } catch (erro) {
      next(erro);
    }
  };
  getUnique = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await categoriesService.getUniqueCategorie({ id, user_id: req.userId });
      console.log(result);

      res.status(200).json({ data: result });
    } catch (erro) {
      next(erro);
    }
  };
  getCategories = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const result = await categoriesService.getAllCategories(req.userId);
      console.log(result);

      res.status(200).json(result);
    } catch (erro) {
      next(erro);
    }
  };
  update = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { name, color, icon } = req.body;
      const up = await categoriesService.updateCategorie({
        id: id,
        userId: req.userId,
        name: name,
        color: color,
        icon: icon,
      });
      res.status(200).json({ data: up });
    } catch (erro) {
      next(erro);
    }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, kind, color, icon } = req.body;
      const result = await categoriesService.CreateCategorie({
        userId: req.userId,
        name: name,
        kind: kind,
        color: color,
        icon: icon,
      });
      console.log(result);
      res.status(200).json({ data: result });
    } catch (erro) {
      next(erro);
    }
  };
}
const categorieController = new CategorieController();
export default categorieController;
