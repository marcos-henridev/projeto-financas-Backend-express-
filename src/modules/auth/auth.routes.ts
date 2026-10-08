import express, { Router } from 'express';
import { authController } from './auth.controller';
import validation from '../../midllewares/auth.midleware';
const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.enterLogin);
authRouter.patch('/update', validation, authController.updateUserUnique);

export default authRouter;
