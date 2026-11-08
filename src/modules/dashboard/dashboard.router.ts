import { Router } from 'express';
import totalController from './dashboard.controller';

const totalRouter = Router();

totalRouter.get('/dashboard/balance', totalController.total);
totalRouter.get('/dashboard/sumary', totalController.getFilterQuery);
totalRouter.get('/dashboard/pendente', totalController.pendentesQuery);
totalRouter.get('/dashboard/categorias', totalController.gastosPorCategoria);
export default totalRouter;
