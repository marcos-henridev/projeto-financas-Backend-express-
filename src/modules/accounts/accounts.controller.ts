import { type Request, type Response } from 'express';
import accountService from './accounts.service';
import accountRepository from './accounts.repository';

class AccountController {
  findAccountUrl = async (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      const accountUrl = await accountService.findAccountUrl(id, req.userId);
      res.status(200).json({ data: accountUrl, message: 'Get sucessfully account' });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Error searching for account ' });
    }
  };
  findAccountsMany = async (req: Request, res: Response) => {
    try {
      const result = await accountService.findAll(req.userId);
      res.status(200).json({ data: result });
    } catch (erro) {
      console.error(erro);
      return res.status(500).json({ erro: 'Erro ao listar contas' });
    }
  };
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
  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await accountService.deletedAccount(id as string, req.userId);

      res.status(204).send();
    } catch (erro) {
      console.error(erro);
      return res.status(404).json({ erro: 'Account notfound' });
    }
  };
  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { kind, name } = req.body;

      const updateAcc = await accountService.update({
        id: id as string,
        userId: req.userId,
        kind,
        name,
      });
      res.status(200).json({ data: updateAcc });
    } catch (erro) {
      console.error(erro);
      res.status(400).json({ erro: erro instanceof Error ? erro.message : 'Erro ao criar conta' });
    }
  };
}
const accountController = new AccountController();

export default accountController;
