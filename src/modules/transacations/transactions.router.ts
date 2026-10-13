import { Router } from 'express';
import transactionController from './transactions.controller';
const transactionRouter = Router();

transactionRouter.route('/').post(transactionController.create);

export default transactionRouter;
