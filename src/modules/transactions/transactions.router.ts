import { Router } from 'express';
import transactionController from './transactions.controller';
const transactionRouter = Router();

transactionRouter.route('/').post(transactionController.create).get(transactionController.GetAll);
transactionRouter
  .route('/:id')
  .get(transactionController.Get)
  .delete(transactionController.DeleteTransaction)
  .patch(transactionController.NewUpdate);

transactionRouter.route('/:id/pay').patch(transactionController.transctionPaid_at);

export default transactionRouter;
