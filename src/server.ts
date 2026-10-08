import express from 'express';
import authRouter from './modules/auth/auth.routes';

const app = express();
app.use(express.json());
const PORT = 3000;

app.use('/auth', authRouter);

app.listen(PORT, () => {
  console.log(`servidor iniciado na porta ${PORT}`);
});
