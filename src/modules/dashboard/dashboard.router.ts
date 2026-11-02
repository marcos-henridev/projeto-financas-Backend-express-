import { Router } from 'express';
import TotalController from './dashboard.controller';
import totalController from './dashboard.controller';

const totalRouter = Router();

totalRouter.get('/dashboard/balance', totalController.total);
export default totalRouter;
