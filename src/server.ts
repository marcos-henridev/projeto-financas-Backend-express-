import express from 'express';
import authRouter from './modules/auth/auth.routes';
import userController from './modules/users/user.controller';
import userRouter from './modules/users/user.router';
import validation from './midllewares/auth.midleware';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/auth', authRouter);
app.use('/users', validation, userRouter);

app.listen(PORT, () => {
  console.log(`servidor iniciado na porta ${PORT}`);
});
