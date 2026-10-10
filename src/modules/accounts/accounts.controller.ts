import { type Request, type Response } from 'express';
import accountService from './accounts.service';

class AccountController {
  create = async (req: Request, res: Response) => {
    try {
      const { name, kind, initial_balance } = req.body;
      const account = await accountService.create({
        user_Id: req.userId,
        kind,
        name,
        initial_balance,
      });
      res.status(201).json({
        data: account,
        message: 'Account successfully created',
      });
    } catch (erro) {
      console.error(erro);
      res.status(400).json({
        erro: erro instanceof Error ? erro.message : 'Erro ao criar conta',
      });
    }
  };
}
const accountController = new AccountController();

export default accountController;
