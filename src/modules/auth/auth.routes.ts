import { Router } from 'express';
import { authController } from './auth.controller';
import { registerLimit, loginLimit } from '../../midllewares/rate-limit.middleware';
const authRouter = Router();

authRouter.post('/register', registerLimit, authController.register);
authRouter.post('/login', loginLimit, authController.enterLogin);

export default authRouter;
