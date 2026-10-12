import { Router } from 'express';
import categorieController from './categories.controller';

const categorieRouter = Router();

categorieRouter.route('/').post(categorieController.create).get(categorieController.getCategories);
categorieRouter
  .route('/:id')
  .patch(categorieController.update)
  .get(categorieController.getUnique)
  .delete(categorieController.deleteSoft);

export default categorieRouter;
