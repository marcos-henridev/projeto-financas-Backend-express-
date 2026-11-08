import express from 'express';
import helmet from 'helmet';
import authRouter from './modules/auth/auth.routes';
import userRouter from './modules/user/user.router';
import validation from './midllewares/auth.midleware';
import accountRouter from './modules/accounts/accounts.router';
import categorieRouter from './modules/categories/categories.router';
import transactionRouter from './modules/transactions/transactions.router';
import totalRouter from './modules/dashboard/dashboard.router';
import { erroMiddleware } from './errors/erro.middleware';
import corsMiddleware from './midllewares/cors.middleware';

const app = express();
app.use(helmet());
app.use(corsMiddleware); /*middleware de cors (autorization de acesso)*/
app.use(express.json());
const PORT = 3000;

app.use('/auth', authRouter);
app.use('/users', validation, userRouter);
app.use('/account', validation, accountRouter);
app.use('/categories', validation, categorieRouter);
app.use('/transaction', validation, transactionRouter);
app.use('/', validation, totalRouter);
app.use(erroMiddleware);
app.listen(PORT, () => {
  console.log(`servidor iniciado na porta ${PORT}`);
});
