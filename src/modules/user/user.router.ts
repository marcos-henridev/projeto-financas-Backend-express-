import { Router } from 'express';
import userController from './user.controller';

const userRouter = Router();

userRouter
  .route('/me')
  .patch(userController.updateUniqueUser)
  .get(userController.getMeId)
  .delete(userController.softDelete);

export default userRouter;
