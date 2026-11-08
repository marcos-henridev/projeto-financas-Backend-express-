import { type NextFunction, type Request, type Response } from 'express';
import accountService from './accounts.service';

class AccountController {
  findAccountUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const accountUrl = await accountService.findAccountUrl(id, req.userId);
      res.status(200).json({ data: accountUrl, message: 'Get sucessfully account' });
    } catch (erro) {
      next(erro);
    }
  };
  findAccountsMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await accountService.findAll(req.userId);
      res.status(200).json({ data: result });
    } catch (erro) {
      next(erro);
    }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
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
      next(erro);
    }
  };
  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await accountService.deletedAccount(id as string, req.userId);

      res.status(204).send();
    } catch (erro) {
      next(erro);
    }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
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
      next(erro);
    }
  };
}
const accountController = new AccountController();

export default accountController;
