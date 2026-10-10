import { Router } from 'express';
import accountController from './accounts.controller';

const accountRouter = Router();

accountRouter.route('/').post(accountController.create);

export default accountRouter;
