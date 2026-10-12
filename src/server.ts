import express from 'express';
import authRouter from './modules/auth/auth.routes';
import userRouter from './modules/user/user.router';
import validation from './midllewares/auth.midleware';
import accountRouter from './modules/accounts/accounts.router';
import categorieRouter from './modules/categories/categories.router';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/auth', authRouter);
app.use('/users', validation, userRouter);
app.use('/account', validation, accountRouter);
app.use('/categories', validation, categorieRouter);

app.listen(PORT, () => {
  console.log(`servidor iniciado na porta ${PORT}`);
});
