import { type Request, type Response } from 'express';
import categoriesService from './categories.service';

class CategorieController {
  deleteSoft = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await categoriesService.softDelete(id, req.userId);
      console.log(result);

      res.status(200).json({ data: 'apagado com sucessfully' });
    } catch (erro) {
      res.status(404).json({ erro: erro instanceof Error ? erro.message : 'Error in server' });
    }
  };
  getUnique = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const { id } = req.params;
      const result = await categoriesService.getUniqueCategorie({ id, user_id: req.userId });
      console.log(result);

      res.status(200).json({ data: result });
    } catch (erro) {
      res.status(404).json({ erro: erro instanceof Error ? erro.message : 'Error in server' });
    }
  };
  getCategories = async (req: Request<{ id: string }>, res: Response) => {
    try {
      const result = await categoriesService.getAllCategories(req.userId);
      console.log(result);

      res.status(200).json(result);
    } catch (erro) {
      res.status(404).json({ erro: erro instanceof Error ? erro.message : 'Error in server' });
    }
  };
  update = async (req: Request<{ id: string }>, res: Response) => {
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
      res.status(400).json({
        erro: erro instanceof Error ? erro.message : 'Caegoria já existe ou nao foi encontrada',
      });
    }
  };
  create = async (req: Request, res: Response) => {
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
      res.status(400).json({ erro: erro instanceof Error ? erro.message : 'Erro no seridor' });
    }
  };
}
const categorieController = new CategorieController();
export default categorieController;
