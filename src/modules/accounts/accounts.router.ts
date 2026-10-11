import { Router } from 'express';
import accountController from './accounts.controller';

const accountRouter = Router();

accountRouter.route('/').post(accountController.create).get(accountController.findAccountsMany);
accountRouter
  .route('/:id')
  .get(accountController.findAccountUrl)
  .delete(accountController.delete)
  .patch(accountController.update);

export default accountRouter;
